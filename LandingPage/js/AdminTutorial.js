// Admin Tutorial Image Carousel
document.addEventListener('DOMContentLoaded', function() {
  const tutorialImage = document.getElementById('tutorialImage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  // Array of admin tutorial images
  const images = [
    '../img/Tutorial/Admin/admin_login.png',
    '../img/Tutorial/Admin/admin_Dashboard.png',
    '../img/Tutorial/Admin/Select Cashier.png',
    '../img/Tutorial/Admin/analytics.png',
    '../img/Tutorial/Admin/admin_export.png',
    '../img/Tutorial/Admin/admin_sales.png',
    '../img/Tutorial/Admin/admin_manage.png',
    '../img/Tutorial/Admin/admin_action.png',
    '../img/Tutorial/Admin/admin_generate.png',
    '../img/Tutorial/Admin/admin_print.png',
    '../img/Tutorial/Admin/admin_create.png',
    '../img/Tutorial/Admin/admin_create1.png',
    '../img/Tutorial/Admin/admin_inventory.png',
    '../img/Tutorial/Admin/admin_health.png',
    '../img/Tutorial/Admin/admin_health1.png',
    '../img/Tutorial/Admin/admin_backup.png',
    '../img/Tutorial/Admin/admin_backup1.png',
    '../img/Tutorial/Admin/admin_audit.png',
    '../img/Tutorial/Admin/admin_audit_delete.png',
    '../img/Tutorial/Admin/admin_changepass.png',
    '../img/Tutorial/Admin/admin_changepass1.png'
  ];
  
  let currentIndex = 0;
  
  // Update image display
  function updateImage() {
    tutorialImage.src = images[currentIndex];
    
    // Disable/enable buttons based on position
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === images.length - 1;
  }
  
  // Previous button click
  prevBtn.addEventListener('click', function() {
    if (currentIndex > 0) {
      currentIndex--;
      updateImage();
    }
  });
  
  // Next button click
  nextBtn.addEventListener('click', function() {
    if (currentIndex < images.length - 1) {
      currentIndex++;
      updateImage();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      prevBtn.click();
    } else if (e.key === 'ArrowRight') {
      nextBtn.click();
    }
  });
  
  // Initialize
  updateImage();
});
