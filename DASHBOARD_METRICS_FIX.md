# Dashboard Metrics Fix - Orders Today, Total Products, Low Stock Items

## Issue
The dashboard cards were showing 0 for:
- Orders Today
- Total Products  
- Low Stock Items

This was because the inventory metrics (`computeDashboardMetrics()`) were not being fetched on initial page load.

## Root Cause
The initialization sequence was:
1. `initDashboard()` - Initialize charts
2. `fetchTransactionsFromDB()` - Fetch transaction data
3. `updateSummaryCards()` - Update transaction summary (not dashboard cards)

Missing steps:
- ❌ `computeDashboardMetrics()` - Fetch inventory data (Total Products, Low Stock)
- ❌ `updateDashboardCards()` - Update dashboard cards with data

## Solution

### 1. Updated AdminDashboard.php Initialization

**Added:**
```javascript
// Fetch and update dashboard metrics (inventory data)
if (typeof computeDashboardMetrics === 'function') {
  await computeDashboardMetrics();
}

// Update dashboard cards with initial data
if (typeof updateDashboardCards === 'function') {
  await updateDashboardCards();
}
```

This ensures:
- Inventory data is fetched from database
- Dashboard cards are updated with the fetched data

### 2. Updated refreshDashboardData() in AdminDashboard.js

**Before:**
```javascript
async function refreshDashboardData() {
  await updateDashboardCards();
  // ...
}
```

**After:**
```javascript
async function refreshDashboardData() {
  // First fetch inventory metrics
  await computeDashboardMetrics();
  // Then update dashboard cards with filtered transaction data
  await updateDashboardCards();
  // ...
}
```

This ensures inventory data is refreshed before updating cards.

### 3. Added Debug Logging

Added console logs to `updateDashboardCards()` to help debug:
```javascript
console.log('📊 Updating dashboard cards:', {
  totalSales: filteredMetrics.totalSales,
  ordersToday: filteredMetrics.ordersToday,
  totalProducts: dashboardMetrics.totalProducts,
  lowStockItems: dashboardMetrics.lowStockItems
});
```

## How It Works Now

### Initialization Flow:
```
Page Load
    ↓
Load Cashiers
    ↓
Initialize Dashboard Charts (initDashboard)
    ↓
Fetch Transactions (fetchTransactionsFromDB)
    ↓
Update Transaction Summary (updateSummaryCards)
    ↓
Fetch Inventory Metrics (computeDashboardMetrics) ← NEW
    ↓
Update Dashboard Cards (updateDashboardCards) ← NEW
    ↓
Refresh Charts (refreshCharts)
```

### Data Sources:
- **Total Sales**: Calculated from filtered transactions (only Served orders)
- **Orders Today**: Calculated from filtered transactions (only Served orders)
- **Total Products**: Fetched from MongoDB inventory via `fetch_products.php`
- **Low Stock Items**: Calculated from inventory (items with stock < 10)

## Testing

1. Refresh the Admin Dashboard page
2. Check browser console for logs:
   - Should see "Refreshing dashboard data..."
   - Should see "📊 Updating dashboard cards:" with values
3. Verify dashboard cards show correct values:
   - **Total Sales**: Should show sum of all served orders
   - **Orders Today**: Should show count of today's served orders
   - **Total Products**: Should show total product count from inventory
   - **Low Stock Items**: Should show count of products with stock < 10

## Expected Behavior

### On Initial Load:
- All 4 dashboard cards should display correct values (not 0)
- Charts should display with data

### When Filtering by Cashier:
- **Total Sales**: Updates to show only selected cashier's Served orders sales
- **Orders Today**: Updates to show only selected cashier's Served orders today
- **Total Products**: Remains the same (not filtered by cashier)
- **Low Stock Items**: Remains the same (not filtered by cashier)
- **Charts**: Update to show only selected cashier's data

## Important Note

**All metrics now count only SERVED orders:**
- Total Sales = Sum of all Served orders
- Orders Today = Count of today's Served orders
- Payment Methods = Count from Served orders only
- Charts = Display Served and Canceled status separately

### Auto-Refresh:
- Dashboard refreshes every 5 minutes automatically
- Fetches latest inventory and transaction data
