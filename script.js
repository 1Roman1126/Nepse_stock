let csvData = [];
let charts = [];  // Track chart instances

// Configure AWS Amplify
Amplify.configure({
    Auth: {
        // Your AWS Amplify settings here if using Cognito
    },
    Storage: {
        region: 'us-east-1', // Your S3 region
        bucket: 'nepse-stock-data', // Your S3 bucket name
    }
});

// List and fetch the latest CSV file from the S3 bucket
async function fetchLatestCSVFromS3() {
    try {
        // List all objects in the bucket
        const list = await Amplify.Storage.list('', { level: 'public' }); // List all files
        const csvFiles = list.filter(file => file.key.endsWith('.csv'));  // Filter only CSV files
        
        // Sort the CSV files by the date in the filename (assuming filenames are like nepse_data_YYYY-MM-DD.csv)
        csvFiles.sort((a, b) => new Date(b.key.split('_')[2].replace('.csv', '')) - new Date(a.key.split('_')[2].replace('.csv', '')));

        // Get the most recent file
        const latestFile = csvFiles[0];
        console.log("Latest file:", latestFile.key);  // Check which file was selected

        // Fetch the latest CSV file
        const fileUrl = await Amplify.Storage.get(latestFile.key, { level: 'public' }); // Get the public URL of the latest file
        const response = await fetch(fileUrl);
        const csvText = await response.text();
        
        parseCSVData(csvText);  // Parse and visualize the CSV data
    } catch (error) {
        console.error("Error fetching the latest CSV from S3:", error);
    }
}

// Parse the fetched CSV data using PapaParse
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
                x: { title: { display: true, text: '
