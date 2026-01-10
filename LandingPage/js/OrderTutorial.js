// Tutorial Image Carousel
document.addEventListener('DOMContentLoaded', function() {
  const tutorialImage = document.getElementById('tutorialImage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  // Array of tutorial images for Order/Customer flow
  const images = [
    '../img/Tutorial/Order/tutorial.png',
    '../img/Tutorial/Order/Order Now.png',
    '../img/Tutorial/Order/All.png',
    '../img/Tutorial/Order/All.png',
    '../img/Tutorial/Order/Food.png',
    '../img/Tutorial/Order/Beverages.png',
    '../img/Tutorial/Order/Snacks.png',
    '../img/Tutorial/Order/Select Size.png',
    '../img/Tutorial/Order/Check out.png',
    '../img/Tutorial/Order/Payment.png',
    '../img/Tutorial/Order/Credit.png',
    '../img/Tutorial/Order/Swipe Card.png',
    '../img/Tutorial/Order/Print Receipt.png'
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
