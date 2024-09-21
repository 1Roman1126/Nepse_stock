// Configure AWS Amplify
Amplify.configure({
    Storage: {
        AWSS3: {
            bucket: 'nepse-stock-data', // Replace with your bucket name
            region: 'us-east-1', // Replace with your bucket's region
        }
    }
});

let csvData = [];
let charts = [];  // Track chart instances

// List all objects in the S3 bucket
async function listFiles() {
    try {
        const files = await Amplify.Storage.list(''); // List all files in the bucket
        console.log('Files in S3 bucket:', files);
        
        // Display the list of files dynamically in the UI
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = ''; // Clear previous list
        files.forEach(file => {
            const listItem = document.createElement('li');
            listItem.textContent = file.key;
            listItem.onclick = () => getFile(file.key); // Add click event to fetch the file
            fileList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error listing files:', error);
    }
}

// Get a specific file from S3 and parse the CSV
async function getFile(fileName) {
    try {
        const fileUrl = await Amplify.Storage.get(fileName); // Get file URL
        console.log('File URL:', fileUrl);
        
        // Fetch the file content if it's a CSV, for example
        const response = await fetch(fileUrl);
        const csvContent = await response.text();
        console.log('CSV Content:', csvContent);

        // Parse the CSV content (using PapaParse or your preferred CSV parser)
        parseCSVData(csvContent);
    } catch (error) {
        console.error('Error fetching file:', error);
    }
}

// Parse the CSV data
function parseCSVData(csvText) {
    Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            csvData = results.data;
            console.log("Parsed Data: ", csvData); // Check parsed CSV data
            updateCharts();
        }
    });
}

// Update charts or UI based on the parsed CSV data
function updateCharts() {
    if (csvData.length === 0) return;

    // For example, extract symbols and stock prices
    const symbols = [...new Set(csvData.map(row => row.SYMBOL))];
    const dates = csvData.map(row => row.BUSINESS_DATE);
    const openPrices = csvData.map(row => parseFloat(row.OPEN_PRICE));
    const closePrices = csvData.map(row => parseFloat(row.CLOSE_PRICE));

    console.log('Symbols: ', symbols);
    console.log('Dates: ', dates);
    console.log('Open Prices: ', openPrices);
    console.log('Close Prices: ', closePrices);

    // Add code here to update charts or other UI components with the parsed CSV data
    // You can use Chart.js or other libraries to visualize the data
}

// Fetch and display the list of files on page load
window.onload = function() {
    listFiles();  // Automatically list files in S3 bucket when the page loads
}
