import {
  getRestaurants,
  getDailyMenu,
  getWeeklyMenu,
  loginUser,
  registerUser,
  updateFavorite,
  uploadAvatar,
  checkAuthToken,
} from "./api.js";

import {
  initMap,
  updateMapMarkers,
  setUserMarker,
  calculateDistance,
} from "./map.js";

import {
  renderRestaurantRows,
  renderFilterOptions,
  renderMenuDisplay,
  renderProfile,
} from "./ui.js";

let allRestaurants = [];
let currentRestaurant = null;
let currentTab = "daily";
let currentUser = null;
let isRegisterMode = false;

// DOM refs
const restaurantRows = document.getElementById("restaurant-rows");
const cityFilter = document.getElementById("city-filter");
const providerFilter = document.getElementById("provider-filter");
const searchInput = document.getElementById("search-input");
const locateBtn = document.getElementById("locate-btn");
const authControls = document.getElementById("auth-controls");

// Profile DOM refs
const profileSection = document.getElementById("user-profile-section");
const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");
const profileFav = document.getElementById("profile-fav");
const userAvatar = document.getElementById("user-avatar");
const avatarInput = document.getElementById("avatar-input");
const uploadAvatarBtn = document.getElementById("upload-avatar-btn");

// Menu modal refs
const menuModal = document.getElementById("menu-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalTitle = document.getElementById("modal-restaurant-name");
const modalContent = document.getElementById("modal-menu-content");
const dailyTab = document.getElementById("daily-tab");
const weeklyTab = document.getElementById("weekly-tab");

// Auth modal refs
const authModal = document.getElementById("auth-modal");
const closeAuthModal = document.getElementById("close-auth-modal");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-modal-title");
const authSubmit = document.getElementById("auth-submit-btn");
const emailGroup = document.getElementById("email-field-group");
const authSwitchPrompt = document.getElementById("auth-switch-prompt");
const authSwitchLink = document.getElementById("auth-switch-link");
const authError = document.getElementById("auth-error-msg");

// UI state
const renderApp = (restaurantsToRender = getFilteredRestaurants()) => {
  renderRestaurantRows(
    restaurantRows,
    restaurantsToRender,
    currentUser,
    handleOpenMenu,
    handleToggleFav,
  );
  updateMapMarkers(restaurantsToRender);
  renderProfile(
    profileSection,
    profileUsername,
    profileEmail,
    profileFav,
    userAvatar,
    currentUser,
    allRestaurants,
  );
  renderAuthBar();
};

const renderAuthBar = () => {
  if (currentUser) {
    authControls.innerHTML = `
      <span>Hi, <strong>${currentUser.username}</strong></span>
      <button id="logout-btn" class="btn-secondary" type="button">Logout</button>
    `;
    document
      .getElementById("logout-btn")
      .addEventListener("click", handleLogout);
  } else {
    authControls.innerHTML = `<button id="login-open-btn" type="button">Login / Register</button>`;
    document
      .getElementById("login-open-btn")
      .addEventListener("click", openLoginModal);
  }
};

const handleOpenMenu = (restaurantId) => {
  currentRestaurant = allRestaurants.find((r) => r._id === restaurantId);
  if (!currentRestaurant) return;
  modalTitle.textContent = `${currentRestaurant.name} - Menu`;
  menuModal.showModal();
  loadMenuData();
};

const loadMenuData = async () => {
  if (!currentRestaurant) return;
  modalContent.innerHTML = "<p>Loading menu...</p>";
  try {
    const data =
      currentTab === "daily"
        ? await getDailyMenu(currentRestaurant._id)
        : await getWeeklyMenu(currentRestaurant._id);
    renderMenuDisplay(modalContent, data, currentTab);
  } catch (err) {
    modalContent.innerHTML = `<p>${err.message}</p>`;
  }
};

const handleToggleFav = async (restaurantId) => {
  if (!currentUser) {
    alert("Please login to select favorite restaurants!");
    openLoginModal();
    return;
  }
  const token = localStorage.getItem("token");
  const newFav =
    currentUser.favouriteRestaurant === restaurantId ? "" : restaurantId;
  try {
    await updateFavorite(token, newFav);
    currentUser.favouriteRestaurant = newFav;
    renderApp();
  } catch (err) {
    alert(err.message);
  }
};

const getFilteredRestaurants = () => {
  const city = cityFilter.value;
  const provider = providerFilter.value;
  const term = searchInput.value.toLowerCase().trim();

  return allRestaurants.filter((r) => {
    const matchCity = city === "all" || r.city === city;
    const matchProvider = provider === "all" || r.company === provider;
    const matchSearch =
      (r.name && r.name.toLowerCase().includes(term)) ||
      (r.address && r.address.toLowerCase().includes(term));
    return matchCity && matchProvider && matchSearch;
  });
};

const applyFilters = () => {
  renderApp();
};

const handleFindNearest = () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser");
    return;
  }
  locateBtn.textContent = "Locating...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locateBtn.textContent = "Nearest Restaurant";
      const { latitude, longitude } = pos.coords;
      setUserMarker(latitude, longitude);

      let nearest = null;
      let minDistance = Infinity;

      allRestaurants.forEach((r) => {
        if (r.location && Array.isArray(r.location.coordinates)) {
          const [lng, lat] = r.location.coordinates;
          const dist = calculateDistance(latitude, longitude, lat, lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearest = r;
          }
        }
      });

      if (nearest) {
        document
          .querySelectorAll("tr")
          .forEach((row) => row.classList.remove("highlight-nearest"));
        const row = document.getElementById(`restaurant-row-${nearest._id}`);
        if (row) {
          row.classList.add("highlight-nearest");
          row.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        alert(
          `Nearest restaurant: ${nearest.name} (~${minDistance.toFixed(2)} km)`,
        );
      }
    },
    (err) => {
      locateBtn.textContent = "Nearest Restaurant";
      alert(`Location error: ${err.message}`);
    },
  );
};

