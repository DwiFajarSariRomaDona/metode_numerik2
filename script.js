// newton-gregory.js

// Function to parse input string into array of numbers
function parseInput(input) {
    return input.split(',').map(Number);
}

// Function to compute forward Newton-Gregory difference table
function newtonGregoryForward(x, y) {
    let n = y.length;
    let diff = Array.from(Array(n), () => Array(n).fill(0));
    
    // Initialize the first column with y values
    for (let i = 0; i < n; i++) {
        diff[i][0] = y[i];
    }
    
    // Compute the rest of the difference table
    for (let j = 1; j < n; j++) {
        for (let i = 0; i < n - j; i++) {
            diff[i][j] = diff[i + 1][j - 1] - diff[i][j - 1];
        }
    }
    
    return diff;
}

// Function to evaluate Newton-Gregory forward interpolation
function evaluateNewtonGregory(x, diff, value) {
    let n = diff.length;
    let result = diff[0][0];
    let product = 1.0;
    
    for (let i = 1; i < n; i++) {
        product *= (value - x[i - 1]);
        result += diff[0][i] * product / factorial(i);
    }
    
    return result;
}

// Function to compute backward Newton-Gregory difference table
function newtonGregoryBackward(x, y) {
    let n = y.length;
    let diff = Array.from(Array(n), () => Array(n).fill(0));
    
    // Initialize the first column with y values
    for (let i = 0; i < n; i++) {
        diff[i][0] = y[i];
    }
    
    // Compute the rest of the difference table
    for (let j = 1; j < n; j++) {
        for (let i = n - 1; i >= j; i--) {
            diff[i][j] = diff[i][j - 1] - diff[i - 1][j - 1];
        }
    }
    
    return diff;
}

// Function to evaluate Newton-Gregory backward interpolation
function evaluateNewtonGregoryBackward(x, diff, value) {
    let n = diff.length;
    let result = diff[n - 1][0];
    let product = 1.0;
    
    for (let i = 1; i < n; i++) {
        product *= (value - x[n - i]);
        result += diff[n - 1][i] * product / factorial(i);
    }
    
    return result;
}

// Function to evaluate Newton-Gregory forward interpolation at middle points
function evaluateNewtonGregoryMidPoints(x, diff) {
    let midPoints = [];
    for (let i = 0; i < x.length - 1; i++) {
        let midValue = (x[i] + x[i + 1]) / 2;
        midPoints.push(evaluateNewtonGregory(x, diff, midValue));
    }
    return midPoints;
}

// Function to evaluate Newton-Gregory backward interpolation at middle points
function evaluateNewtonGregoryBackwardMidPoints(x, diff) {
    let midPoints = [];
    for (let i = 0; i < x.length - 1; i++) {
        let midValue = (x[i] + x[i + 1]) / 2;
        midPoints.push(evaluateNewtonGregoryBackward(x, diff, midValue));
    }
    return midPoints;
}

// Function to compute factorial
function factorial(num) {
    if (num <= 1) return 1;
    return num * factorial(num - 1);
}

// Function to format number output
function formatNumber(num) {
    return num % 1 === 0 ? num.toString() : num.toFixed(5).replace(/\.?0+$/, '');
}

// Function to create HTML table for difference table
function createTable(diff, id, title, x) {
    let table = `<h3>${title}</h3><table class="table table-bordered"><thead><tr><th>X</th><th>f(X)</th><th>Δf</th><th>Δ² f</th><th>Δ³ f</th></tr></thead><tbody>`;

    for (let i = 0; i < diff.length; i++) {
        table += `<tr><td>${x[i]}</td><td>${diff[i][0]}</td><td>${diff[i][1] || ''}</td><td>${diff[i][2] || ''}</td><td>${diff[i][3] || ''}</td></tr>`;
    }

    table += '</tbody></table>';
    document.getElementById(id).innerHTML = table;
}

// Function to plot chart using Canvas API
function plotChart(chartId, x, y, midPoints, title) {
    const canvas = document.getElementById(chartId);
    const ctx = canvas.getContext('2d');
    
    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up the chart dimensions and scales
    const padding = 40;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const yMin = Math.min(...y);
    const yMax = Math.max(...y, ...midPoints);

    const xScale = width / (xMax - xMin);
    const yScale = height / (yMax - yMin);

    // Draw the chart axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Plot the data points
    ctx.fillStyle = 'red';
    for (let i = 0; i < x.length; i++) {
        const xPos = padding + (x[i] - xMin) * xScale;
        const yPos = canvas.height - padding - (y[i] - yMin) * yScale;
        ctx.beginPath();
        ctx.arc(xPos, yPos, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Plot the middle points for interpolation
    ctx.fillStyle = 'blue';
    for (let i = 0; i < midPoints.length; i++) {
        const midX = (x[i] + x[i + 1]) / 2;
        const xPos = padding + (midX - xMin) * xScale;
        const yPos = canvas.height - padding - (midPoints[i] - yMin) * yScale;
        
        // Draw a triangle marker for mid points
        ctx.beginPath();
        ctx.moveTo(xPos, yPos - 5);
        ctx.lineTo(xPos + 5, yPos + 5);
        ctx.lineTo(xPos - 5, yPos + 5);
        ctx.closePath();
        ctx.fill();
        
        // Add text annotation for mid points
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(`Mid Point ${i+1}: ${formatNumber(midPoints[i])}`, xPos, yPos - 10);
    }

    // Add title
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, padding / 2);
}

// Function to handle button click event for calculating Newton-Gregory forward interpolation
function calculateNewtonGregory() {
    let x = parseInput(document.getElementById('xValues').value);
    let y = parseInput(document.getElementById('yValues').value);
    let value = parseFloat(document.getElementById('interpolationValue').value);

    if (x.length !== y.length) {
        alert("Number of X and Y values must be the same.");
        return;
    }

    let diff = newtonGregoryForward(x, y);
    let result = evaluateNewtonGregory(x, diff, value);
    let midPoints = evaluateNewtonGregoryMidPoints(x, diff);
    
    document.getElementById('resultNG').innerText = `Forward interpolation result for x = ${value}: ${formatNumber(result)}`;
    createTable(diff, 'tableNG', 'Forward Difference Table', x);

    // Plot chart for forward interpolation
    plotChart('chartNG', x, y, midPoints, 'Forward Interpolation Graph');
}

// Function to handle button click event for calculating Newton-Gregory backward interpolation
function calculateNewtonGregoryBackward() {
    let x = parseInput(document.getElementById('xValues').value);
    let y = parseInput(document.getElementById('yValues').value);
    let value = parseFloat(document.getElementById('interpolationValue').value);

    if (x.length !== y.length) {
        alert("Number of X and Y values must be the same.");
        return;
    }

    let diff = newtonGregoryBackward(x, y);
    let result = evaluateNewtonGregoryBackward(x, diff, value);
    let midPoints = evaluateNewtonGregoryBackwardMidPoints(x, diff);
    
    document.getElementById('resultNGB').innerText = `Backward interpolation result for x = ${value}: ${formatNumber(result)}`;
    createTable(diff, 'tableNGB', 'Backward Difference Table', x);

    // Plot chart for backward interpolation
    plotChart('chartNGB', x, y, midPoints, 'Backward Interpolation Graph');
}

// Add event listeners to buttons
document.getElementById('calculateNG').addEventListener('click', calculateNewtonGregory);
document.getElementById('calculateNGB').addEventListener('click', calculateNewtonGregoryBackward);
