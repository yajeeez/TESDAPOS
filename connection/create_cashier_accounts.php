<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;
use MongoDB\Exception\Exception as MongoException;

class CashierAccountCreator {
    private $client;
    private $database;
    private $collection;

    public function __construct() {
        try {
            $this->client = new Client(DB_URI);
            $this->database = $this->client->selectDatabase(DB_NAME);
            $this->collection = $this->database->selectCollection('admins');

            // Test the connection
            $adminDatabase = $this->client->selectDatabase('admin');
            $adminDatabase->command(['ping' => 1]);
            
            echo "✅ Connected to MongoDB successfully\n";
        } catch (Exception $e) {
            echo "❌ MongoDB connection error: " . $e->getMessage() . "\n";
            throw new Exception("Failed to connect to MongoDB: " . $e->getMessage());
        }
    }

    /**
     * Create cashier accounts
     */
    public function createCashierAccounts() {
        $cashierAccounts = [
            [
                'email' => 'cashier1@tesda.com',
                'password' => 'cashier111',
                'name' => 'Cashier One',
                'role' => 'cashier',
                'status' => 'active',
                'username' => 'cashier1',
                'created_at' => new UTCDateTime()
            ],
            [
                'email' => 'cashier2@tesda.com',
                'password' => 'cashier121',
                'name' => 'Cashier Two',
                'role' => 'cashier',
                'status' => 'active',
                'username' => 'cashier2',
                'created_at' => new UTCDateTime()
            ],
            [
                'email' => 'cashier3@tesda.com',
                'password' => 'cashier123',
                'name' => 'Cashier Three',
                'role' => 'cashier',
                'status' => 'active',
                'username' => 'cashier3',
                'created_at' => new UTCDateTime()
            ],
            [
                'email' => 'cashier4@tesda.com',
                'password' => 'cashier112',
                'name' => 'Cashier Four',
                'role' => 'cashier',
                'status' => 'active',
                'username' => 'cashier4',
                'created_at' => new UTCDateTime()
            ],
            [
                'email' => 'cashier5@tesda.com',
                'password' => 'cashier113',
                'name' => 'Cashier Five',
                'role' => 'cashier',
                'status' => 'active',
                'username' => 'cashier5',
                'created_at' => new UTCDateTime()
            ]
        ];

        $successCount = 0;
        $errors = [];

        foreach ($cashierAccounts as $index => $account) {
            try {
                // Check if email already exists
                $existingUser = $this->collection->findOne(['email' => $account['email']]);
                
                if ($existingUser) {
                    echo "⚠️  User with email {$account['email']} already exists, skipping...\n";
                    continue;
                }

                // Insert the account
                $result = $this->collection->insertOne($account);
                
                if ($result->getInsertedCount() === 1) {
                    $successCount++;
                    echo "✅ Created cashier account: {$account['email']} (Password: " . 
                         ['cashier111', 'cashier121', 'cashier123', 'cashier112', 'cashier113'][$index] . ")\n";
                } else {
                    $errors[] = "Failed to create account: {$account['email']}";
                }
                
            } catch (MongoException $e) {
                $errors[] = "MongoDB error creating {$account['email']}: " . $e->getMessage();
            } catch (Exception $e) {
                $errors[] = "General error creating {$account['email']}: " . $e->getMessage();
            }
        }

        echo "\n📊 Summary:\n";
        echo "✅ Successfully created: $successCount accounts\n";
        
        if (!empty($errors)) {
            echo "❌ Errors encountered:\n";
            foreach ($errors as $error) {
                echo "   - $error\n";
            }
        }

        return [
            'success' => $successCount > 0,
            'created_count' => $successCount,
            'errors' => $errors
        ];
    }

    /**
     * List all accounts in the database
     */
    public function listAllAccounts() {
        try {
            $cursor = $this->collection->find([], [
                'sort' => ['role' => 1, 'email' => 1]
            ]);
            
            echo "\n📋 All accounts in database:\n";
            echo str_repeat("-", 80) . "\n";
            printf("%-25s %-15s %-20s %-10s\n", "Email", "Role", "Name", "Status");
            echo str_repeat("-", 80) . "\n";
            
            foreach ($cursor as $document) {
                $account = (array) $document;
                printf("%-25s %-15s %-20s %-10s\n", 
                    $account['email'] ?? 'N/A',
                    $account['role'] ?? 'N/A',
                    $account['name'] ?? 'N/A',
                    $account['status'] ?? 'N/A'
                );
            }
            echo str_repeat("-", 80) . "\n";
            
        } catch (Exception $e) {
            echo "❌ Error listing accounts: " . $e->getMessage() . "\n";
        }
    }
}

// Run the script
try {
    echo "🚀 Starting Cashier Account Creation Script\n";
    echo str_repeat("=", 50) . "\n";
    
    $creator = new CashierAccountCreator();
    $result = $creator->createCashierAccounts();
    
    // List all accounts after creation
    $creator->listAllAccounts();
    
    echo "\n🎉 Script completed!\n";
    
    if ($result['success']) {
        echo "\n📝 Login Credentials for Cashier Accounts:\n";
        echo str_repeat("-", 40) . "\n";
        echo "Email: cashier1@tesda.com | Password: cashier111\n";
        echo "Email: cashier2@tesda.com | Password: cashier121\n";
        echo "Email: cashier3@tesda.com | Password: cashier123\n";
        echo "Email: cashier4@tesda.com | Password: cashier112\n";
        echo "Email: cashier5@tesda.com | Password: cashier113\n";
        echo str_repeat("-", 40) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Fatal error: " . $e->getMessage() . "\n";
    exit(1);
}
?>