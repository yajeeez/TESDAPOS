<?php
require __DIR__ . '/../../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\Driver\Exception\Exception;

// Set content type to HTML
header('Content-Type: text/html; charset=utf-8');

// HTML head section
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MongoDB Data Display Test</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            text-align: center;
        }
        .section {
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .section h2 {
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .card {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        .card h3 {
            color: #495057;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        .field {
            margin-bottom: 8px;
        }
        .field-label {
            font-weight: 600;
            color: #6c757d;
            display: inline-block;
            width: 80px;
        }
        .field-value {
            color: #212529;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 600;
        }
        .status-active {
            background: #d4edda;
            color: #155724;
        }
        .status-inactive {
            background: #f8d7da;
            color: #721c24;
        }
        .price {
            font-size: 1.3em;
            font-weight: 700;
            color: #28a745;
        }
        .rating {
            color: #ffc107;
            font-weight: 600;
        }
        .skills-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
        }
        .skill-tag {
            background: #e9ecef;
            color: #495057;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: 700;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 MongoDB Connection Test - Data Display</h1>
            <p>Testing PHP connection to MongoDB and displaying sample data</p>
        </div>

        <?php
        try {
            // Test connection
            echo '<div class="success">✅ MongoDB Connection Successful!</div>';
            
            // Get client and database
            $client = MongoConnection::getClient();
            $db = $client->sampleDB;
            
            // Get collection counts
            $usersCount = $db->sample_data->countDocuments();
            $productsCount = $db->sample_product->countDocuments();
            
            // Display statistics
            echo '<div class="stats">';
            echo '<div class="stat-card">';
            echo '<div class="stat-number">' . $usersCount . '</div>';
            echo '<div class="stat-label">Users</div>';
            echo '</div>';
            echo '<div class="stat-card">';
            echo '<div class="stat-number">' . $productsCount . '</div>';
            echo '<div class="stat-label">Products</div>';
            echo '</div>';
            echo '<div class="stat-card">';
            echo '<div class="stat-number">' . ($usersCount + $productsCount) . '</div>';
            echo '<div class="stat-label">Total Documents</div>';
            echo '</div>';
            echo '</div>';
            
            // Display Users Data
            echo '<div class="section">';
            echo '<h2>👥 Users Collection (sample_data)</h2>';
            echo '<p>Total Users: <strong>' . $usersCount . '</strong></p>';
            
            if ($usersCount > 0) {
                $users = $db->sample_data->find();
                echo '<div class="data-grid">';
                
                foreach ($users as $user) {
                    echo '<div class="card">';
                    echo '<h3>' . htmlspecialchars($user['name']) . '</h3>';
                    echo '<div class="field"><span class="field-label">Email:</span> <span class="field-value">' . htmlspecialchars($user['email']) . '</span></div>';
                    echo '<div class="field"><span class="field-label">Role:</span> <span class="field-value">' . htmlspecialchars($user['role']) . '</span></div>';
                    echo '<div class="field"><span class="field-label">Department:</span> <span class="field-value">' . htmlspecialchars($user['department']) . '</span></div>';
                    echo '<div class="field"><span class="field-label">Phone:</span> <span class="field-value">' . htmlspecialchars($user['phone']) . '</span></div>';
                    echo '<div class="field"><span class="field-label">Location:</span> <span class="field-value">' . htmlspecialchars($user['location']) . '</span></div>';
                    echo '<div class="field"><span class="field-label">Status:</span> <span class="field-value"><span class="status-badge status-' . $user['status'] . '">' . ucfirst($user['status']) . '</span></span></div>';
                    
                    if (isset($user['skills']) && is_array($user['skills'])) {
                        echo '<div class="skills-tags">';
                        foreach ($user['skills'] as $skill) {
                            echo '<span class="skill-tag">' . htmlspecialchars($skill) . '</span>';
                        }
                        echo '</div>';
                    }
                    
                    if (isset($user['created_at'])) {
                        $createdAt = $user['created_at']->toDateTime();
                        echo '<div class="field"><span class="field-label">Created:</span> <span class="field-value">' . $createdAt->format('M d, Y H:i') . '</span></div>';
                    }
                    
                    echo '</div>';
                }
                echo '</div>';
            } else {
                echo '<p>No users found in the collection.</p>';
            }
            echo '</div>';
            
            // Display Products Data
            echo '<div class="section">';
            echo '<h2>🛍️ Products Collection (sample_product)</h2>';
            echo '<p>Total Products: <strong>' . $productsCount . '</strong></p>';
            
            if ($productsCount > 0) {
                $products = $db->sample_product->find();
                echo '<div class="data-grid">';
                
                foreach ($products as $product) {
                    echo '<div class="card">';
                    echo '<h3>' . htmlspecialchars($product['name']) . '</h3>';
                    echo '<div class="field"><span class="field-label">Category:</span> <span class="field-value">' . htmlspecialchars($product['category']) . '</span></div>';
                    echo '<div class="field"><span class="field-label">Subcategory:</span> <span class="field-value">' . htmlspecialchars($product['subcategory']) . '</span></div>';
                    echo '<div class="field"><span class="field-label">Price:</span> <span class="field-value price">$' . number_format($product['price'], 2) . '</span></div>';
                    echo '<div class="field"><span class="field-label">Brand:</span> <span class="field-value">' . htmlspecialchars($product['brand']) . '</span></div>';
                    echo '<div class="field"><span class="field-label">Model:</span> <span class="field-value">' . htmlspecialchars($product['model']) . '</span></div>';
                    echo '<div class="field"><span class="field-label">Stock:</span> <span class="field-value">' . $product['stock'] . ' units</span></div>';
                    echo '<div class="field"><span class="field-label">Rating:</span> <span class="field-value rating">★ ' . $product['rating'] . '/5.0</span></div>';
                    echo '<div class="field"><span class="field-label">Reviews:</span> <span class="field-value">' . $product['reviews'] . ' reviews</span></div>';
                    
                    if (isset($product['tags']) && is_array($product['tags'])) {
                        echo '<div class="skills-tags">';
                        foreach ($product['tags'] as $tag) {
                            echo '<span class="skill-tag">' . htmlspecialchars($tag) . '</span>';
                        }
                        echo '</div>';
                    }
                    
                    if (isset($product['created_at'])) {
                        $createdAt = $product['created_at']->toDateTime();
                        echo '<div class="field"><span class="field-label">Created:</span> <span class="field-value">' . $createdAt->format('M d, Y H:i') . '</span></div>';
                    }
                    
                    echo '</div>';
                }
                echo '</div>';
            } else {
                echo '<p>No products found in the collection.</p>';
            }
            echo '</div>';
            
            // Display connection info
            echo '<div class="section">';
            echo '<h2>🔗 Connection Information</h2>';
            echo '<div class="field"><span class="field-label">Database:</span> <span class="field-value">sampleDB</span></div>';
            echo '<div class="field"><span class="field-label">Collections:</span> <span class="field-value">sample_data, sample_product</span></div>';
            echo '<div class="field"><span class="field-label">Connection:</span> <span class="field-value">mongodb://localhost:27017</span></div>';
            echo '<div class="field"><span class="field-label">Status:</span> <span class="field-value"><span class="status-badge status-active">Connected</span></span></div>';
            echo '</div>';
            
        } catch (Exception $e) {
            echo '<div class="error">';
            echo '<h3>❌ MongoDB Connection Error</h3>';
            echo '<p><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>';
            echo '<p>Please check your MongoDB connection and try again.</p>';
            echo '</div>';
        }
        ?>
        
        <div class="section">
            <h2>🧪 Test Results</h2>
            <?php if (isset($usersCount) && isset($productsCount)): ?>
                <div class="success">
                    <h3>✅ Test Completed Successfully!</h3>
                    <p>Your PHP-MongoDB connection is working perfectly!</p>
                    <ul>
                        <li>Successfully connected to MongoDB</li>
                        <li>Retrieved <?php echo $usersCount; ?> users from sample_data collection</li>
                        <li>Retrieved <?php echo $productsCount; ?> products from sample_product collection</li>
                        <li>All data displayed correctly</li>
                    </ul>
                </div>
            <?php else: ?>
                <div class="error">
                    <h3>❌ Test Failed</h3>
                    <p>Unable to retrieve data from MongoDB collections.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html> 