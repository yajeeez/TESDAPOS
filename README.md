# TESDA POS System

A comprehensive Point of Sale (POS) system designed for TESDA training institutions, featuring role-based access control, inventory management, and modern web interface.

## 🚀 Features

- **Role-Based Access Control**: Admin, Manager, Cashier, Inventory, and Customer roles
- **Modern Web Interface**: Responsive design with intuitive navigation
- **Inventory Management**: Track stock levels, prices, and product information
- **Order Management**: Process orders and track order status
- **Menu System**: Display food and beverage items with images and descriptions
- **Reporting**: Generate sales reports and analytics
- **Session Management**: Secure user authentication and session handling
- **MongoDB Integration**: NoSQL database for flexible data storage

## 📁 Project Structure

```
TESDAPOS/
├── admin/                          # Admin dashboard and management
│   ├── assets/
│   │   ├── css/js/
│   │   │   └── AdminDashboard.js  # Admin dashboard functionality
│   │   └── logout.php             # Logout handler
│   └── dashboard.php               # Admin dashboard interface
├── connection/                     # Database connections
│   └── mongo/
│       ├── connection.php          # MongoDB connection class
│       ├── setup_users.php         # Initial user setup script
│       └── ...                     # Other database utilities
├── config/                         # Configuration files
│   └── database.php                # Database and app configuration
├── includes/                       # Shared components
│   ├── navigation.php              # Navigation component
│   └── session.php                 # Session management utility
├── LandingPage/                    # Landing page and login forms
│   ├── LandingPage.html            # Main landing page
│   ├── admin_login.html            # Admin login form
│   ├── login_handler.php           # Login processing
│   └── ...                         # Other login forms
├── menu/                           # Menu system
│   ├── menu.html                   # Menu display interface
│   ├── menu.css                    # Menu styling
│   └── menu.js                     # Menu functionality
├── img/                            # Image assets
│   ├── TESDALOGO.png              # TESDA logo
│   ├── adobo.jpg                  # Food images
│   └── ...                        # Other images
├── vendor/                         # Composer dependencies
├── index.php                       # Main entry point
├── composer.json                   # PHP dependencies
└── README.md                       # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- **XAMPP** (Apache + PHP 7.4+)
- **MongoDB** (local installation or cloud service)
- **Composer** (PHP package manager)

### Step 1: Clone/Download Project

1. Download the project files to your XAMPP htdocs folder
2. Navigate to the project directory: `cd C:\xampp\htdocs\TESDAPOS`

### Step 2: Install Dependencies

```bash
composer install
```

### Step 3: Configure Database

1. **Start MongoDB** service
2. **Update configuration** in `config/database.php` if needed:
   ```php
   define('DB_HOST', 'localhost');     // MongoDB host
   define('DB_PORT', '27017');         // MongoDB port
   define('DB_NAME', 'tesdapos');      // Database name
   ```

### Step 4: Setup Initial Users

Run the user setup script to create default accounts:

```bash
php connection/mongo/setup_users.php
```

**Default Login Credentials:**
- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`
- **Cashier**: `cashier` / `cashier123`
- **Inventory**: `inventory` / `inventory123`

### Step 5: Access the System

1. **Start XAMPP** (Apache + MongoDB)
2. **Open browser** and navigate to: `http://localhost/TESDAPOS/`
3. **Login** with your credentials

## 🔐 User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- Reports and analytics
- Maintenance operations

### Manager
- Sales monitoring
- Staff oversight
- Basic reporting
- Menu management

### Cashier
- POS operations
- Order processing
- Customer service
- Basic inventory view

### Inventory
- Stock management
- Product updates
- Inventory reports
- Supplier management

### Customer
- Menu browsing
- Order placement
- Account management

## 🗄️ Database Collections

### Users Collection
```json
{
  "_id": "ObjectId",
  "username": "string",
  "password": "hashed_string",
  "role": "admin|manager|cashier|inventory|customer",
  "full_name": "string",
  "email": "string",
  "created_at": "Date",
  "is_active": "boolean"
}
```

### Products Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "meal|drink",
  "image": "string",
  "stock": "number",
  "is_available": "boolean"
}
```

### Orders Collection
```json
{
  "_id": "ObjectId",
  "customer_id": "ObjectId",
  "items": ["array_of_items"],
  "total_amount": "number",
  "status": "pending|approved|served|canceled",
  "created_at": "Date",
  "updated_at": "Date"
}
```

## 🚀 Usage Guide

### For Administrators

1. **Access Dashboard**: Login with admin credentials
2. **Manage Users**: Create, edit, and deactivate user accounts
3. **System Monitoring**: View system status and performance
4. **Generate Reports**: Access comprehensive analytics

### For Cashiers

1. **POS Interface**: Use the cashier dashboard for transactions
2. **Process Orders**: Take orders and process payments
3. **Inventory Check**: Verify product availability
4. **Customer Service**: Handle customer inquiries

### For Inventory Managers

1. **Stock Management**: Update product quantities
2. **Product Updates**: Modify product information
3. **Supplier Management**: Track supplier relationships
4. **Inventory Reports**: Monitor stock levels

## 🔧 Configuration

### Environment Variables

The system uses PHP constants defined in `config/database.php`:

- `DB_HOST`: MongoDB server hostname
- `DB_PORT`: MongoDB server port
- `DB_NAME`: Database name
- `APP_URL`: Application base URL
- `DEBUG_MODE`: Enable/disable debug mode

### Customization

- **Styling**: Modify CSS files in respective directories
- **Functionality**: Update JavaScript files for custom behavior
- **Database**: Extend MongoDB collections for additional features

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB service is running
   - Check connection settings in `config/database.php`
   - Ensure MongoDB extension is installed in PHP

2. **Session Issues**
   - Check PHP session configuration
   - Verify file permissions on session directory
   - Clear browser cookies and cache

3. **Image Display Problems**
   - Verify image file paths
   - Check file permissions on image directory
   - Ensure image files exist and are accessible

### Debug Mode

Enable debug mode in `config/database.php`:
```php
define('DEBUG_MODE', true);
```

This will display detailed error messages for troubleshooting.

## 📱 Responsive Design

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen resolutions

## 🔒 Security Features

- **Password Hashing**: Secure password storage using PHP's password_hash()
- **Session Management**: Secure session handling with timeout
- **Role-Based Access**: Strict permission control
- **Input Validation**: Server-side input sanitization
- **SQL Injection Protection**: MongoDB driver protection

## 🚀 Future Enhancements

- **Payment Gateway Integration**: Credit card and digital payment support
- **Mobile App**: Native mobile applications
- **Advanced Analytics**: Machine learning insights
- **Multi-location Support**: Franchise management
- **API Development**: RESTful API for third-party integrations

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review error logs in XAMPP
- Ensure all prerequisites are met
- Verify file permissions and paths

## 📄 License

This project is developed for TESDA training purposes.

---

**Note**: This is a training project. For production use, additional security measures and testing should be implemented. 