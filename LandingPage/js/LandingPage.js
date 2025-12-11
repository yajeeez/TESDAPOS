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