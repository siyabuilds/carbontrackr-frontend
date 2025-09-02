import { register, login, logout } from "./auth.js";
import Swal from "sweetalert2";

// Form validation
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 6;

const validateForm = (formType, formData) => {
  const errors = [];

  if (formType === "register") {
    if (!validateEmail(formData.email))
      errors.push("Please enter a valid email address");
    if (!validatePassword(formData.password))
      errors.push("Password must be at least 6 characters");
    if (!formData.username.trim()) errors.push("Username is required");
    if (!formData.fullName.trim()) errors.push("Full name is required");
  } else if (formType === "login") {
    if (!formData.identifier.trim())
      errors.push("Username or email is required");
    if (!formData.password.trim()) errors.push("Password is required");
  }

  return errors;
};

// Generic auth handler
const withAuthHandling = async (formType, authAction, container, formData) => {
  try {
    setAuthLoading(container, formType, true);

    const validationErrors = validateForm(formType, formData);
    if (validationErrors.length) throw new Error(validationErrors.join("\n"));

    const result = await authAction();

    window.dispatchEvent(
      new CustomEvent("authStateChanged", { detail: { loggedIn: true } })
    );
    return result;
  } catch (error) {
    const message =
      error.message && !error.response
        ? error.message
        : error.response?.data?.message ||
          `${
            formType === "login" ? "Login" : "Registration"
          } failed. Please try again.`;

    await Swal.fire({
      icon: "error",
      title: `${formType === "login" ? "Login" : "Registration"} Failed`,
      text: message,
      confirmButtonColor: "#4CAF50",
    });

    throw error;
  } finally {
    setAuthLoading(container, formType, false);
  }
};

// Auth actions
const handleLogin = async (container) => {
  const formData = {
    identifier: container.querySelector("#login-identifier").value,
    password: container.querySelector("#login-password").value,
  };

  await withAuthHandling(
    "login",
    () => login(formData.identifier, formData.password),
    container,
    formData
  );
};

const handleRegister = async (container) => {
  const formData = {
    email: container.querySelector("#register-email").value,
    username: container.querySelector("#register-username").value,
    fullName: container.querySelector("#register-fullname").value,
    password: container.querySelector("#register-password").value,
  };

  await withAuthHandling(
    "register",
    async () => {
      await register(
        formData.email,
        formData.username,
        formData.password,
        formData.fullName
      );
      return await login(formData.username, formData.password); // Auto-login
    },
    container,
    formData
  );
};

const handleLogout = () => {
  logout();
  window.dispatchEvent(
    new CustomEvent("authStateChanged", { detail: { loggedIn: false } })
  );
};

// Loading state
const setAuthLoading = (container, formType, loading) => {
  const button = container.querySelector(
    `.${formType}-form button[type="submit"]`
  );
  const inputs = container.querySelectorAll(`.${formType}-form input`);

  button.disabled = loading;
  inputs.forEach((input) => (input.disabled = loading));

  button.innerHTML = loading
    ? '<i class="fa-solid fa-spinner fa-spin"></i> Processing...'
    : formType === "login"
    ? '<i class="fa-solid fa-sign-in-alt"></i> Login'
    : '<i class="fa-solid fa-user-plus"></i> Register';
};

// Event listeners
export const setupAuthEventListeners = (container) => {
  const tabs = container.querySelectorAll(".auth-tab");
  const forms = container.querySelectorAll(".auth-form");

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.remove("active"));
      forms.forEach((f) => f.classList.remove("active"));
      tab.classList.add("active");
      container.querySelector(`.${target}-form`).classList.add("active");
    });
  });

  // Form submissions
  container
    .querySelector("#login-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleLogin(container);
    });

  container
    .querySelector("#register-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleRegister(container);
    });
};

export const setupLogoutEventListener = (logoutBtn) => {
  logoutBtn.addEventListener("click", handleLogout);
};
