// Cashier Tutorial Image Carousel
document.addEventListener('DOMContentLoaded', function() {
  const tutorialImage = document.getElementById('tutorialImage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  // Array of cashier tutorial images
  const images = [
    '../img/Tutorial/Cashier/cashier_login.png',
    '../img/Tutorial/Cashier/cashier_dashboard.png',
    '../img/Tutorial/Cashier/cashier_manage.png',
    '../img/Tutorial/Cashier/cashier_manage1.png',
    '../img/Tutorial/Cashier/cashier_manage2.png',  
    '../img/Tutorial/Cashier/cashier_print.png',
    '../img/Tutorial/Cashier/cashier_changepass.png',
    '../img/Tutorial/Cashier/cashier_changepass1.png'
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
