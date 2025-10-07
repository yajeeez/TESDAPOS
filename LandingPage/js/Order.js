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

// Function to add product to cart (placeholder implementation)
function addToCart(productId, productName, price) {
    alert(`Added to cart: ${productName} - ₱${price.toFixed(2)}`);
    // In a real implementation, you would add the product to a cart array or send to backend
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Order page loaded, fetching products...');
    fetchProducts();
});