// Function to fetch products from the database
async function fetchProducts() {
    try {
        console.log('Fetching products from database...');
        
        // Use absolute paths since we're in browser context
        // Try TESDAPOS path first, then without
        const urls = [
            '/TESDAPOS/connection/fetch_products.php',
            '/TESDAPOS/admin/fetch_products.php',
            '/connection/fetch_products.php',
            '/admin/fetch_products.php'
        ];
        
        let response = null;
        let urlUsed = null;
        
        // Try each URL until one works
        for (const url of urls) {
            try {
                console.log('Trying URL:', url);
                response = await fetch(url);
                if (response.ok) {
                    urlUsed = url;
                    console.log('Successfully fetched from:', url);
                    break;
                } else {
                    console.log('Request failed for', url, 'with status:', response.status);
                }
            } catch (e) {
                console.log('URL not accessible:', url, 'Error:', e.message);
            }
        }
        
        if (!response) {
            throw new Error('Could not access any product endpoint. Make sure XAMPP Apache is running. Tried: ' + urls.join(', '));
        }
        
        console.log('Using URL:', urlUsed);
        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        const responseText = await response.text();
        console.log('Raw response text length:', responseText.length);
        console.log('Raw response text (first 500 chars):', responseText.substring(0, 500));
        
        // Check if response is HTML (error page)
        if (responseText.trim().startsWith('<')) {
            console.error('Received HTML instead of JSON. Server may have an error.');
            console.error('Current URL:', window.location.href);
            
            // Check if accessed via Live Server or file://
            if (window.location.href.includes('127.0.0.1:5500') || 
                window.location.href.includes('localhost:5500') ||
                window.location.protocol === 'file:') {
                throw new Error('WRONG ACCESS METHOD: Please access via XAMPP Apache at http://localhost/TESDAPOS/LandingPage/Order.html (NOT via Live Server or file://)');
            }
            
            throw new Error('Server returned HTML instead of JSON. Check if MongoDB is running and PHP is configured correctly.');
        }
        
        // Try to parse JSON
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Parsed data:', data);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Raw response was:', responseText);
            throw new Error('Invalid JSON response from server. Check browser console for details.');
        }
        
        if (data.success) {
            console.log('Displaying', data.products.length, 'products');
            displayProducts(data.products);
        } else {
            console.error('Failed to fetch products:', data.message);
            let errorMsg = data.message || 'Unknown error';
            
            // Provide helpful error messages
            if (errorMsg.includes('MongoDB')) {
                errorMsg += ' - Make sure MongoDB service is running.';
            } else if (errorMsg.includes('Composer')) {
                errorMsg += ' - Run "composer install" in the project directory.';
            } else if (errorMsg.includes('mongodb extension')) {
                errorMsg += ' - Install the MongoDB PHP extension.';
            }
            
            document.querySelector('.card-grid').innerHTML = `
                <div class="error-container">
                    <p class="error-message">Failed to load products</p>
                    <p class="error-details">${errorMsg}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        console.error('Error stack:', error.stack);
        document.querySelector('.card-grid').innerHTML = `
            <div class="error-container">
                <p class="error-message">Error loading products</p>
                <p class="error-details">${error.message}</p>
                <p class="error-hint">Check browser console (F12) for more details.</p>
            </div>
        `;
    }
}

// Store all products globally for filtering
let allProducts = [];
let currentFilter = 'All';

// Function to display products in the card grid
function displayProducts(products, filterCategory = 'All') {
    const cardGrid = document.querySelector('.card-grid');
    
    if (!products) {
        cardGrid.innerHTML = '<p class="error-message">No products data received.</p>';
        return;
    }
    
    if (!Array.isArray(products)) {
        cardGrid.innerHTML = '<p class="error-message">Invalid products data format. Expected array, got: ' + typeof products + '</p>';
        return;
    }
    
    // Store all products for filtering
    allProducts = products;
    
    // Filter products based on category
    let filteredProducts = products;
    if (filterCategory !== 'All') {
        filteredProducts = products.filter(product => {
            if (!product.category) return false;
            
            const productCategory = product.category.toLowerCase();
            const searchCategory = filterCategory.toLowerCase();
            
            // Handle both singular and plural forms (e.g., "Snack" and "Snacks")
            return productCategory === searchCategory || 
                   productCategory === searchCategory.replace(/s$/, '') ||
                   productCategory + 's' === searchCategory;
        });
    }
    
    if (filteredProducts.length === 0) {
        cardGrid.innerHTML = '<p class="empty-message">No products available in this category.</p>';
        return;
    }
    
    console.log('Creating product cards for', filteredProducts.length, 'products');
    
    // Clear the grid
    cardGrid.innerHTML = '';
    
    // Create a card for each product
    filteredProducts.forEach((product, index) => {
        console.log('Creating card for product', index, ':', product.product_name);
        
        const card = document.createElement('div');
        card.className = 'order-card';
        card.setAttribute('data-category', product.category || 'others');
        
        // Construct image path - if no image, use a placeholder
        let imagePath = '../img/TESDALOGO.png'; // Default placeholder
        if (product.image_path && product.image_path.trim() !== '') {
            // Construct the correct relative path from LandingPage
            imagePath = `../${product.image_path.replace(/^\/+/, '')}`;
            console.log('Product image path:', imagePath);
        }
        
        // Determine stock status
        const quantity = parseInt(product.stock_quantity) || 0;
        let stockBadge = '';
        let stockClass = '';
        let isDisabled = '';
        
        if (quantity === 0) {
            stockBadge = '<div class="stock-badge out-of-stock"><i class="fas fa-times-circle"></i> Out of Stock</div>';
            isDisabled = 'disabled';
        } else if (quantity <= 5) {
            stockBadge = `<div class="stock-badge low-stock"><i class="fas fa-exclamation-triangle"></i> ${quantity} left</div>`;
        } else {
            stockBadge = `<div class="stock-badge"><i class="fas fa-check-circle"></i> ${quantity} in stock</div>`;
        }
        
        // Check if product is a drink/beverage
        const isBeverage = product.category && (
            product.category.toLowerCase() === 'beverage' || 
            product.category.toLowerCase() === 'beverages' ||
            product.category.toLowerCase() === 'drink' ||
            product.category.toLowerCase() === 'drinks'
        );
        
        // Size options for beverages
        let sizeSelector = '';
        if (isBeverage && quantity > 0) {
            const basePrice = parseFloat(product.price);
            const sizePrices = {
                small: basePrice,
                medium: basePrice * 1.3,
                large: basePrice * 1.6
            };
            
            sizeSelector = `
                <div class="size-selector" data-product-id="${product.id}">
                    <label class="size-label">Size:</label>
                    <div class="size-options">
                        <button class="size-btn active" data-size="small" data-price="${sizePrices.small.toFixed(2)}" onclick="selectSize('${product.id}', 'small', ${sizePrices.small})">
                            Small
                        </button>
                        <button class="size-btn" data-size="medium" data-price="${sizePrices.medium.toFixed(2)}" onclick="selectSize('${product.id}', 'medium', ${sizePrices.medium})">
                            Medium
                        </button>
                        <button class="size-btn" data-size="large" data-price="${sizePrices.large.toFixed(2)}" onclick="selectSize('${product.id}', 'large', ${sizePrices.large})">
                            Large
                        </button>
                    </div>
                    <div class="size-price-display" id="price-${product.id}">₱${sizePrices.small.toFixed(2)}</div>
                </div>
            `;
        }
        
        card.innerHTML = `
            <img src="${imagePath}" alt="${product.product_name}" class="order-img" onerror="this.src='../img/TESDALOGO.png'; console.log('Image load error for product:', '${product.product_name}');">
            <h2>${product.product_name}</h2>
            <p>Category: ${product.category}</p>
            ${stockBadge}
            ${sizeSelector}
            ${!isBeverage ? `<span class="price">₱${parseFloat(product.price).toFixed(2)}</span>` : ''}
            <button class="add-btn" ${isDisabled} onclick="addToCart('${product.id}', '${product.product_name}', ${product.price}, '${isBeverage ? 'small' : ''}')" data-product-id="${product.id}">
                ${quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        `;
        
        cardGrid.appendChild(card);
    });
    
    console.log('Finished creating', filteredProducts.length, 'product cards');
}

// Function to filter products by category
function filterProducts(category) {
    console.log('Filtering by category:', category);
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.filter-btn').classList.add('active');
    
    // Re-display products with filter
    displayProducts(allProducts, category);
}

// Cart functionality
let cart = [];
let cartOpen = false;

// Function to toggle cart dropdown
function toggleCart() {
    const cartDropdown = document.getElementById('cartDropdown');
    cartOpen = !cartOpen;
    
    if (cartOpen) {
        cartDropdown.classList.add('active');
        updateCartDisplay();
    } else {
        cartDropdown.classList.remove('active');
    }
}

// Function to select size for beverages
function selectSize(productId, size, price) {
    // Update active size button
    const sizeSelector = document.querySelector(`.size-selector[data-product-id="${productId}"]`);
    if (sizeSelector) {
        sizeSelector.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        sizeSelector.querySelector(`.size-btn[data-size="${size}"]`).classList.add('active');
        
        // Update price display
        const priceDisplay = document.getElementById(`price-${productId}`);
        if (priceDisplay) {
            priceDisplay.textContent = `₱${price.toFixed(2)}`;
        }
        
        // Update add button to use selected size and price
        const addBtn = document.querySelector(`.add-btn[data-product-id="${productId}"]`);
        if (addBtn) {
            addBtn.setAttribute('data-selected-size', size);
            addBtn.setAttribute('data-selected-price', price);
        }
    }
}

// Function to add product to cart
function addToCart(productId, productName, basePrice, size = '') {
    // Get selected size and price if it's a beverage
    const addBtn = document.querySelector(`.add-btn[data-product-id="${productId}"]`);
    let selectedSize = size;
    let finalPrice = parseFloat(basePrice);
    
    if (addBtn && addBtn.getAttribute('data-selected-size')) {
        selectedSize = addBtn.getAttribute('data-selected-size');
        finalPrice = parseFloat(addBtn.getAttribute('data-selected-price'));
    }
    
    // Create unique cart item ID that includes size for beverages
    const cartItemId = selectedSize ? `${productId}_${selectedSize}` : productId;
    
    // Check if product with same size already exists in cart
    const existingItem = cart.find(item => {
        if (selectedSize) {
            return item.id === productId && item.size === selectedSize;
        }
        return item.id === productId && !item.size;
    });
    
    if (existingItem) {
        // Increase quantity if item already exists
        existingItem.quantity += 1;
    } else {
        // Add new item to cart
        const cartItem = {
            id: productId,
            cartItemId: cartItemId,
            name: productName,
            price: finalPrice,
            quantity: 1
        };
        
        // Add size info if it's a beverage
        if (selectedSize) {
            cartItem.size = selectedSize;
        }
        
        cart.push(cartItem);
    }
    
    // Update cart count and display
    updateCartCount();
    updateCartDisplay();
    
    // Show success message
    const sizeText = selectedSize ? ` (${selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)})` : '';
    showCartMessage(`${productName}${sizeText} added to cart!`);
}

// Function to update cart count badge
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Add bounce animation
    cartCount.style.animation = 'none';
    setTimeout(() => {
        cartCount.style.animation = 'bounce 0.3s ease';
    }, 10);
}

// Function to update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart" onclick="event.stopPropagation()">Your cart is empty</div>';
        cartFooter.style.display = 'none';
        return;
    }
    
    // Show footer when cart has items
    cartFooter.style.display = 'block';
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
    
    // Render cart items
    cartItems.innerHTML = cart.map(item => {
        const sizeText = item.size ? ` <span class="cart-item-size">(${item.size.charAt(0).toUpperCase() + item.size.slice(1)})</span>` : '';
        return `
        <div class="cart-item" onclick="event.stopPropagation()">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}${sizeText}</div>
                <div class="cart-item-price">₱${item.price.toFixed(2)} × ${item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="event.stopPropagation(); updateQuantity('${item.cartItemId}', -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" 
                       class="quantity-input" 
                       value="${item.quantity}" 
                       min="1" 
                       max="999"
                       onclick="event.stopPropagation();"
                       onchange="event.stopPropagation(); setQuantity('${item.cartItemId}', this.value)"
                       onkeydown="event.stopPropagation();">
                <button class="quantity-btn" onclick="event.stopPropagation(); updateQuantity('${item.cartItemId}', 1)">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-item" onclick="event.stopPropagation(); showRemoveItemModal('${item.cartItemId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// Function to update item quantity
function updateQuantity(cartItemId, change) {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(cartItemId);
    } else {
        updateCartCount();
        updateCartDisplay();
    }
}

// Function to set quantity directly from input
function setQuantity(cartItemId, newQuantity) {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (!item) return;
    
    // Parse and validate quantity
    let quantity = parseInt(newQuantity);
    
    // Ensure quantity is valid
    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
    } else if (quantity > 999) {
        quantity = 999;
    }
    
    item.quantity = quantity;
    updateCartCount();
    updateCartDisplay();
}

