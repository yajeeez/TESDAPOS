// Cashier Tutorial Image Carousel
document.addEventListener('DOMContentLoaded', function() {
  const tutorialImage = document.getElementById('tutorialImage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  // Array of cashier tutorial images
  const images = [
     '../img/Tutorial/Cashier/cashier17.png',
    '../img/Tutorial/Cashier/cashier1.png',
    '../img/Tutorial/Cashier/cashier2.png',
     '../img/Tutorial/Cashier/cashier3.png',
    '../img/Tutorial/Cashier/cashier4.png',
     '../img/Tutorial/Cashier/cashier5.png',
    '../img/Tutorial/Cashier/cashier6.png',
    '../img/Tutorial/Cashier/cashier7.png',
    '../img/Tutorial/Cashier/cashier8.png',
     '../img/Tutorial/Cashier/cashier9.png',
    '../img/Tutorial/Cashier/cashier10.png',
     '../img/Tutorial/Cashier/cashier11.png',
      '../img/Tutorial/Cashier/cashier12.png',
       '../img/Tutorial/Cashier/cashier13.png',
        '../img/Tutorial/Cashier/cashier14.png',
         '../img/Tutorial/Cashier/cashier15.png'
        
          

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
