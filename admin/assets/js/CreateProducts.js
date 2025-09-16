// ==========================
// ==========================
// Create Products Management
// ==========================
let products = [];

// ==========================
// Logout Function
// ==========================
function logout(e) {
  if (e) e.preventDefault();
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "/TESDAPOS/LandingPage/LandingPage.html"; 
  }
}

// ==========================
// Get Local Image Path
// ==========================
function getLocalImagePath(productId, productName) {
  const basePath = 'img/product/';
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  return `${basePath}product_${productId}_placeholder.jpg`;
}

// ==========================
// Get Local Placeholder Image
// ==========================
function getLocalPlaceholderImage(productName) {
  const name = productName.toLowerCase();
  
  if (name.includes('adobo')) {
    return '../img/adobo.jpg';
  } else if (name.includes('sinigang')) {
    return '../img/sinigang.jpg';
  } else if (name.includes('iced') || name.includes('tea')) {
    return '../img/icedtea.jpg';
  } else if (name.includes('milk') || name.includes('tea')) {
    return '../img/milktea.jpg';
  } else {
    return '../img/TESDALOGO.png';
  }
}

// ==========================
// Get Product Image with Fallback
// ==========================
async function getProductImage(productId, productName) {
  try {
    const response = await fetch(`/TESDAPOS/connection/list_images.php`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.images.length > 0) {
        const productImages = data.images.filter(img => 
          img.filename.startsWith(`product_${productId}_`)
        );
        
        if (productImages.length > 0) {
          productImages.sort((a, b) => b.modified - a.modified);
          const imagePath = productImages[0].path;
          return `../${imagePath}`;
        }
      }
    }
  } catch (error) {
    console.log('Could not fetch image list:', error);
  }
  
  return getLocalPlaceholderImage(productName);
}

// ==========================
// Initialize Create Products
// ==========================
function initProducts() {
  const productForm = document.getElementById('createProductForm');

  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Show loading state
      const submitBtn = productForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Product...';
      submitBtn.disabled = true;
      
      try {
        // Create FormData object to handle file upload
        const formData = new FormData();
        formData.append('productName', productForm.productName.value.trim());
        formData.append('category', productForm.category.value);
        formData.append('price', productForm.price.value);
        formData.append('stock', productForm.stock.value || 0);
        
        // Add photo if selected
        if (productForm.photo.files[0]) {
          formData.append('photo', productForm.photo.files[0]);
          console.log('Photo file added:', productForm.photo.files[0].name);
        }
        
        // Send to backend
        console.log('Sending request to add_product.php...');
        const response = await fetch('/TESDAPOS/connection/add_product.php', {
          method: 'POST',
          body: formData
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        // Check if response is ok and contains JSON
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError);
          console.error('Response was:', responseText);
          throw new Error('Server returned invalid JSON. Check console for details.');
        }
        
        if (result.success) {
          // Show success message
          alert('Product added successfully! Redirecting to inventory...');
          
          // Reset form
          productForm.reset();
          
          // Redirect to inventory page after a short delay
          setTimeout(() => {
            window.location.href = 'Inventory.php';
          }, 1000);
          
        } else {
          throw new Error(result.message || 'Failed to add product');
        }
        
      } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product: ' + error.message);
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  initProducts();
});