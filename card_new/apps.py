from flask import Flask, render_template, request, jsonify
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import timedelta

# LSTM IMPORT
from keras.models import load_model
import pickle

app = Flask(__name__)

# ---------------- LOAD MODEL ----------------
model = load_model("model.h5")

with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)


# ---------------- LSTM PREDICTION FUNCTION ----------------
def lstm_predict(close_prices, future_steps):

    print("🔥 LSTM PREDICTION RUNNING...")   # 👈 ADD THIS

    data = close_prices.values.reshape(-1,1)

    scaled = scaler.transform(data)

    last_60 = scaled[-60:]

    predictions = []

    current_input = last_60

    for i in range(future_steps):

        current_input_reshaped = current_input.reshape(1,60,1)

        pred = model.predict(current_input_reshaped, verbose=0)

        predictions.append(pred[0][0])

        current_input = np.append(current_input[1:], pred)

    predictions = np.array(predictions).reshape(-1,1)

    predictions = scaler.inverse_transform(predictions)

    return predictions.flatten().tolist()


# ---------------- HOME ----------------
@app.route("/")
def home():
    return render_template("index.html")


# ---------------- LIVE TICKER ----------------
@app.route("/ticker")
def ticker():

    symbols = ["^NSEI","RELIANCE.NS","TCS.NS","HDFCBANK.NS","INFY.NS","BTC-USD","ETH-USD"]

    data = []
    for s in symbols:
        try:
            price = yf.Ticker(s).history(period="1d")["Close"].iloc[-1]
            data.append(f"{s} : ₹ {round(price,2)}")
        except:
            pass

    return jsonify(data)


# ---------------- MAIN PREDICTION ----------------
@app.route("/price")
def price():

    try:
        symbol = request.args.get("symbol")
        tf = request.args.get("tf")

        stock = yf.Ticker(symbol)

        # -------- DATA LOAD --------
        hist = stock.history(period="5y")

        if hist.empty:
            return jsonify({"status":"error"})

        close = hist["Close"].dropna()

        # -------- CONFIG --------
        config = {
            "1D":{"past":7,"future":1,"freq":"D"},
            "1M":{"past":30,"future":7,"freq":"D"},
            "3M":{"past":60,"future":15,"freq":"D"},
            "6M":{"past":120,"future":30,"freq":"D"},
            "1Y":{"past":200,"future":60,"freq":"D"},
            "5Y":{"past":300,"future":120,"freq":"D"},
            "10Y":{"past":500,"future":200,"freq":"D"},
        }

        cfg = config[tf]

        data = close.dropna()

        # -------- GRAPH HISTORY --------
        past_data = data.tail(cfg["past"])

        # -------- LSTM PREDICTION --------
        graph_prediction = lstm_predict(data, cfg["future"])

        # -------- FUTURE DATES --------
        future_dates = []
        last_date = past_data.index[-1]

        for i in range(cfg["future"]):
            next_date = last_date + timedelta(days=i+1)
            future_dates.append(next_date.strftime("%Y-%m-%d"))

        # -------- TABLE PREDICTION --------
        table_prediction = lstm_predict(data, cfg["future"])

        # -------- SIMPLE TREND --------
        trend = "UPTREND" if table_prediction[-1] > close.iloc[-1] else "DOWNTREND"

        return jsonify({
            "status":"success",
            "symbol":symbol,
            "price":round(float(close.iloc[-1]),2),
            "trend":trend,
            "support":round(float(close.tail(100).min()),2),
            "resistance":round(float(close.tail(100).max()),2),
            "target":round(table_prediction[-1],2),
            "dates":[d.strftime("%Y-%m-%d") for d in past_data.index],
            "future_dates":future_dates,
            "closes":[round(float(v),2) for v in past_data],
            "prediction":[round(float(v),2) for v in graph_prediction],
            "table_prediction":[round(float(v),2) for v in table_prediction],
            "mode":"day"
        })

    except Exception as e:
        print(e)
        return jsonify({"status":"error"})


if __name__ == "__main__":
    app.run(debug=True)