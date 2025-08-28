// login.js
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role');

  if (role) {
    const loginTitle = document.getElementById('loginTitle');
    loginTitle.textContent = `${role.charAt(0).toUpperCase() + role.slice(1)} Login`;
  }
  document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const errorMsg = document.getElementById("errorMsg");

  loginForm.addEventListener("submit", function (e) {
    const username = usernameInput.value;

    if (username.length > 10) {
      e.preventDefault();
      errorMsg.textContent = "Username must be 10 characters or fewer.";
    } else {
      errorMsg.textContent = "";
    }
  });
});

});