// Variable to store the cart item ID for removal confirmation
let itemToRemove = null;

// Function to show remove item confirmation modal
function showRemoveItemModal(cartItemId) {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (!item) return;
    
    // Store the item ID for confirmation
    itemToRemove = cartItemId;
    
    // Update modal message with item name
    const sizeText = item.size ? ` (${item.size.charAt(0).toUpperCase() + item.size.slice(1)})` : '';
    const messageEl = document.getElementById('removeItemMessage');
    if (messageEl) {
        messageEl.textContent = `Are you sure you want to remove "${item.name}${sizeText}" from your cart?`;
    }
    
    // Show modal
    const modal = document.getElementById('removeItemModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

// Function to close remove item modal
function closeRemoveItemModal() {
    const modal = document.getElementById('removeItemModal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    itemToRemove = null; // Clear the stored item ID
}

// Function to confirm and execute item removal
function confirmRemoveItem() {
    if (itemToRemove) {
        removeFromCart(itemToRemove);
        itemToRemove = null; // Clear after removal
    }
    closeRemoveItemModal();
}

// Function to remove item from cart
function removeFromCart(cartItemId) {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (item) {
        const sizeText = item.size ? ` (${item.size})` : '';
        showCartMessage(`${item.name}${sizeText} removed from cart`);
    }
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    updateCartCount();
    updateCartDisplay();
}

// Function to cancel entire order (clear cart)
function cancelOrder() {
    if (cart.length === 0) return;
    
    // Show custom confirmation modal
    const modal = document.getElementById('confirmModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

// Function to close confirmation modal
function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Function to confirm and execute order cancellation
function confirmCancelOrder() {
    cart = [];
    updateCartCount();
    updateCartDisplay();
    closeConfirmModal();
    showCartMessage('Order cancelled. Cart cleared.', 'error');
}

// Function to show cart message
function showCartMessage(message, type = 'success') {
    // Create temporary message element
    const messageEl = document.createElement('div');
    
    // Set color based on type
    let bgColor = 'var(--tesda-blue)';
    let icon = '<i class="fas fa-check-circle"></i>';
    
    if (type === 'error') {
        bgColor = '#dc3545';
        icon = '<i class="fas fa-times-circle"></i>';
    } else if (type === 'warning') {
        bgColor = '#ffc107';
        icon = '<i class="fas fa-exclamation-triangle"></i>';
    }
    
    messageEl.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 14px 24px;
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        z-index: 10000;
        font-weight: 600;
        transform: translateX(400px);
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.95rem;
    `;
    messageEl.innerHTML = `${icon} <span>${message}</span>`;
    
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(messageEl)) {
                document.body.removeChild(messageEl);
            }
        }, 400);
    }, 3000);
}

// Close cart when clicking outside
document.addEventListener('click', function(event) {
    const cartContainer = document.querySelector('.cart-container');
    const cartDropdown = document.getElementById('cartDropdown');
    
    if (cartOpen && !cartContainer.contains(event.target)) {
        toggleCart();
    }
});

// Payment Modal Functions
let selectedPaymentMethod = null;
let cardSwiped = false;
let paymentTotal = 0;

// Function to open payment modal
function openPaymentModal() {
    if (cart.length === 0) {
        showCartMessage('Your cart is empty. Add items before checkout.', 'warning');
        return;
    }
    
    const modal = document.getElementById('paymentModal');
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    paymentTotal = cartTotal;
    
    // Reset payment state
    selectedPaymentMethod = null;
    cardSwiped = false;
    
    // Update order summary
    updatePaymentOrderSummary();
    
    // Update totals
    document.getElementById('paymentSubtotal').textContent = cartTotal.toFixed(2);
    document.getElementById('paymentTotal').textContent = cartTotal.toFixed(2);
    
    // Reset UI
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('cashPaymentSection').style.display = 'none';
    document.getElementById('cardPaymentSection').style.display = 'none';
    document.getElementById('cardInfo').style.display = 'none';
    document.getElementById('confirmPaymentBtn').disabled = true;
    document.getElementById('cashAmount').value = '';
    document.getElementById('changeAmount').textContent = '0.00';
    
    // Reset card swipe area
    const swipeLine = document.querySelector('.swipe-line');
    if (swipeLine) {
        swipeLine.classList.remove('swiping');
    }
    cardSwiped = false;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Function to close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset state
    selectedPaymentMethod = null;
    cardSwiped = false;
}

// Function to update payment order summary
function updatePaymentOrderSummary() {
    const orderItemsList = document.getElementById('paymentOrderItems');
    
    if (cart.length === 0) {
        orderItemsList.innerHTML = '<p>No items in cart</p>';
        return;
    }
    
    orderItemsList.innerHTML = cart.map(item => {
        const sizeText = item.size ? ` (${item.size.charAt(0).toUpperCase() + item.size.slice(1)})` : '';
        const itemTotal = (item.price * item.quantity).toFixed(2);
        return `
            <div class="payment-order-item">
                <div>
                    <div class="payment-order-item-name">${item.name}${sizeText}</div>
                    <div class="payment-order-item-details">₱${item.price.toFixed(2)} × ${item.quantity}</div>
                </div>
                <div class="payment-order-item-price">₱${itemTotal}</div>
            </div>
        `;
    }).join('');
}

// Function to select payment method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update button states
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-method') === method) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide payment sections
    if (method === 'cash') {
        document.getElementById('cashPaymentSection').style.display = 'block';
        document.getElementById('cardPaymentSection').style.display = 'none';
        document.getElementById('cardInfo').style.display = 'none';
        
        // Check if we can enable payment button
        const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
        if (cashAmount >= paymentTotal) {
            document.getElementById('confirmPaymentBtn').disabled = false;
        } else {
            document.getElementById('confirmPaymentBtn').disabled = true;
        }
    } else if (method === 'card') {
        document.getElementById('cashPaymentSection').style.display = 'none';
        document.getElementById('cardPaymentSection').style.display = 'block';
        
        // Enable payment button only if card is swiped
        document.getElementById('confirmPaymentBtn').disabled = !cardSwiped;
    }
}

// Function to calculate change for cash payment
function calculateChange() {
    const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
    const change = cashAmount - paymentTotal;
    
    document.getElementById('changeAmount').textContent = change >= 0 ? change.toFixed(2) : '0.00';
    
    // Enable/disable confirm button based on sufficient cash
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    if (selectedPaymentMethod === 'cash') {
        if (cashAmount >= paymentTotal) {
            confirmBtn.disabled = false;
            document.getElementById('changeAmount').style.color = '#28a745';
        } else {
            confirmBtn.disabled = true;
            document.getElementById('changeAmount').style.color = '#dc3545';
        }
    }
}

// Function to simulate card swipe
function simulateCardSwipe() {
    if (cardSwiped) {
        return; // Already swiped
    }
    
    const swipeArea = document.getElementById('cardSwipeArea');
    const swipeLine = swipeArea.querySelector('.swipe-line');
    const swipeIndicator = document.getElementById('swipeIndicator');
    const cardInfo = document.getElementById('cardInfo');
    const swipeBtn = document.getElementById('simulateSwipeBtn');
    
    // Disable button
    swipeBtn.disabled = true;
    swipeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Hide indicator
    if (swipeIndicator) {
        swipeIndicator.style.opacity = '0.3';
    }
    
    // Animate swipe line
    if (swipeLine) {
        swipeLine.classList.add('swiping');
    }
    
    // Simulate processing delay
    setTimeout(() => {
        // Show card info
        cardInfo.style.display = 'block';
        
        // Generate random transaction ID
        const transactionId = 'TXN' + Date.now().toString().slice(-8);
        document.getElementById('transactionId').textContent = transactionId;
        
        // Display total amount
        document.getElementById('cardTotalAmount').textContent = paymentTotal.toFixed(2);
        
        // Mark as swiped
        cardSwiped = true;
        
        // Update button
        swipeBtn.disabled = false;
        swipeBtn.innerHTML = '<i class="fas fa-check-circle"></i> Card Swiped';
        swipeBtn.style.background = '#28a745';
        
        // Remove swipe animation
        if (swipeLine) {
            swipeLine.classList.remove('swiping');
        }
        
        // Enable payment button
        if (selectedPaymentMethod === 'card') {
            document.getElementById('confirmPaymentBtn').disabled = false;
        }
        
        // Show success message
        showCartMessage('Card read successfully!', 'success');
    }, 2000);
}

// Function to process payment
function processPayment() {
    if (!selectedPaymentMethod) {
        showCartMessage('Please select a payment method', 'warning');
        return;
    }
    
    if (selectedPaymentMethod === 'cash') {
        const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
        if (cashAmount < paymentTotal) {
            showCartMessage('Insufficient cash amount', 'error');
            return;
        }
    } else if (selectedPaymentMethod === 'card') {
        if (!cardSwiped) {
            showCartMessage('Please swipe your card first', 'warning');
            return;
        }
    }
    
    // Disable confirm button during processing
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Simulate payment processing
    setTimeout(() => {
        // Show success message
        showCartMessage('Payment processed successfully!', 'success');
        
        // Clear cart
        cart = [];
        updateCartCount();
        updateCartDisplay();
        
        // Close modals
        closePaymentModal();
        if (cartOpen) {
            toggleCart();
        }
        
        // Reset button
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Process Payment';
        
        // Show completion message
        setTimeout(() => {
            showCartMessage('Order completed! Thank you for your purchase.', 'success');
        }, 500);
    }, 2000);
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Order page loaded, fetching products...');
    fetchProducts();
});