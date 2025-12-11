<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class AdminSeeder {
    private $client;
    private $database;
    private $collection;
    
    public function __construct() {
        try {
            $this->client = new Client(DB_URI);
            $this->database = $this->client->selectDatabase('admin');
            $this->collection = $this->database->selectCollection('admins');
            
            // Test connection
            $this->database->command(['ping' => 1]);
            echo "Connected to MongoDB admin database successfully.\n";
        } catch (Exception $e) {
            die("Failed to connect to MongoDB: " . $e->getMessage());
        }
    }
    
    public function createSampleAdmins() {
        $sampleAdmins = [
            [
                'username' => 'admin1',
                'email' => 'admin1@tesdapos.com',
                'password' => 'admin123',
                'full_name' => 'John Administrator'
            ],
            [
                'username' => 'admin2',
                'email' => 'admin2@tesdapos.com',
                'password' => 'admin123',
                'full_name' => 'Jane Manager'
            ],
            [
                'username' => 'admin3',
                'email' => 'admin3@tesdapos.com',
                'password' => 'admin123',
                'full_name' => 'Robert Supervisor'
            ],
            [
                'username' => 'admin4',
                'email' => 'admin4@tesdapos.com',
                'password' => 'admin123',
                'full_name' => 'Maria Staff'
            ],
            [
                'username' => 'admin5',
                'email' => 'admin5@tesdapos.com',
                'password' => 'admin123',
                'full_name' => 'David Assistant'
            ]
        ];
        
        try {
            // Clear existing admins (optional - comment out if you want to keep existing data)
            $this->collection->deleteMany([]);
            echo "Cleared existing admin records.\n";
            
            // Insert sample admins
            $result = $this->collection->insertMany($sampleAdmins);
            
            if ($result->getInsertedCount() > 0) {
                echo "Successfully created " . $result->getInsertedCount() . " admin accounts.\n";
                
                // Display created accounts
                echo "\n=== Created Admin Accounts ===\n";
                foreach ($sampleAdmins as $index => $admin) {
                    echo ($index + 1) . ". Username: " . $admin['username'] . 
                     " | Email: " . $admin['email'] . 
                     " | Full Name: " . $admin['full_name'] . 
                     " | Password: admin123\n";
                }
                echo "\nAll accounts use password: admin123\n";
            } else {
                echo "Failed to create admin accounts.\n";
            }
        } catch (Exception $e) {
            echo "Error creating admin accounts: " . $e->getMessage() . "\n";
        }
    }
    
    public function verifyAdmins() {
        try {
            $count = $this->collection->countDocuments();
            echo "\nTotal admin accounts in database: " . $count . "\n";
            
            if ($count > 0) {
                echo "\n=== Current Admin Accounts ===\n";
                $cursor = $this->collection->find([], ['projection' => [
                    'username' => 1,
                    'email' => 1,
                    'full_name' => 1
                ]]);
                
                foreach ($cursor as $admin) {
                    echo "Username: " . $admin['username'] . 
                         " | Email: " . $admin['email'] . 
                         " | Full Name: " . $admin['full_name'] . "\n";
                }
            }
        } catch (Exception $e) {
            echo "Error verifying admin accounts: " . $e->getMessage() . "\n";
        }
    }
}

// Run the seeder
$seeder = new AdminSeeder();
$seeder->createSampleAdmins();
$seeder->verifyAdmins();
?>
