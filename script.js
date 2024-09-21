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

// Update charts based on selected company
function updateCharts() {
    const selectedSymbol = document.getElementById('companySelect').value;
    const companyData = csvData.filter(row => row.SYMBOL === selectedSymbol);

    if (companyData.length === 0) return;

    const dates = companyData.map(row => row.BUSINESS_DATE);  // Adjusted for BUSINESS_DATE
    const openPrices = companyData.map(row => parseFloat(row.OPEN_PRICE));
    const closePrices = companyData.map(row => parseFloat(row.CLOSE_PRICE));
    const tradedQuantities = companyData.map(row => parseFloat(row.TOTAL_TRADED_QUANTITY));
    const highPrices = companyData.map(row => parseFloat(row.HIGH_PRICE));
    const lowPrices = companyData.map(row => parseFloat(row.LOW_PRICE));
    const marketCaps = companyData.map(row => parseFloat(row.MARKET_CAPITALIZATION));
    const avgTradedPrices = companyData.map(row => parseFloat(row.AVERAGE_TRADED_PRICE));

    resetCharts();
    drawStockPriceChart(dates, openPrices, closePrices);
    drawTradingVolumeChart(dates, tradedQuantities);
    drawHighLowPriceChart(dates, highPrices, lowPrices);
    drawMarketCapChart(dates, marketCaps);
    drawAvgTradedPriceChart(dates, avgTradedPrices);
}

// Helper function to draw Stock Price chart
function drawStockPriceChart(dates, openPrices, closePrices) {
    const ctx = document.getElementById('stockPriceChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Open Price',
                    data: openPrices,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2
                },
                {
                    label: 'Close Price',
                    data: closePrices,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Price' }, beginAtZero: false }
            }
        }
    });
    charts.push(chart);
}

// Draw High-Low Price chart
function drawHighLowPriceChart(dates, highPrices, lowPrices) {
    const ctx = document.getElementById('highLowPriceChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'High Price',
                    data: highPrices,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderWidth: 2
                },
                {
                    label: 'Low Price',
                    data: lowPrices,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Price' }, beginAtZero: false }
            }
        }
    });
    charts.push(chart);
}

// Draw Trading Volume chart
function drawTradingVolumeChart(dates, tradedQuantities) {
    const ctx = document.getElementById('tradingVolumeChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Traded Quantity',
                data: tradedQuantities,
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Quantity' }, beginAtZero: true }
            }
        }
    });
    charts.push(chart);
}

// Draw Market Capitalization chart
function drawMarketCapChart(dates, marketCaps) {
    const ctx = document.getElementById('marketCapChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Market Capitalization',
                data: marketCaps,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Market Cap' }, beginAtZero: true }
            }
        }
    });
    charts.push(chart);
}

// Draw Average Traded Price chart
function drawAvgTradedPriceChart(dates, avgTradedPrices) {
    const ctx = document.getElementById('avgTradedPriceChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Average Traded Price',
                data: avgTradedPrices,
                borderColor: 'rgba(255, 205, 86, 1)',
                backgroundColor: 'rgba(255, 205, 86, 0.2)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Price' }, beginAtZero: false }
            }
        }
    });
    charts.push(chart);
}

// Reset and destroy existing charts
function resetCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
}

window.onload = fetchCSVFromS3;
