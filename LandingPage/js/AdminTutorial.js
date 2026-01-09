// Admin Tutorial Image Carousel
document.addEventListener('DOMContentLoaded', function() {
  const tutorialImage = document.getElementById('tutorialImage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  // Array of admin tutorial images
  const images = [
    '../img/Tutorial/login.png',
    '../img/Tutorial/dashboard.png',
    '../img/Tutorial/dashboard2.png',
    '../img/Tutorial/dashboard3.png',
    '../img/Tutorial/dashboard4.png',
    '../img/Tutorial/Inventory.png',
    '../img/Tutorial/createproduct.png',
    '../img/Tutorial/manageproduct.png',
    '../img/Tutorial/audit_trail.png',
    '../img/Tutorial/audit_delete.png',
    '../img/Tutorial/maintenance.png',
    '../img/Tutorial/systemhealth.png',
    '../img/Tutorial/backup.png',
    '../img/Tutorial/changepass.png'
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
