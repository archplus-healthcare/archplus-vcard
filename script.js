window.addEventListener("load", () => {            
    const loader = document.getElementById("loader");

    setTimeout(() => {
        loader.style.opacity = "0";
        loader.style.transition = "opacity 0.8s ease";

        setTimeout(() => {
            loader.style.display = "none";
        }, 600);
    }, 1200); // loader visible time
});

function saveContact() {
    const link = document.createElement("a");
    link.href = "contact.vcf";
    link.download = "ArchPlus-Healthcare.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function myFunction() {
    var x = document.getElementById("panel");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

// LOADER HIDE
window.addEventListener("load", function () {
    setTimeout(function () {
        const loader = document.getElementById("loader");
        if (loader) {
            loader.style.opacity = "0";
            loader.style.pointerEvents = "none";
            setTimeout(() => loader.style.display = "none", 500);
        }
    }, 1800); // 1.8 sec loading
});



const pdfData = {
    services: [
        { name: "Test PDF", file: "pdfs/test.pdf", icon: "images/icons/test.png" },
        { name: "Stretcher pdf", file: "pdfs/stretcher.pdf", icon: "images/icons/stretcher.png" }
    ],
    diagnostic: [
        { name: "MRI Scan Service", file: "pdfs/mri.pdf", icon: "images/icons/mri.png" },
        { name: "Stretcher pdf", file: "pdfs/stretcher.pdf", icon: "images/icons/stretcher.png" }
    ],
    report: []
};

// Example data (jitna add karoge utna page banega)
for (let i = 1; i <= 200; i++) {
    pdfData.services.push({
        name: "Service PDF " + i,
        file: "pdfs/s" + i + ".pdf"
    });
}

let currentPage = 1;
const itemsPerPage = 18;
let lastPage = 1;

function renderList(dataArray) {

    const container = document.getElementById("pdfContainer");
    container.innerHTML = "";

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;

    let pageItems = dataArray.slice(start, end);

    pageItems.forEach(item => {

        container.innerHTML += `
        <div class="pdf-card">

            <div class="pdf-thumb" onclick="openPDF('${item.file}')">
            <img src="${item.icon}" alt="pdf icon">
            </div>

            <div class="pdf-title">${item.name}</div>

        </div>
        `;
    });

    renderPagination(dataArray);
}

function renderPagination(dataArray) {

    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    let totalPages = Math.ceil(dataArray.length / itemsPerPage);
    if (totalPages <= 1) return;

    // Prev
    if (currentPage > 1) {
        pagination.innerHTML +=
            `<button onclick="changePage(${currentPage - 1})">Prev</button>`;
    }

    // Always show First Page
    pagination.innerHTML += `
        <button class="${currentPage === 1 ? 'active' : ''}"
        onclick="changePage(1)">1</button>
    `;

    let startPage, endPage;

    if (totalPages > 5) {

        if (currentPage > lastPage) {
            // NEXT direction
            startPage = currentPage - 3;
            endPage = currentPage + 1;
        }
        else if (currentPage < lastPage) {
            // PREV direction
            startPage = currentPage - 1;
            endPage = currentPage + 3;
        }
        else {
            startPage = currentPage - 2;
            endPage = currentPage + 2;
        }

        if (startPage < 2) startPage = 2;
        if (endPage > totalPages - 1) endPage = totalPages - 1;

        // Left dots
        if (startPage > 2) {
            pagination.innerHTML += `<span>...</span>`;
        }

        // Middle pages (5 window)
        for (let i = startPage; i <= endPage; i++) {
            pagination.innerHTML += `
            <button class="${i === currentPage ? 'active' : ''}"
            onclick="changePage(${i})">${i}</button>`;
        }

        // Right dots
        if (endPage < totalPages - 1) {
            pagination.innerHTML += `<span>...</span>`;
        }

        // Always show Last Page
        pagination.innerHTML += `
            <button class="${currentPage === totalPages ? 'active' : ''}"
            onclick="changePage(${totalPages})">${totalPages}</button>
        `;
    }

    // Next
    if (currentPage < totalPages) {
        pagination.innerHTML +=
            `<button onclick="changePage(${currentPage + 1})">Next</button>`;
    }
}

function changePage(page) {
    lastPage = currentPage;
    currentPage = page;
    renderList(pdfData[category]);
}

function openPDF(file) {
    window.open(file, "_blank");
}

function toggleMenu(icon) {
    let menu = icon.nextElementSibling;
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function searchData() {
    let value = document.getElementById("searchInput").value.toLowerCase();
    let filtered = pdfData[category].filter(item =>
        item.name.toLowerCase().includes(value)
    );
    currentPage = 1;
    renderList(filtered);
}

// Auto Suggestion
document.getElementById("searchInput").addEventListener("input", function () {

    let value = this.value.toLowerCase();
    let suggestionBox = document.getElementById("suggestions");
    suggestionBox.innerHTML = "";

    if (value === "") {
        suggestionBox.style.display = "none";
        renderList(pdfData[category]);
        return;
    }

    let filtered = pdfData[category].filter(item =>
        item.name.toLowerCase().includes(value)
    );

    filtered.forEach(item => {
        suggestionBox.innerHTML += `
        <div onclick="selectSuggestion('${item.name}')">${item.name}</div>
        `;
    });

    suggestionBox.style.display = "block";
});

function selectSuggestion(text) {
    document.getElementById("searchInput").value = text;
    document.getElementById("suggestions").style.display = "none";
    searchData();
}

// Initial Load
renderList(pdfData[category]);
