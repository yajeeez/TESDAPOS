// ==========================
// Admin Dashboard Core Functions
// ==========================

// ==========================
// Logout
// ==========================
function logout(e) {
  if (e) e.preventDefault();
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "/LandingPage/LandingPage.html"; 
  }
}

// ==========================
// Charts (Chart.js)
// ==========================
let barChart, pieChart;

function initCharts() {
  const barCtx = document.getElementById('barChart')?.getContext('2d');
  const pieCtx = document.getElementById('pieChart')?.getContext('2d');

  if (!barCtx || !pieCtx) {
    console.log('Chart canvases not found, skipping chart initialization');
    return;
  }

  // Bar Chart
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: ['Total Sales', 'Orders Today', 'Active Trainees', 'Low Stock Items'],
      datasets: [{
        label: 'Dashboard Metrics',
        data: [25000, 45, 120, 8],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // Pie Chart
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: ['Total Sales', 'Orders Today', 'Active Trainees', 'Low Stock Items'],
      datasets: [{
        data: [25000, 45, 120, 8],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// ==========================
// Dashboard Data Management
// ==========================
async function refreshDashboardData() {
  try {
    console.log('Refreshing dashboard data...');
    updateDashboardCards();
    if (barChart && pieChart) {
      updateCharts();
    }
  } catch (error) {
    console.error('Error refreshing dashboard data:', error);
  }
}

function updateDashboardCards() {
  const cards = document.querySelectorAll('.card p');
  if (cards.length >= 4) {
    const todayOrders = 45 + Math.floor(Math.random() * 10);
    cards[0].textContent = '₱25,000';
    cards[1].textContent = todayOrders.toString();
    cards[2].textContent = '120';
    cards[3].textContent = '8';
  }
}

function updateCharts() {
  if (!barChart || !pieChart) return;
  const newData = [25000, 45 + Math.floor(Math.random() * 10), 120, 8];
  barChart.data.datasets[0].data = newData;
  pieChart.data.datasets[0].data = newData;
  barChart.update();
  pieChart.update();
}

// ==========================
// Initialize Dashboard
// ==========================
function initDashboard() {
  console.log('Initializing Admin Dashboard...');
  initCharts();
  refreshDashboardData();
  
  // Auto-refresh every 5 minutes
  setInterval(refreshDashboardData, 5 * 60 * 1000);
}

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});