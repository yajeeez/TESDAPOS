// Admin Tutorial Image Carousel
document.addEventListener('DOMContentLoaded', function() {
  const tutorialImage = document.getElementById('tutorialImage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  // Array of admin tutorial images
  const images = [
        '../img/Tutorial/Admin/admin0.png',
    '../img/Tutorial/Admin/admin1.png', 
    '../img/Tutorial/Admin/admin2.png', 
    '../img/Tutorial/Admin/admin3.png', 
    '../img/Tutorial/Admin/admin4.png', 
    '../img/Tutorial/Admin/admin5.png', 
    '../img/Tutorial/Admin/admin6.png', 
    '../img/Tutorial/Admin/admin7.png', 
    '../img/Tutorial/Admin/admin8.png', 
    '../img/Tutorial/Admin/admin9.png', 
    '../img/Tutorial/Admin/admin10.png', 
    '../img/Tutorial/Admin/admin11.png', 
    '../img/Tutorial/Admin/admin12.png', 
    '../img/Tutorial/Admin/admin13.png', 
    '../img/Tutorial/Admin/admin13.png', 
    '../img/Tutorial/Admin/admin14.png', 
    '../img/Tutorial/Admin/admin15.png', 
    '../img/Tutorial/Admin/admin16.png', 
    '../img/Tutorial/Admin/admin17.png', 
    '../img/Tutorial/Admin/admin18.png', 
    '../img/Tutorial/Admin/admin19.png', 
    '../img/Tutorial/Admin/admin20.png', 
    '../img/Tutorial/Admin/admin21.png', 
    '../img/Tutorial/Admin/admin22.png', 
    '../img/Tutorial/Admin/admin23.png', 
    '../img/Tutorial/Admin/admin24.png', 
    '../img/Tutorial/Admin/admin25.png', 
    '../img/Tutorial/Admin/admin26.png', 
    '../img/Tutorial/Admin/admin27.png', 
    '../img/Tutorial/Admin/admin28.png', 
    '../img/Tutorial/Admin/admin29.png'
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
