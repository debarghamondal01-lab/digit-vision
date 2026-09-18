// script.js — Digit Vision
const API_URL = window.location.origin;
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

// ===== Canvas Setup =====
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = '#000000';
ctx.lineWidth = 18;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

let isDrawing = false;
let lastX = 0;
let lastY = 0;

// ===== Drawing Handlers =====
function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    }
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCoords(e);
    lastX = x;
    lastY = y;
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
}

function stopDrawing(e) {
    if (e) e.preventDefault();
    isDrawing = false;
}

// Mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing, { passive: false });
canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

// ===== Clear Canvas =====
document.getElementById('clearBtn').addEventListener('click', () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById('predictedDigit').textContent = '—';
    document.getElementById('confidenceText').textContent = 'Draw a digit and click Predict';
    document.getElementById('top3List').innerHTML = '<p class="placeholder">Waiting for input...</p>';
});

// ===== Predict =====
document.getElementById('predictBtn').addEventListener('click', async () => {
    const predictBtn = document.getElementById('predictBtn');
    const predictedDigit = document.getElementById('predictedDigit');
    const confidenceText = document.getElementById('confidenceText');
    const top3List = document.getElementById('top3List');

    predictBtn.disabled = true;
    predictBtn.textContent = '⏳ Analyzing...';
    predictedDigit.textContent = '…';
    confidenceText.textContent = 'Running CNN inference...';

    try {
        // Convert canvas to base64 PNG
        const dataURL = canvas.toDataURL('image/png');

        const res = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataURL })
        });

        const data = await res.json();

        if (data.error) {
            predictedDigit.textContent = '⚠️';
            confidenceText.textContent = 'Error: ' + data.error;
            top3List.innerHTML = '<p class="placeholder">Try again</p>';
            return;
        }

        // Show main prediction
        predictedDigit.textContent = data.predicted_digit;
        confidenceText.textContent = `Confidence: ${data.confidence}%`;

        // Build top 3 rows
        top3List.innerHTML = '';
        data.top_3.forEach(item => {
            const row = document.createElement('div');
            row.className = 'top3-row';
            row.innerHTML = `
                <span class="top3-digit">${item.digit}</span>
                <div class="top3-bar">
                    <div class="top3-bar-fill" style="width: ${item.confidence}%"></div>
                </div>
                <span class="top3-confidence">${item.confidence}%</span>
            `;
            top3List.appendChild(row);
        });

    } catch (err) {
        console.error('❌ Predict error:', err);
        predictedDigit.textContent = '⚠️';
        confidenceText.textContent = 'Could not reach server';
        top3List.innerHTML = '<p class="placeholder">Is the server running?</p>';
    } finally {
        predictBtn.disabled = false;
        predictBtn.textContent = '🔍 Predict';
    }
});
// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
    localStorage.setItem('digit-vision-theme', theme);
}

// Load saved theme on startup
const savedTheme = localStorage.getItem('digit-vision-theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
});
