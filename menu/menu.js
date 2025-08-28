document.addEventListener("DOMContentLoaded", () => {
  const menuData = [
    {
      name: "Chicken Adobo",
      description: "Classic Filipino stew with soy sauce and vinegar.",
      price: "₱85",
      category: "meal",
      image: "/img/adobo.jpg"
    },
    {
      name: "Sinigang",
      description: "Sour tamarind soup with vegetables and pork.",
      price: "₱90",
      category: "meal",
      image: "/img/sinigang.jpg"
    },
    {
      name: "Iced Tea",
      description: "Refreshing sweet lemon iced tea.",
      price: "₱25",
      category: "drink",
      image: "/img/icedtea.jpg"
    },
    {
      name: "Milk Tea",
      description: "Sweet and creamy milk tea with tapioca pearls.",
      price: "₱45",
      category: "drink",
      image: "/img/milktea.jpg"
    }
  ];

  const menuGrid = document.getElementById("menuGrid");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const modal = document.getElementById("itemModal");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalPrice = document.getElementById("modalPrice");
  const toast = document.getElementById("toast");

  let currentItem = null;

  // Render menu items
  function renderMenu(items) {
    menuGrid.innerHTML = "";
    items.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("menu-item");
      div.setAttribute("data-category", item.category);

      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <p class="price">${item.price}</p>
        <button class="view-btn">View</button>
      `;

      const viewBtn = div.querySelector(".view-btn");
      viewBtn.addEventListener("click", () => {
        openModal(item);
      });

      menuGrid.appendChild(div);
    });
  }

  // Open modal with item details
  function openModal(item) {
    currentItem = item;
    modalImage.src = item.image;
    modalTitle.textContent = item.name;
    modalDescription.textContent = item.description;
    modalPrice.textContent = item.price;
    modal.classList.remove("hidden");
  }

  // Close modal
  document.getElementById("closeModal").addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Order Now button
  document.getElementById("orderNowButton").addEventListener("click", () => {
    if (currentItem) {
      showToast(`You ordered: ${currentItem.name}`);
      modal.classList.add("hidden");
    }
  });

  // Cancel button
  document.getElementById("cancelOrderButton").addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Show toast
  function showToast(message) {
    toast.textContent = message;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 2000);
  }

  // Search filter
  searchInput.addEventListener("input", () => {
    applyFilters();
  });

  // Category filter
  categoryFilter.addEventListener("change", () => {
    applyFilters();
  });

  function applyFilters() {
    const searchValue = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredItems = menuData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchValue);
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    renderMenu(filteredItems);
  }

  // Initial load
  renderMenu(menuData);
});
