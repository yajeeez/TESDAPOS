# 🛒 Order Page Setup Guide - TESDA POS

## ✅ What Was Fixed

The "Invalid JSON response" error has been resolved by:

1. **Improved Error Handling** - Both `fetch_products.php` files now use output buffering to prevent HTML warnings from corrupting JSON responses
2. **Better Path Detection** - Order.js now tries multiple URL paths to find the correct endpoint
3. **Enhanced Error Messages** - Clear, helpful error messages guide you to the solution
4. **JSON Validation** - Checks if response is HTML before parsing as JSON

## 📋 Prerequisites Checklist

Before using the Order page, ensure:

- [x] **XAMPP Apache** is running (green status in XAMPP Control Panel)
- [x] **MongoDB** service is running (check Windows Services or MongoDB Compass)
- [x] **Composer packages** are installed (`vendor` folder exists)
- [x] **MongoDB PHP extension** is installed and enabled
- [x] **Products** exist in the database (add via admin interface)

## 🚀 Quick Start

### Step 1: Verify Setup

1. Open your browser
2. Navigate to: `http://localhost/TESDAPOS/test_order_page.html`
3. Click "Test Connection" button
4. You should see "✓ Connection Working!"

### Step 2: Access Order Page

If the test passed, access the order page:
- URL: `http://localhost/TESDAPOS/LandingPage/Order.html`

## 🔧 Troubleshooting

### Error: "Could not access any product endpoint"

**Cause**: Apache server is not running or wrong URL path

**Solution**:
1. Start XAMPP Apache
2. Access via: `http://localhost/TESDAPOS/LandingPage/Order.html`
3. **NOT** via file path (file:///...)

### Error: "Server returned HTML instead of JSON"

**Cause**: PHP error occurring before JSON output

**Solution**:
1. Check if MongoDB is running: `net start MongoDB` (Windows Admin CMD)
2. Check PHP error logs in `xampp/apache/logs/error.log`
3. Ensure MongoDB extension is enabled in `php.ini`

### Error: "MongoDB PHP extension is not installed"

**Cause**: MongoDB PHP driver not installed

**Solution**:
1. Download MongoDB PHP extension from: https://pecl.php.net/package/mongodb
2. Choose version matching your PHP version
3. Copy `php_mongodb.dll` to `xampp/php/ext/`
4. Add to `php.ini`: `extension=mongodb`
5. Restart Apache

### Error: "Composer dependencies not installed"

**Cause**: Vendor folder missing

**Solution**:
1. Open terminal in project root
2. Run: `composer install`
3. Wait for installation to complete

### Error: "Failed to connect to MongoDB"

**Cause**: MongoDB service not running

**Solution**:
1. **Windows**: 
   - Open Services (`services.msc`)
   - Find "MongoDB" service
   - Click "Start"
2. **Alternative**: Start MongoDB Compass
3. Verify connection: `mongodb://localhost:27017`

### No Products Displayed (Empty Grid)

**Cause**: No products in database

**Solution**:
1. Access admin interface: `http://localhost/TESDAPOS/admin/components/AdminDashboard.php`
2. Navigate to "Create Products"
3. Add at least one product
4. Return to Order page and refresh

## 📁 Files Modified

### Backend Files:
- `connection/fetch_products.php` - Added output buffering and better error handling
- `admin/fetch_products.php` - Same improvements as above

### Frontend Files:
- `LandingPage/js/Order.js` - Improved error detection and path handling
- `LandingPage/css/Order.css` - Added error message styling

### New Files:
- `test_order_page.html` - Connection testing tool
- `ORDER_PAGE_SETUP_GUIDE.md` - This guide

## 🎯 How It Works

```
┌─────────────────┐
│  Order.html     │ (Customer Interface)
└────────┬────────┘
         │ fetch()
         ▼
┌─────────────────────┐
│ fetch_products.php  │ (API Endpoint)
└────────┬────────────┘
         │ MongoInventory
         ▼
┌─────────────────────┐
│   MongoDB Database  │ (Data Storage)
│   Collection:       │
│   - Inventory       │
└─────────────────────┘
```

## 📊 Database Structure

Products in MongoDB have this structure:
```json
{
  "_id": ObjectId,
  "product_name": "Product Name",
  "category": "food|beverage|snack|others",
  "price": 99.99,
  "stock_quantity": 100,
  "image_path": "uploads/products/image.jpg",
  "created_at": UTCDateTime,
  "updated_at": UTCDateTime
}
```

## 🔍 Testing Checklist

Use this checklist to verify everything works:

- [ ] Apache shows green in XAMPP Control Panel
- [ ] MongoDB service is running
- [ ] `http://localhost/TESDAPOS/test_order_page.html` shows success
- [ ] `http://localhost/TESDAPOS/connection/fetch_products.php` returns JSON
- [ ] Admin interface accessible and can add products
- [ ] Order page displays products with images
- [ ] Browser console (F12) shows no errors

## 💡 Tips

1. **Always use `http://localhost/TESDAPOS/`** - Never access files directly (file:///)
2. **Check browser console (F12)** - Detailed error messages appear there
3. **Use test page first** - Before troubleshooting, run `test_order_page.html`
4. **Check product images** - Ensure uploaded images exist in `uploads/products/`
5. **Enable debug mode** - Set `DEBUG_MODE = true` in `config/database.php` for development

## 📞 Support

If issues persist:
1. Check browser console (F12) for detailed errors
2. Check PHP error logs in `xampp/apache/logs/error.log`
3. Verify database connection with `test_order_page.html`
4. Ensure all prerequisites are met

## 🎉 Success!

When working correctly, you should see:
- Products displayed in a beautiful card grid
- Product images, names, categories, and prices
- "Add to Cart" buttons for each product
- No errors in browser console

Your Order page is now ready to use! 🚀

