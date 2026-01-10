// Tutorial Image Carousel
document.addEventListener('DOMContentLoaded', function() {
  const tutorialImage = document.getElementById('tutorialImage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  // Array of tutorial images for Order/Customer flow
  const images = [
    '../img/Tutorial/tutorial_page.png',
    '../img/Tutorial/ordernow_page.png',
    '../img/Tutorial/ordernow1.png',
    '../img/Tutorial/ordernow2.png',
    '../img/Tutorial/ordernow3.png',
    '../img/Tutorial/ordernow4.png',
    '../img/Tutorial/order_size.png',
    '../img/Tutorial/order_addtocart.png',
    '../img/Tutorial/order_checkout.png',
    '../img/Tutorial/payment.png',
    '../img/Tutorial/creditcard.png',
    '../img/Tutorial/swipecard.png'
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
