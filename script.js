// Hardcoded Users (Simulating a Database)
const users = {
    "ederson": { pass: "123", allowed: ["report2"] },
    "victor": { pass: "Global", allowed: ["report2"] },
    "admin": { pass: "admin", allowed: ["report1", "report2", "report3", "report4"] }
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

// Toggle Sidebar
toggleButton.onclick = function () {
    el.classList.toggle("toggled");
};

// Report Data
const reports = {
    report1: "https://app.powerbi.com/reportEmbed?reportId=e5b695f5-3b3b-4ea9-a0e3-ab768b09d8eb&autoAuth=true&ctid=9abd5502-ffb5-4e96-8132-dc94e37b1d20",
    report2: "https://app.powerbi.com/reportEmbed?reportId=e406f940-c8fb-43d1-adbc-536e8843fcde&autoAuth=true&ctid=9abd5502-ffb5-4e96-8132-dc94e37b1d20",
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

    // 2. Show Loading State
    iframe.style.display = 'none';
    placeholderMessage.style.display = 'block';
    loadingSpinner.style.display = 'inline-block';
    placeholderMessage.querySelector('h3').innerText = "Cargando reporte...";
    placeholderMessage.querySelector('p').innerText = "Por favor espera un momento";

    // 3. Load URL
    const url = reports[reportId];

    // Check if it's a dummy URL
    if (url.includes("EXAMPLE_URL")) {
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
            placeholderMessage.querySelector('h3').innerText = "Reporte no disponible";
            placeholderMessage.querySelector('p').innerHTML = "Este es un <span class='text-info'>ejemplo</span>.";
        }, 1000);
    } else {
        iframe.src = url;

        iframe.onload = function () {
            loadingSpinner.style.display = 'none';
            placeholderMessage.style.display = 'none';
            iframe.style.display = 'block';
        };

        // Timeout fallback
        setTimeout(() => {
            if (iframe.style.display === 'none' && !url.includes("EXAMPLE_URL")) {
                loadingSpinner.style.display = 'none';
                placeholderMessage.style.display = 'none';
                iframe.style.display = 'block';
            }
        }, 2000);
    }
}

// Enable Enter key on password field
document.getElementById("password").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        login();
    }
});

