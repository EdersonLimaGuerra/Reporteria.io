// Hardcoded Users (Simulating a Database)
const users = {
    "ederson": { pass: "123", allowed: ["report2"] },
    "victor": { pass: "Global", allowed: ["report2", "report3"] },
    "admin": { pass: "admin", allowed: ["report2", "report3"] }
};

let currentUser = null;

// DOM Elements
var el = document.getElementById("wrapper");
var loginSection = document.getElementById("login-section");
var toggleButton = document.getElementById("menu-toggle");
var reportContainer = document.getElementById("report-container");
var iframe = document.getElementById("powerbi-frame");
var loadingSpinner = document.getElementById("loading-spinner");
var placeholderMessage = document.getElementById("placeholder-message");
var reportTitle = document.getElementById("report-title");
var externalLink = document.getElementById("external-link");

// Toggle Sidebar
toggleButton.onclick = function () {
    el.classList.toggle("toggled");
};

// Report Data
const reports = {
    report1: "https://app.powerbi.com/reportEmbed?reportId=e5b695f5-3b3b-4ea9-a0e3-ab768b09d8eb&autoAuth=true&ctid=9abd5502-ffb5-4e96-8132-dc94e37b1d20",
    report2: "https://app.powerbi.com/reportEmbed?reportId=23dbe468-4bf8-4180-9d5a-349b8726e82e&autoAuth=true&ctid=9abd5502-ffb5-4e96-8132-dc94e37b1d20",
    report3: "https://app.powerbi.com/view?r=eyJrIjoiEXAMPLE_URL_3",
    report4: "https://app.powerbi.com/view?r=eyJrIjoiEXAMPLE_URL_4"
};

// Login Function
function login() {
    const usernameInput = document.getElementById("username").value.trim().toLowerCase();
    const passwordInput = document.getElementById("password").value;
    const errorMsg = document.getElementById("login-error");

    if (users[usernameInput] && users[usernameInput].pass === passwordInput) {
        currentUser = users[usernameInput];
        // Hide Login, Show App
        loginSection.classList.remove('d-flex');
        loginSection.classList.add('d-none');
        el.classList.remove('d-none');


        // Setup Navigation based on permissions
        setupNavigation();
    } else {
        errorMsg.style.display = 'block';
    }
}

// Function to filter sidebar items
function setupNavigation() {
    const listItems = document.querySelectorAll('.list-group-item');
    let firstAllowed = null;

    listItems.forEach(item => {
        // We need to identify which report this item is for.
        // We'll rely on the onclick attribute for simplicity given strict parsing isn't easy here without data attributes.
        // Let's match the onclick string "loadReport('reportX'".
        const onclickAttr = item.getAttribute('onclick');
        const match = onclickAttr.match(/'([^']+)'/);

        if (match) {
            const reportKey = match[1];
            if (currentUser.allowed.includes(reportKey)) {
                item.style.display = 'block'; // Ensure it's visible
                if (!firstAllowed) firstAllowed = item;
            } else {
                item.style.display = 'none'; // Hide unauthorized reports
            }
        }
    });

    // Automatically load the first allowed report
    if (firstAllowed) {
        firstAllowed.click();
    } else {
        // Handle case with no reports
        placeholderMessage.innerHTML = "<h3>No tienes reportes asignados</h3>";
    }
}

// Function to load report
function loadReport(reportId, element) {
    // Security Check
    if (!currentUser || !currentUser.allowed.includes(reportId)) {
        alert("No tienes permiso para ver este reporte.");
        return;
    }

    // 1. Update Active State in Sidebar
    const listItems = document.querySelectorAll('.list-group-item');
    listItems.forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    // Update Title
    const reportName = element.innerText.trim();
    reportTitle.innerText = reportName;

    // 2. Show Loading State
    iframe.style.opacity = '0';
    placeholderMessage.style.display = 'block';
    loadingSpinner.style.display = 'inline-block';
    placeholderMessage.querySelector('h3').innerText = "Cargando reporte...";
    placeholderMessage.querySelector('p').innerText = "Por favor espera un momento";

    // 3. Load URL
    const url = reports[reportId];

    if (url.includes("EXAMPLE_URL")) {
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            placeholderMessage.querySelector('h3').innerText = "Reporte no disponible";
            placeholderMessage.querySelector('p').innerHTML = "Este es un <span class='text-info'>ejemplo</span>.";
        }, 1000);
    } else {
        // Clear iframe before loading new source to avoid "sticky" previous content
        iframe.src = "about:blank";

        // Use a short delay before setting new src to ensure clean state
        setTimeout(() => {
            iframe.src = url;

            // Show iframe almost immediately for public reports to avoid perceived lag
            // If it's a public report (starts with /view?r=), we can be bolder
            if (url.includes("/view?r=")) {
                setTimeout(() => {
                    loadingSpinner.style.display = 'none';
                    placeholderMessage.style.display = 'none';
                    iframe.style.opacity = '1';
                }, 1000);
            }
        }, 50);

        // Show/Update External Link Button
        if (url.includes("https")) {
            externalLink.href = url;
            externalLink.classList.remove('d-none');
        } else {
            externalLink.classList.add('d-none');
        }

        iframe.onload = function () {
            loadingSpinner.style.display = 'none';
            placeholderMessage.style.display = 'none';
            iframe.style.opacity = '1';
        };

        // Fallback for slower connections
        setTimeout(() => {
            if (iframe.style.opacity === '0' && !url.includes("EXAMPLE_URL")) {
                loadingSpinner.style.display = 'none';
                placeholderMessage.style.display = 'none';
                iframe.style.opacity = '1';
            }
        }, 5000);
    }
}

// Enable Enter key on password field
document.getElementById("password").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        login();
    }
});
