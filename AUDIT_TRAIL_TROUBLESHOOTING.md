# Audit Trail Troubleshooting Guide

## Issue: Delete buttons not showing in screenshot

### Possible Causes:

1. **Browser Cache** - The browser is loading old JavaScript files
2. **Old Data** - Existing audit entries don't have the new `id` field
3. **All entries are page_access** - They're being filtered out

### Solution Steps:

## Step 1: Clear Browser Cache and Hard Refresh

1. Open the Maintenance page
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) to hard refresh
3. Or press `Ctrl + F5` to force reload without cache

## Step 2: Test the Audit Display

1. Open this URL in your browser: `http://localhost/TESDAPOS/admin/test_audit_display.html`
2. This will show you:
   - Total number of audit entries
   - How many are `page_access` entries (these are hidden)
   - How many have the new `id` field (these can be deleted)
   - How many have user/role information
   - Visual display of all entries with indicators

## Step 3: Check Browser Console

1. Open the Maintenance page
2. Press `F12` to open Developer Tools
3. Click on the "Console" tab
4. Click "View Logs" button
5. Look for these console messages:
   - `Total audit entries received: X`
   - `Filtered audit entries (excluding page_access): X`

## Step 4: Generate New Audit Entries

To test with new entries that have all the required fields:

1. On the Maintenance page, click "Create Backup" button
2. Confirm the backup creation
3. Click "View Logs" again
4. You should now see a "backup" entry with:
   - User name
   - Role
   - Delete button on the right

## Step 5: Verify the Changes

After hard refresh, you should see:

### ✅ What SHOULD appear:
- Entries with action types: `backup`, `audit_view`, `system_check`, `backup_delete`, etc.
- User name and role displayed (e.g., "User: Admin User | Role: admin")
- Delete button (trash icon) on the right side of each entry
- NO IP addresses or User Agent strings

### ❌ What should NOT appear:
- Entries with action type `page_access` (these are filtered out)
- IP addresses
- User Agent strings

## Understanding the Screenshot Issue

Looking at your screenshot, ALL visible entries are `page_access` entries. This means:

1. **The filtering IS working** - but you need to hard refresh to see it
2. **OR** - You need to generate new audit entries (non-page_access) to see them displayed

The `page_access` entries are intentionally hidden because they clutter the audit log. They're still stored in the database but not displayed in the UI.

## Quick Test

To quickly see the new format:

1. Hard refresh the page (`Ctrl + Shift + R`)
2. Click "Create Backup" button
3. Click "View Logs" button
4. You should see the backup entry with delete button

## If Still Not Working

1. Check the file timestamps to ensure the files were updated:
   - `admin/assets/js/Maintenance.js`
   - `admin/components/Maintenance.php`

2. Check browser console for JavaScript errors

3. Verify the PHP session is working (user is logged in as admin)

## Expected New Entry Format

```
2025-12-27 10:35:42
backup
Backup created: backup_2025-12-27_10-35-42.json (Size: 2.5 MB)
User: Admin User | Role: admin
[🗑️ Delete Button]
```

## Old Entry Format (Hidden)

```
2025-12-27 10:29:39
page_access
Maintenance page accessed
IP: ::1 | User Agent: Mozilla/5.0...
```

These old `page_access` entries are now **filtered out** and won't be displayed.
