<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MongoDB Connection Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .status {
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .btn {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        .btn:hover { background: #0056b3; }
        .btn:disabled { background: #6c757d; cursor: not-allowed; }
        .result {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
            white-space: pre-wrap;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 MongoDB Connection Test</h1>
        <p>Test your MongoDB connection and create sample collections.</p>
        
        <div class="status info">
            <strong>Instructions:</strong> Click the buttons below to test your MongoDB connection step by step.
        </div>
        
        <div>
            <button class="btn" onclick="testConnection()">1. Test Connection</button>
            <button class="btn" onclick="createCollections()" id="createBtn" disabled>2. Create Sample Collections</button>
            <button class="btn" onclick="viewCollections()" id="viewBtn" disabled>3. View Collections</button>
            <button class="btn" onclick="clearResults()">Clear Results</button>
        </div>
        
        <div id="results"></div>
    </div>

    <script>
        let connectionWorking = false;
        
        async function testConnection() {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<div class="status info">Testing MongoDB connection...</div>';
            
            try {
                const response = await fetch('test_connection.php');
                const text = await response.text();
                
                if (text.includes('✅ MongoDB Connection Successful')) {
                    resultsDiv.innerHTML = `<div class="status success">✅ Connection Test Passed!</div><div class="result">${text}</div>`;
                    connectionWorking = true;
                    document.getElementById('createBtn').disabled = false;
                    document.getElementById('viewBtn').disabled = false;
                } else {
                    resultsDiv.innerHTML = `<div class="status error">❌ Connection Test Failed</div><div class="result">${text}</div>`;
                    connectionWorking = false;
                }
            } catch (error) {
                resultsDiv.innerHTML = `<div class="status error">❌ Error: ${error.message}</div>`;
                connectionWorking = false;
            }
        }
        
        async function createCollections() {
            if (!connectionWorking) {
                alert('Please test connection first!');
                return;
            }
            
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML += '<div class="status info">Creating sample collections...</div>';
            
            try {
                const response = await fetch('create_sample_collection.php');
                const text = await response.text();
                
                if (text.includes('Sample collections created successfully')) {
                    resultsDiv.innerHTML += `<div class="status success">✅ Collections Created!</div><div class="result">${text}</div>`;
                } else {
                    resultsDiv.innerHTML += `<div class="status error">❌ Failed to create collections</div><div class="result">${text}</div>`;
                }
            } catch (error) {
                resultsDiv.innerHTML += `<div class="status error">❌ Error: ${error.message}</div>`;
            }
        }
        
        async function viewCollections() {
            if (!connectionWorking) {
                alert('Please test connection first!');
                return;
            }
            
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML += '<div class="status info">Fetching collection data...</div>';
            
            try {
                // Create a simple viewer script
                const response = await fetch('view_collections.php');
                const text = await response.text();
                resultsDiv.innerHTML += `<div class="status info">📊 Collection Data:</div><div class="result">${text}</div>`;
            } catch (error) {
                resultsDiv.innerHTML += `<div class="status error">❌ Error: ${error.message}</div>`;
            }
        }
        
        function clearResults() {
            document.getElementById('results').innerHTML = '';
            document.getElementById('createBtn').disabled = true;
            document.getElementById('viewBtn').disabled = true;
            connectionWorking = false;
        }
    </script>
</body>
</html> 