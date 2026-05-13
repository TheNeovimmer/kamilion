(function () {
  document.querySelectorAll(".toggle-pwd").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = this.parentElement.querySelector("input");
      if (!input) return;
      var isPwd = input.type === "password";
      input.type = isPwd ? "text" : "password";
      this.textContent = isPwd ? "visibility" : "visibility_off";
    });
  });

  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = document.getElementById("login-btn");
      btn.disabled = true;
      btn.innerHTML =
        '<span class="material-symbols-outlined animate-spin text-lg" style="font-size:1.2rem">progress_activity</span> SIGNING IN...';
      setTimeout(function () {
        window.location.href = "index.html";
      }, 1500);
    });
  }

  var regForm = document.getElementById("register-form");
  if (regForm) {
    regForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var pwd = document.getElementById("reg-password");
      var confirm = document.getElementById("confirm-password");
      if (pwd && confirm && pwd.value !== confirm.value) {
        confirm.style.borderColor = "#ffb4ab";
        confirm.focus();
        return;
      }
      if (confirm) confirm.style.borderColor = "";
      var btn = document.getElementById("register-btn");
      btn.disabled = true;
      btn.innerHTML =
        '<span class="material-symbols-outlined animate-spin text-lg" style="font-size:1.2rem">progress_activity</span> CREATING...';
      setTimeout(function () {
        window.location.href = "login.html";
      }, 1500);
    });
  }
})();
