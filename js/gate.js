(function () {
  "use strict";

  const STORAGE_KEY = "theMarginRegistrationComplete";
  const LOGIN_PAGE = "/ezzzy 2/ezzzy/loggin.html";
  const LOGIN_PAGE_ENCODED = "/ezzzy%202/ezzzy/loggin.html";

  function normalizePath(path) {
    return decodeURIComponent(path || "").replace(/\\/g, "/");
  }

  function isRegistered() {
    return localStorage.getItem(STORAGE_KEY) === "true" || !!localStorage.getItem("token");
  }

  function setRegisteredState() {
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function isAllowedPage(path) {
    return (
      path.endsWith("/index.html") ||
      path.endsWith("/ezzzy/reg.html") ||
      path.endsWith(LOGIN_PAGE) ||
      path.endsWith(LOGIN_PAGE_ENCODED)
    );
  }

  function redirectToGate() {
    const homeUrl = `${location.origin}/index.html`;
    if (location.href !== homeUrl && !location.href.startsWith(homeUrl + "?")) {
      location.href = homeUrl;
    }
  }

  function lockPage() {
    document.body.classList.add("is-locked");
    document.body.classList.add("is-gated");
    const gateOverlay = document.getElementById("gateOverlay");
    if (gateOverlay) {
      gateOverlay.classList.remove("hidden");
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function unlockPage() {
    document.body.classList.remove("is-gated");
    document.body.classList.remove("is-locked");
    const gateOverlay = document.getElementById("gateOverlay");
    if (gateOverlay) {
      gateOverlay.classList.add("hidden");
    }
  }

  function applyGateUi() {
    const gateOverlay = document.getElementById("gateOverlay");
    const gateForm = document.getElementById("gateForm");
    const registerPanel = document.getElementById("registerPanel");
    const showRegisterButton = document.getElementById("showRegisterPanel");

    if (!gateOverlay || !gateForm) {
      return;
    }

    lockPage();

    if (showRegisterButton && registerPanel) {
      showRegisterButton.addEventListener("click", function () {
        registerPanel.classList.remove("hidden");
        showRegisterButton.textContent = "Registering...";
      }, { once: true });
    }

    if (gateForm.dataset.bound === "true") {
      return;
    }

    gateForm.dataset.bound = "true";

    gateForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const fullName = document.getElementById("gateFullName").value.trim();
      const email = document.getElementById("gateEmail").value.trim();
      const password = document.getElementById("gatePassword").value.trim();
      const submitButton = gateForm.querySelector("button");

      if (!fullName || !email || !password) {
        alert("Please fill in your name, email, and password.");
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Creating account...";

      try {
        const data = await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            fullName,
            email,
            password,
            department: "Computer science",
            level: "300"
          })
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem("student", JSON.stringify(data.student));
        setRegisteredState();

        unlockPage();
        window.location.href = `${location.origin}/index.html`;
      } catch (error) {
        alert(error.message || "Registration failed.");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Create account";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const currentPath = normalizePath(location.pathname);

    if (!isRegistered()) {
      if (currentPath.endsWith("/index.html")) {
        applyGateUi();
      } else if (!isAllowedPage(currentPath)) {
        redirectToGate();
      }
      return;
    }

    unlockPage();
  });
})();
