// ==========================
// Create Products Management
// ==========================
let products = [];

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
    const response = await fetch(`http://localhost/TESDAPOS/admin/list_images.php`);
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
  const productsList = document.getElementById('productsList');

  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const photoFile = productForm.photo.files[0];
      let imgURL = "../img/TESDALOGO.png";
      if (photoFile) imgURL = URL.createObjectURL(photoFile);

      const product = {
        id: Date.now(),
        name: productForm.productName.value,
        category: productForm.category.value,
        price: Number(productForm.price.value),
        stock: Number(productForm.stock.value) || 0,
        image: imgURL
      };

      products.push(product);
      renderProducts();
      productForm.reset();
    });
  }

  // ==========================
  // Render Products
  // ==========================
  window.renderProducts = function () {
    if (!productsList) return;
    productsList.innerHTML = '';

    if (products.length === 0) {
      productsList.innerHTML = `
        <p class="empty-message">
         "No products found. Go ahead and add new products in the 'Create Products' section to get started."
        </p>
      `;
      return;
    }

    products.forEach(product => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <h4>${product.name}</h4>
        <p>Category: ${product.category}</p>
        <p>Price: ₱${product.price.toFixed(2)}</p>
        <p>Stock: ${product.stock}</p>
        <button onclick="updateProduct(${product.id})">Update</button>
        <button onclick="deleteProduct(${product.id})">Delete</button>
      `;
      productsList.appendChild(div);
    });
  };

  // ==========================
  // Delete Product
  // ==========================
  window.deleteProduct = function (id) {
    products = products.filter(p => p.id !== id);
    renderProducts();
  };
}

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  initProducts();
});