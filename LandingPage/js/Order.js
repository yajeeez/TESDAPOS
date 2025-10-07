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

// Function to display products in the card grid
function displayProducts(products) {
    const cardGrid = document.querySelector('.card-grid');
    
    if (!products) {
        cardGrid.innerHTML = '<p class="error-message">No products data received.</p>';
        return;
    }
    
    if (!Array.isArray(products)) {
        cardGrid.innerHTML = '<p class="error-message">Invalid products data format. Expected array, got: ' + typeof products + '</p>';
        return;
    }
    
    if (products.length === 0) {
        cardGrid.innerHTML = '<p class="empty-message">No products available at the moment.</p>';
        return;
    }
    
    console.log('Creating product cards for', products.length, 'products');
    
    // Clear the grid
    cardGrid.innerHTML = '';
    
    // Create a card for each product
    products.forEach((product, index) => {
        console.log('Creating card for product', index, ':', product.product_name);
        
        const card = document.createElement('div');
        card.className = 'order-card';
        
        // Construct image path - if no image, use a placeholder
        let imagePath = '../img/TESDALOGO.png'; // Default placeholder
        if (product.image_path && product.image_path.trim() !== '') {
            // Construct the correct relative path from LandingPage
            imagePath = `../${product.image_path.replace(/^\/+/, '')}`;
            console.log('Product image path:', imagePath);
        }
        
        card.innerHTML = `
            <img src="${imagePath}" alt="${product.product_name}" class="order-img" onerror="this.src='../img/TESDALOGO.png'; console.log('Image load error for product:', '${product.product_name}');">
            <h2>${product.product_name}</h2>
            <p>Category: ${product.category}</p>
            <span class="price">₱${parseFloat(product.price).toFixed(2)}</span>
            <button class="add-btn" onclick="addToCart('${product.id}', '${product.product_name}', ${product.price})">
                Add to Cart
            </button>
        `;
        
        cardGrid.appendChild(card);
    });
    
    console.log('Finished creating', products.length, 'product cards');
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

// Function to add product to cart
function addToCart(productId, productName, price) {
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Increase quantity if item already exists
        existingItem.quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(price),
            quantity: 1
        });
    }
    
    // Update cart count and display
    updateCartCount();
    updateCartDisplay();
    
    // Show success message
    showCartMessage(`${productName} added to cart!`);
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
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartFooter.style.display = 'none';
        return;
    }
    
    // Show footer when cart has items
    cartFooter.style.display = 'block';
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
    
    // Render cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        </div>
    `).join('');
}

// Function to update item quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartCount();
        updateCartDisplay();
    }
}

// Function to remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    updateCartDisplay();
}

// Function to show cart message
function showCartMessage(message) {
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--tesda-blue);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
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

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Order page loaded, fetching products...');
    fetchProducts();
});