const openLoginModal = () => {
  isRegisterMode = false;
  authTitle.textContent = "Login";
  authSubmit.textContent = "Login";
  emailGroup.style.display = "none";
  authSwitchPrompt.textContent = "Don't have an account?";
  authSwitchLink.textContent = "Register here";
  authError.textContent = "";
  authForm.reset();
  authModal.showModal();
};

const handleLogout = () => {
  localStorage.removeItem("token");
  currentUser = null;
  renderApp();
};

// Event Listeners
cityFilter.addEventListener("change", applyFilters);
providerFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);
locateBtn.addEventListener("click", handleFindNearest);

closeModalBtn.addEventListener("click", () => menuModal.close());
closeAuthModal.addEventListener("click", () => authModal.close());

dailyTab.addEventListener("click", () => {
  dailyTab.classList.add("active");
  weeklyTab.classList.remove("active");
  currentTab = "daily";
  loadMenuData();
});

weeklyTab.addEventListener("click", () => {
  weeklyTab.classList.add("active");
  dailyTab.classList.remove("active");
  currentTab = "weekly";
  loadMenuData();
});

authSwitchLink.addEventListener("click", (e) => {
  e.preventDefault();
  isRegisterMode = !isRegisterMode;
  authTitle.textContent = isRegisterMode ? "Register" : "Login";
  authSubmit.textContent = isRegisterMode ? "Create Account" : "Login";
  emailGroup.style.display = isRegisterMode ? "flex" : "none";
  authSwitchPrompt.textContent = isRegisterMode
    ? "Already have an account?"
    : "Don't have an account?";
  authSwitchLink.textContent = isRegisterMode ? "Login here" : "Register here";
  authError.textContent = "";
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.textContent = "";

  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value;
  const email = document.getElementById("auth-email").value.trim();

  try {
    if (isRegisterMode) {
      await registerUser(username, password, email);
      alert("Registration successful! Please log in.");
      openLoginModal();
    } else {
      const data = await loginUser(username, password);
      localStorage.setItem("token", data.token);
      currentUser = data.data;
      authModal.close();
      renderApp();
    }
  } catch (err) {
    authError.textContent = err.message;
  }
});

uploadAvatarBtn.addEventListener("click", async () => {
  const file = avatarInput.files[0];
  if (!file) {
    alert("Select an image file first");
    return;
  }
  const token = localStorage.getItem("token");
  try {
    uploadAvatarBtn.textContent = "Uploading...";
    await uploadAvatar(token, file);
    uploadAvatarBtn.textContent = "Upload";
    alert("Avatar updated successfully!");
    currentUser = await checkAuthToken(token);
    renderApp();
  } catch (err) {
    uploadAvatarBtn.textContent = "Upload";
    alert(err.message);
  }
});

// App init
document.addEventListener("DOMContentLoaded", async () => {
  initMap();

  const token = localStorage.getItem("token");
  if (token) {
    try {
      currentUser = await checkAuthToken(token);
    } catch {
      localStorage.removeItem("token");
      currentUser = null;
    }
  }

  try {
    allRestaurants = await getRestaurants();
    renderFilterOptions(cityFilter, providerFilter, allRestaurants);
    renderApp();
  } catch (err) {
    restaurantRows.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">${err.message}</td></tr>`;
  }
});
