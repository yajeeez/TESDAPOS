# Audit Trail - Cashier & Transaction Integration

## Overview
Added comprehensive audit logging for cashier accounts and all orders/transactions throughout the system.

## New Files Created

### 1. `includes/audit_logger.php`
Centralized audit logging system that can be used across the entire application.

**Features:**
- Automatic user/role detection from session
- Support for both admin and cashier roles
- Unique ID generation for each audit entry
- Specialized logging methods for common actions

**Available Methods:**
```php
// General logging
AuditLogger::log($action, $details, $additionalData);

// Order logging
AuditLogger::logOrderCreated($orderId, $totalAmount, $itemCount, $paymentMethod);
AuditLogger::logOrderStatusUpdate($orderId, $oldStatus, $newStatus);

// Transaction logging
AuditLogger::logTransaction($transactionId, $amount, $paymentMethod, $status);

// Cashier logging
AuditLogger::logCashierLogin($cashierName, $cashierUsername);
AuditLogger::logCashierLogout($cashierName, $cashierUsername);
```

## Files Modified

### 1. `connection/save_order.php`
**Changes:**
- Added `audit_logger.php` include
- Added session start to capture cashier info
- Logs every order creation with details:
  - Order ID
  - Total amount
  - Item count
  - Payment method
  - Cashier who created it

**Example Log Entry:**
```json
{
  "id": "audit_67a1b2c3d4e5f6.12345678",
  "timestamp": "2025-12-27 11:30:45",
  "action": "order_created",
  "details": "Order #45 created - Amount: ₱250.00, Items: 3, Payment: Cash",
  "user": "Juan Dela Cruz",
  "role": "cashier",
  "order_id": "45",
  "total_amount": 250.00,
  "item_count": 3,
  "payment_method": "Cash"
}
```

### 2. `admin/update_order_status.php`
**Changes:**
- Added `audit_logger.php` include
- Retrieves old status before updating
- Logs status changes with before/after values

**Example Log Entry:**
```json
{
  "id": "audit_67a1b2c3d4e5f7.87654321",
  "timestamp": "2025-12-27 11:35:20",
  "action": "order_status_updated",
  "details": "Order #45 status changed from 'Pending' to 'Served'",
  "user": "Maria Santos",
  "role": "cashier",
  "order_id": "45",
  "old_status": "Pending",
  "new_status": "Served"
}
```

### 3. `public/components/login_handler.php`
**Changes:**
- Added `audit_logger.php` include
- Logs all logins (both admin and cashier)
- Differentiates between admin and cashier logins

**Example Log Entries:**
```json
// Cashier Login
{
  "id": "audit_67a1b2c3d4e5f8.11111111",
  "timestamp": "2025-12-27 08:00:15",
  "action": "cashier_login",
  "details": "Cashier 'Juan Dela Cruz' (juan.delacruz) logged in",
  "user": "Juan Dela Cruz",
  "role": "cashier",
  "cashier_name": "Juan Dela Cruz",
  "cashier_username": "juan.delacruz"
}

// Admin Login
{
  "id": "audit_67a1b2c3d4e5f9.22222222",
  "timestamp": "2025-12-27 08:05:30",
  "action": "admin_login",
  "details": "Admin 'Admin User' logged in",
  "user": "Admin User",
  "role": "admin"
}
```

### 4. `cashier/components/Logout.php`
**Changes:**
- Added `audit_logger.php` include
- Captures user info before session destruction
- Logs all logouts (both admin and cashier)

**Example Log Entry:**
```json
{
  "id": "audit_67a1b2c3d4e5fa.33333333",
  "timestamp": "2025-12-27 17:00:45",
  "action": "cashier_logout",
  "details": "Cashier 'Juan Dela Cruz' (juan.delacruz) logged out",
  "user": "Juan Dela Cruz",
  "role": "cashier",
  "cashier_name": "Juan Dela Cruz",
  "cashier_username": "juan.delacruz"
}
```

## Audit Trail Actions Now Tracked

### Cashier Actions
1. ✅ **cashier_login** - When cashier logs in
2. ✅ **cashier_logout** - When cashier logs out
3. ✅ **order_created** - When cashier creates an order
4. ✅ **order_status_updated** - When cashier updates order status

### Admin Actions
1. ✅ **admin_login** - When admin logs in
2. ✅ **admin_logout** - When admin logs out
3. ✅ **backup** - When admin creates backup
4. ✅ **backup_delete** - When admin deletes backup
5. ✅ **backup_download** - When admin downloads backup
6. ✅ **system_check** - When admin runs system check
7. ✅ **audit_view** - When admin views audit trail
8. ✅ **page_access** - When admin accesses maintenance page

### Transaction Actions
1. ✅ **order_created** - Includes transaction details
2. ✅ **transaction_processed** - Can be logged for payment processing

## Data Captured for Each Entry

### Standard Fields (All Entries)
- `id` - Unique identifier
- `timestamp` - Date and time
- `action` - Action type
- `details` - Human-readable description
- `user` - Full name of user
- `role` - User role (admin/cashier)
- `ip` - IP address
- `user_agent` - Browser information

### Order-Specific Fields
- `order_id` - Order number
- `total_amount` - Order total
- `item_count` - Number of items
- `payment_method` - Payment type
- `old_status` - Previous status (for updates)
- `new_status` - New status (for updates)

### Cashier-Specific Fields
- `cashier_name` - Full name
- `cashier_username` - Username

## Benefits

### 1. Complete Accountability
- Every order is tracked with the cashier who created it
- All status changes are logged with timestamps
- Login/logout times are recorded

### 2. Security & Compliance
- Full audit trail for compliance requirements
- Track who did what and when
- Detect unauthorized access or suspicious activity

### 3. Performance Monitoring
- Track cashier productivity
- Identify peak hours
- Monitor order processing times

### 4. Dispute Resolution
- Verify order details and timing
- Confirm who handled specific transactions
- Provide evidence for customer disputes

## Usage Examples

### View Cashier Activity
Filter audit logs by role="cashier" to see all cashier actions:
- Login times
- Orders created
- Order status updates
- Logout times

### Track Specific Order
Search for order_id to see complete order history:
- When created
- Who created it
- Status changes
- Who updated status

### Monitor Daily Activity
Filter by date to see:
- How many orders each cashier processed
- Peak activity times
- Total transactions

## Testing

To test the new audit logging:

1. **Test Cashier Login:**
   - Login as cashier
   - Check audit trail for "cashier_login" entry

2. **Test Order Creation:**
   - Create an order from the Order page
   - Check audit trail for "order_created" entry with cashier info

3. **Test Order Status Update:**
   - Update an order status
   - Check audit trail for "order_status_updated" entry

4. **Test Cashier Logout:**
   - Logout as cashier
   - Check audit trail for "cashier_logout" entry

## Future Enhancements

Potential additions:
- Product inventory changes
- Price modifications
- Discount applications
- Refund processing
- Report generation
- Settings changes

## Notes

- All audit logging is non-blocking (errors are logged but don't stop operations)
- Audit log file: `backups/audit_log.json`
- Logs are stored in JSON format for easy parsing
- No automatic cleanup (implement retention policy as needed)
- Consider implementing log rotation for large deployments
