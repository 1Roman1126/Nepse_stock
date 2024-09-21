let csvData = [];
let charts = [];  // Track chart instances

// Fetch the CSV file from the public S3 URL when the page loads
async function fetchCSVFromS3() {
    try {
        const fileUrl = 'https://nepse-stock-data.s3.amazonaws.com/nepse_data_2024-09-18.csv';  // Replace with your actual S3 file URL
        const response = await fetch(fileUrl);
        const csvText = await response.text();
        console.log(csvText);  // Check the fetched CSV content

        parseCSVData(csvText);
    } catch (error) {
        console.error("Error fetching CSV from S3:", error);
    }
}

// Parse the fetched CSV data using PapaParse and populate charts
function parseCSVData(csvText) {
    Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            csvData = results.data;
            console.log("Parsed Data: ", csvData);  // Check the parsed CSV data
            populateCompanySelect();
        }
    });
}

// Populate company selection dropdown
function populateCompanySelect() {
    const select = document.getElementById('companySelect');
    const symbols = [...new Set(csvData.map(row => row.SYMBOL))];
    
    console.log("Symbols: ", symbols);  // Log the symbols to check if this part is working
    
    select.innerHTML = '';

    symbols.forEach(symbol => {
        if (symbol && symbol !== 'undefined') {  // Skip undefined symbols
            const option = document.createElement('option');
            option.value = symbol;
            option.text = symbol;
            select.add(option);
        }
    });

    if (symbols.length > 0) {
        select.value = symbols[0];
        updateCharts();
    }

    select.addEventListener('change', updateCharts);
}

// Update charts based on selected companies (for comparison)
function updateCharts() {
    const selectedSymbols = Array.from(document.getElementById('companySelect').selectedOptions).map(option => option.value);
    const companyData = csvData.filter(row => selectedSymbols.includes(row.SYMBOL));

    if (companyData.length === 0) return;

    // Clear existing charts before drawing new ones
    resetCharts();

    selectedSymbols.forEach(symbol => {
        const symbolData = companyData.filter(row => row.SYMBOL === symbol);
        const dates = symbolData.map(row => row.BUSINESS_DATE);
        const closePrices = symbolData.map(row => parseFloat(row.CLOSE_PRICE));

        // Draw or update the chart for each selected company
        drawComparisonChart(symbol, dates, closePrices);
    });
}

// Function to draw or update the comparison chart
function drawComparisonChart(symbol, dates, closePrices) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    if (!window.myComparisonChart) {
        window.myComparisonChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: []
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Price' } }
                }
            }
        });
    }
    const newDataset = {
        label: symbol,
        data: closePrices,
        borderColor: getRandomColor(),  // Function to generate a random color for each dataset
        fill: false
    };
    window.myComparisonChart.data.datasets.push(newDataset);
    window.myComparisonChart.update();
}

// Function to generate random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Reset and destroy existing charts
function resetCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
    if (window.myComparisonChart) {
        window.myComparisonChart.destroy();
        window.myComparisonChart = null;
    }
}

// Load the CSV data from S3 when the page loads
window.onload = fetchCSVFromS3;
