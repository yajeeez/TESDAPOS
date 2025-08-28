# MongoDB Connection & Testing Guide

This folder contains scripts to test and work with MongoDB Compass.

## 📋 Prerequisites

1. **MongoDB Server** - Must be running locally on port 27017
2. **MongoDB Compass** - GUI tool for MongoDB
3. **PHP MongoDB Extension** - Already installed via Composer
4. **XAMPP** - For running PHP scripts

## 🚀 How to Test MongoDB Compass

### Step 1: Start MongoDB Service
- Make sure MongoDB service is running on your system
- Default port: 27017

### Step 2: Test Connection
Run the test script to check if MongoDB is working:

```bash
cd "EMMAN BAKLA/connection/mongo"
php test_connection.php
```

**Expected Output if working:**
```
🔍 Testing MongoDB Connection...
================================

📍 Connecting to: mongodb://localhost:27017
✅ MongoDB Connection Successful!

📚 Available Databases:
   - admin
   - local
   - sampleDB

🧪 Testing Database Operations...
✅ Test document inserted with ID: 64f8a1b2c3d4e5f6a7b8c9d0
✅ Test document retrieved successfully
✅ Test data cleaned up

🎉 All tests passed! MongoDB Compass is working correctly.
```

**If it fails, you'll see troubleshooting tips.**

### Step 3: Create Sample Collections
Run the sample collection creator:

```bash
php create_sample_collection.php
```

This will create:
- `users` collection with 5 sample users
- `products` collection with 3 sample products

### Step 4: View in MongoDB Compass
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to `sampleDB` database
4. View the `users` and `products` collections

## 📁 Files Overview

- **`connection.php`** - Main connection class
- **`test_connection.php`** - Test MongoDB connection
- **`create_sample_collection.php`** - Create sample data
- **`db_operations.php`** - Utility class for database operations
- **`README.md`** - This file

## 🔧 Troubleshooting

### Common Issues:

1. **"Connection refused"**
   - MongoDB service not running
   - Check Windows Services for "MongoDB"

2. **"Authentication failed"**
   - MongoDB has authentication enabled
   - Update connection string in `connection.php`

3. **"Driver not found"**
   - Run `composer install` in the project root
   - Check if MongoDB PHP extension is installed

### Check MongoDB Status:
```bash
# Windows (PowerShell)
Get-Service -Name "MongoDB*"

# Or check if port 27017 is listening
netstat -an | findstr 27017
```

## 💡 Usage Examples

### Basic Connection:
```php
require 'connection/mongo/connection.php';
$client = MongoConnection::getClient();
$db = $client->sampleDB;
```

### Using Database Operations:
```php
require 'connection/mongo/db_operations.php';

$dbOps = new DatabaseOperations();
$userId = $dbOps->insertDocument('users', [
    'name' => 'New User',
    'email' => 'user@example.com'
]);
```

## 📞 Support
If you encounter issues:
1. Check MongoDB service status
2. Verify port 27017 is open
3. Test connection in MongoDB Compass first
4. Check PHP error logs 