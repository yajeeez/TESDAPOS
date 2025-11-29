// Feature toggle logic for tab style
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".feature-toggle-btn");
  const descs = document.querySelectorAll(".feature-toggle-desc");

  // If this page doesn't have the feature toggle elements, skip this block
  if (buttons.length === 0 || descs.length === 0) {
    console.warn(
      "Feature toggle elements not found (.feature-toggle-btn / .feature-toggle-desc). Skipping toggle initialization."
    );
    return;
  }

  function showDesc(idx) {
    descs.forEach((d, i) => {
      d.classList.remove("active");
      if (i === idx) {
        d.classList.add("active");
      }
    });
    buttons.forEach((b) => b.classList.remove("active"));

    // Guard against invalid index
    if (buttons[idx]) {
      buttons[idx].classList.add("active");
    }
  }

  buttons.forEach((btn, idx) => {
    btn.addEventListener("click", function () {
      showDesc(idx);
    });
  });

  // Show the first by default (only safe because we know there is at least one)
  showDesc(0);
});

// Login dropdown functionality
const loginBtn = document.getElementById("loginDropdownBtn");
const loginMenu = document.getElementById("loginDropdownMenu");

// Add click behavior for login button
if (loginBtn) {
  loginBtn.addEventListener("click", function () {
    // Toggle clicked class for visual feedback
    this.classList.toggle("clicked");

    // Toggle dropdown menu
    loginMenu.style.display =
      loginMenu.style.display === "block" ? "none" : "block";
  });
}

document.addEventListener("click", function (e) {
  if (loginBtn && loginBtn.contains(e.target)) {
    // Click handled by the button's own event listener
  } else {
    if (loginMenu) {
      loginMenu.style.display = "none";
    }
    // Remove clicked class when clicking outside
    if (loginBtn) {
      loginBtn.classList.remove("clicked");
    }
  }
});

// Smooth scrolling functionality
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".center-nav a");
  const heroButtons = document.querySelectorAll(
    ".hero-btn, .hero-btn-secondary"
  );

  // Add smooth scrolling to all nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove clicked class from all nav links
      navLinks.forEach((navLink) => navLink.classList.remove("clicked"));

      // Add clicked class to the current link
      this.classList.add("clicked");

      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // Add smooth scrolling to hero buttons
  heroButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      // Add clicked class for visual feedback
      this.classList.add("clicked");

      // Remove clicked class after animation
      setTimeout(() => {
        this.classList.remove("clicked");
      }, 300);

      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
});

// Header hide on scroll animation
document.addEventListener("DOMContentLoaded", function () {
  let lastScrollY = window.scrollY;
  const header = document.querySelector("header");
  window.addEventListener("scroll", function () {
    if (window.scrollY > lastScrollY && window.scrollY > 50) {
      // Scrolling down
      header.classList.add("header-hidden");
    } else {
      // Scrolling up or at top
      header.classList.remove("header-hidden");
    }
    lastScrollY = window.scrollY;
  });
});

// Carousel logic using images from HTML
document.addEventListener("DOMContentLoaded", function () {
  const track = document.getElementById("carousel-track");

  // If this page doesn't have the carousel, skip this whole block
  if (!track) {
    console.warn(
      "Carousel track element with ID 'carousel-track' not found. Skipping carousel initialization."
    );
    return;
  }

  let carouselImageElements = Array.from(
    track.querySelectorAll(".carousel-img")
  );
  let carouselImages = carouselImageElements.map((img) => img.src);

  // If no images are present, skip carousel logic
  if (carouselImages.length === 0) {
    console.warn(
      "No '.carousel-img' elements found inside '#carousel-track'. Skipping carousel initialization."
    );
    return;
  }

  let currentIndex = 0;

  function renderImages() {
    // For infinite effect, clone last and first images
    const images = [
      carouselImages[carouselImages.length - 1], // last
      ...carouselImages,
      carouselImages[0], // first
    ];

    track.innerHTML = images
      .map(
        (src, i) =>
          `<img src="${src}" class="carousel-img" data-index="${
            i - 1
          }" draggable="false" />`
      )
      .join("");

    // Update carouselImageElements after rendering
    carouselImageElements = Array.from(
      track.querySelectorAll(".carousel-img")
    );

    // Set initial position to the first real image
    track.style.transition = "none";
    track.style.transform = `translateX(-100%)`;
    currentIndex = 0;
  }

  function moveToIndex(index) {
    currentIndex = index;
    track.style.transition = "transform 0.5s ease";
    track.style.transform = `translateX(-${(index + 1) * 100}%)`;
  }

  function handleTransitionEnd() {
    // Loop logic
    if (currentIndex < 0) {
      currentIndex = carouselImages.length - 1;
      track.style.transition = "none";
      track.style.transform = `translateX(-${(currentIndex + 1) * 100}%)`;
    } else if (currentIndex >= carouselImages.length) {
      currentIndex = 0;
      track.style.transition = "none";
      track.style.transform = `translateX(-100%)`;
    }
  }

  function nextImage() {
    moveToIndex(currentIndex + 1);
  }

  function prevImage() {
    moveToIndex(currentIndex - 1);
  }

  track.addEventListener("transitionend", handleTransitionEnd);

  // Touch support
  let startX = 0;
  let isDragging = false;

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  track.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    track.style.transition = "none";
    track.style.transform = `translateX(calc(-${
      (currentIndex + 1) * 100
    }% + ${diff}px))`;
  });

  track.addEventListener("touchend", (e) => {
    isDragging = false;
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 50) {
      prevImage();
    } else if (diff < -50) {
      nextImage();
    } else {
      moveToIndex(currentIndex);
    }
  });

  // Initialize
  renderImages();

  // Auto-slide
  let autoSlideInterval = null;
  let timeoutId = null;

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      nextImage();
    }, 3000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  function resetCarouselAfterTimeout() {
    timeoutId = setTimeout(() => {
      stopAutoSlide();
      currentIndex = 0;
      track.style.transition = "none";
      track.style.transform = `translateX(-100%)`;
      setTimeout(() => {
        startAutoSlide();
      }, 100);
      resetCarouselAfterTimeout();
    }, 60000);
  }

  startAutoSlide();
  resetCarouselAfterTimeout();
});

// Simple scroll spy functionality
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section, footer");
  const navLinks = document.querySelectorAll(".center-nav a");

  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100; // Adjusted for header height (72px) + top margin (1rem) + extra buffer
    const sectionHeight = section.offsetHeight;
    if (
      window.scrollY >= sectionTop &&
      window.scrollY < sectionTop + sectionHeight
    ) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});