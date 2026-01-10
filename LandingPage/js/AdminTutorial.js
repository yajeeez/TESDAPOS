// Admin Tutorial Image Carousel
document.addEventListener('DOMContentLoaded', function() {
  const tutorialImage = document.getElementById('tutorialImage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  // Array of admin tutorial images
  const images = [
    '../img/Tutorial/login_page.png',
    '../img/Tutorial/admin_dash.png',
    '../img/Tutorial/admin_dash1.png',
    '../img/Tutorial/admin_dash2.png',
    '../img/Tutorial/admin_dash3.png',
    '../img/Tutorial/inventory.png',
    '../img/Tutorial/create_product.png',
    '../img/Tutorial/create_product1.png',
    '../img/Tutorial/admin_manage.png',
    '../img/Tutorial/admin_action.png',
    '../img/Tutorial/admin_print.png',
    '../img/Tutorial/admin_generate.png',
    '../img/Tutorial/admin_report.png',
    '../img/Tutorial/admin_audit.png',
    '../img/Tutorial/admin_audit1.png',
    '../img/Tutorial/maintenance.png',
    '../img/Tutorial/admin_health.png',
    '../img/Tutorial/admin_health1.png',
    '../img/Tutorial/admin_backup.png',
    '../img/Tutorial/admin_backup1.png',
    '../img/Tutorial/admin_pass.png',
    '../img/Tutorial/admin_pass1.png'
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
