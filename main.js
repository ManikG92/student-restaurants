const BASE_URL = "https://media2.edu.metropolia.fi/restaurant";

// State
let allRestaurants = [];
let currentRestaurant = null;
let currentTab = "daily";
let currentUser = null;
let map = null;
let markers = [];
let isRegisterMode = false;

// DOM Elements
const restaurantRows = document.getElementById("restaurant-rows");
const cityFilter = document.getElementById("city-filter");
const providerFilter = document.getElementById("provider-filter");
const searchInput = document.getElementById("search-input");
const locateBtn = document.getElementById("locate-btn");
const authControls = document.getElementById("auth-controls");
const profileSection = document.getElementById("user-profile-section");
const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");
const profileFav = document.getElementById("profile-fav");
const userAvatar = document.getElementById("user-avatar");
const avatarInput = document.getElementById("avatar-input");
const uploadAvatarBtn = document.getElementById("upload-avatar-btn");

// Menu Dialog Elements
const menuModal = document.getElementById("menu-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalTitle = document.getElementById("modal-restaurant-name");
const modalMenuContent = document.getElementById("modal-menu-content");
const dailyTab = document.getElementById("daily-tab");
const weeklyTab = document.getElementById("weekly-tab");

// Auth Dialog Elements
const authModal = document.getElementById("auth-modal");
const closeAuthModal = document.getElementById("close-auth-modal");
const authForm = document.getElementById("auth-form");
const authModalTitle = document.getElementById("auth-modal-title");
const authUsername = document.getElementById("auth-username");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const emailFieldGroup = document.getElementById("email-field-group");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const authSwitchPrompt = document.getElementById("auth-switch-prompt");
const authSwitchLink = document.getElementById("auth-switch-link");
const authErrorMsg = document.getElementById("auth-error-msg");

// Map Init

const initMap = () => {
  map = L.map("map").setView([60.1699, 24.9384], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
};

// Fetch Restaurants

const fetchRestaurants = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/restaurants`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allRestaurants = Array.isArray(data) ? data : data.restaurants || [];

    populateFilters(allRestaurants);
    renderTable(allRestaurants);
    renderMarkers(allRestaurants);
    if (currentUser) updateFavoriteDisplay();
  } catch (err) {
    console.error("Restaurant fetch error:", err);
    restaurantRows.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Failed to load restaurants: ${err.message}</td></tr>`;
  }
};

const populateFilters = (restaurants) => {
  const cities = [
    ...new Set(restaurants.map((r) => r.city).filter(Boolean)),
  ].sort();
  cityFilter.innerHTML = '<option value="all">All Cities</option>';
  cities.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    cityFilter.appendChild(opt);
  });

  const providers = [
    ...new Set(restaurants.map((r) => r.company).filter(Boolean)),
  ].sort();
  providerFilter.innerHTML = '<option value="all">All Providers</option>';
  providers.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    providerFilter.appendChild(opt);
  });
};

const renderTable = (restaurants) => {
  restaurantRows.innerHTML = "";
  if (restaurants.length === 0) {
    restaurantRows.innerHTML = `<tr><td colspan="6" style="text-align:center;">No restaurants found.</td></tr>`;
    return;
  }

  restaurants.forEach((r) => {
    const isFav = currentUser && currentUser.favouriteRestaurant === r._id;
    const tr = document.createElement("tr");
    tr.id = `restaurant-row-${r._id}`;

    tr.innerHTML = `
      <td>
        <button class="fav-btn ${isFav ? "is-fav" : ""}" data-id="${r._id}" title="Toggle favorite">★</button>
      </td>
      <td><strong>${r.name || "Unnamed"}</strong></td>
      <td>${r.address || "-"}</td>
      <td>${r.city || "-"}</td>
      <td>${r.company || "-"}</td>
      <td><button class="view-menu-btn" data-id="${r._id}">View Menu</button></td>
    `;
    restaurantRows.appendChild(tr);
  });

  // Attach Menu View Buttons
  document.querySelectorAll(".view-menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const found = allRestaurants.find((item) => item._id === id);
      if (found) openMenuModal(found);
    });
  });

  // Attach Favorite Buttons
  document.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      toggleFavorite(id);
    });
  });
};

const renderMarkers = (restaurants) => {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  restaurants.forEach((r) => {
    if (r.location && Array.isArray(r.location.coordinates)) {
      const [lng, lat] = r.location.coordinates;
      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(
          `<b>${r.name}</b><br>${r.address || ""}<br><small>${r.company || ""}</small>`,
        );
      markers.push(marker);
    }
  });
};

// Menu Handlers

const openMenuModal = (restaurant) => {
  currentRestaurant = restaurant;
  modalTitle.textContent = `${restaurant.name} - Menu`;
  menuModal.showModal();
  loadMenuData();
};

const loadMenuData = async () => {
  if (!currentRestaurant) return;
  modalMenuContent.innerHTML = "<p>Loading menu...</p>";

  const endpoint =
    currentTab === "daily"
      ? `${BASE_URL}/api/v1/restaurants/daily/${currentRestaurant._id}/fi`
      : `${BASE_URL}/api/v1/restaurants/weekly/${currentRestaurant._id}/fi`;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    renderMenuContent(data);
  } catch (err) {
    console.error("Menu load error:", err);
    modalMenuContent.innerHTML =
      "<p>No menu data available for this restaurant.</p>";
  }
};

const renderMenuContent = (data) => {
  modalMenuContent.innerHTML = "";
  if (currentTab === "daily") {
    const courses = data.courses || [];
    if (courses.length === 0) {
      modalMenuContent.innerHTML = "<p>No courses listed for today.</p>";
      return;
    }
    courses.forEach((c) => {
      const div = document.createElement("div");
      div.className = "course-item";
      div.innerHTML = `<strong>${c.name}</strong> <em>(${c.diets || "All"})</em> — <span>${c.price || ""}</span>`;
      modalMenuContent.appendChild(div);
    });
  } else {
    const days = data.days || [];
    if (days.length === 0) {
      modalMenuContent.innerHTML = "<p>No weekly schedule available.</p>";
      return;
    }
    days.forEach((day) => {
      const dayBlock = document.createElement("div");
      dayBlock.style.marginBottom = "1rem";
      dayBlock.innerHTML = `<h4>${day.date}</h4>`;
      (day.courses || []).forEach((c) => {
        dayBlock.innerHTML += `<p>• ${c.name} <em>(${c.diets || "-"})</em> ${c.price ? "— " + c.price : ""}</p>`;
      });
      modalMenuContent.appendChild(dayBlock);
    });
  }
};

// Filter & Search

const applyFilters = () => {
  const selectedCity = cityFilter.value;
  const selectedProvider = providerFilter.value;
  const term = searchInput.value.toLowerCase().trim();

  const filtered = allRestaurants.filter((r) => {
    const matchesCity = selectedCity === "all" || r.city === selectedCity;
    const matchesProvider =
      selectedProvider === "all" || r.company === selectedProvider;
    const matchesSearch =
      (r.name && r.name.toLowerCase().includes(term)) ||
      (r.address && r.address.toLowerCase().includes(term));
    return matchesCity && matchesProvider && matchesSearch;
  });

  renderTable(filtered);
  renderMarkers(filtered);
};

// Find Nearest Restaurant

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const findNearest = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  locateBtn.textContent = "Locating...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locateBtn.textContent = "Nearest Restaurant";
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      map.setView([userLat, userLng], 13);
      L.marker([userLat, userLng], { title: "Your Location" })
        .addTo(map)
        .bindPopup("<b>You are here</b>")
        .openPopup();

      let nearest = null;
      let minDistance = Infinity;

      allRestaurants.forEach((r) => {
        if (r.location && Array.isArray(r.location.coordinates)) {
          const [lng, lat] = r.location.coordinates;
          const dist = calculateDistance(userLat, userLng, lat, lng);
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
        const targetRow = document.getElementById(
          `restaurant-row-${nearest._id}`,
        );
        if (targetRow) {
          targetRow.classList.add("highlight-nearest");
          targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        alert(
          `Nearest restaurant: ${nearest.name} (~${minDistance.toFixed(2)} km)`,
        );
      }
    },
    (err) => {
      locateBtn.textContent = "Nearest Restaurant";
      alert("Unable to retrieve location: " + err.message);
    },
  );
};

// User Authentication & Profile

const checkToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    renderLoggedOutUI();
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/token`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Token expired");
    const user = await res.json();
    currentUser = user;
    renderLoggedInUI();
  } catch (e) {
    localStorage.removeItem("token");
    currentUser = null;
    renderLoggedOutUI();
  }
};

const renderLoggedOutUI = () => {
  authControls.innerHTML = `<button id="login-open-btn">Login / Register</button>`;
  document
    .getElementById("login-open-btn")
    .addEventListener("click", openLoginModal);
  profileSection.classList.add("hidden");
  renderTable(allRestaurants);
};

const renderLoggedInUI = () => {
  authControls.innerHTML = `
    <span>Hi, <strong>${currentUser.username}</strong></span>
    <button id="logout-btn" class="btn-secondary">Logout</button>
  `;
  document.getElementById("logout-btn").addEventListener("click", logoutUser);

  profileUsername.textContent = currentUser.username;
  profileEmail.textContent = currentUser.email || "No email provided";
  if (currentUser.avatar) {
    userAvatar.src = `${BASE_URL}/uploads/${currentUser.avatar}`;
  } else {
    userAvatar.src = "https://place-hold.it/80x80";
  }

  profileSection.classList.remove("hidden");
  updateFavoriteDisplay();
  renderTable(allRestaurants);
};

const updateFavoriteDisplay = () => {
  if (!currentUser || !currentUser.favouriteRestaurant) {
    profileFav.innerHTML = "Favorite Restaurant: <em>None selected</em>";
    return;
  }
  const favObj = allRestaurants.find(
    (r) => r._id === currentUser.favouriteRestaurant,
  );
  profileFav.innerHTML = `Favorite Restaurant: <strong>${favObj ? favObj.name : "Unknown"}</strong>`;
};

const openLoginModal = () => {
  isRegisterMode = false;
  authModalTitle.textContent = "Login";
  authSubmitBtn.textContent = "Login";
  emailFieldGroup.style.display = "none";
  authSwitchPrompt.textContent = "Don't have an account?";
  authSwitchLink.textContent = "Register here";
  authErrorMsg.textContent = "";
  authForm.reset();
  authModal.showModal();
};

authSwitchLink.addEventListener("click", (e) => {
  e.preventDefault();
  isRegisterMode = !isRegisterMode;
  if (isRegisterMode) {
    authModalTitle.textContent = "Register";
    authSubmitBtn.textContent = "Create Account";
    emailFieldGroup.style.display = "flex";
    authSwitchPrompt.textContent = "Already have an account?";
    authSwitchLink.textContent = "Login here";
  } else {
    authModalTitle.textContent = "Login";
    authSubmitBtn.textContent = "Login";
    emailFieldGroup.style.display = "none";
    authSwitchPrompt.textContent = "Don't have an account?";
    authSwitchLink.textContent = "Register here";
  }
  authErrorMsg.textContent = "";
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authErrorMsg.textContent = "";

  const username = authUsername.value.trim();
  const password = authPassword.value;
  const email = authEmail.value.trim();

  try {
    if (isRegisterMode) {
      // Register
      const res = await fetch(`${BASE_URL}/api/v1/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      alert("Registration successful! Please log in.");
      openLoginModal();
    } else {
      // Login
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      currentUser = data.data;
      authModal.close();
      renderLoggedInUI();
    }
  } catch (err) {
    authErrorMsg.textContent = err.message;
  }
});

const logoutUser = () => {
  localStorage.removeItem("token");
  currentUser = null;
  renderLoggedOutUI();
};

// Favorite Restaurant & Avatar Uploads

const toggleFavorite = async (restaurantId) => {
  if (!currentUser) {
    alert("Please login to select favorite restaurants!");
    openLoginModal();
    return;
  }

  const token = localStorage.getItem("token");
  const newFav =
    currentUser.favouriteRestaurant === restaurantId ? "" : restaurantId;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ favouriteRestaurant: newFav }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update favorite");

    currentUser.favouriteRestaurant = newFav;
    renderLoggedInUI();
  } catch (err) {
    alert(err.message);
  }
};

uploadAvatarBtn.addEventListener("click", async () => {
  const file = avatarInput.files[0];
  if (!file) return alert("Choose an image file first.");

  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    uploadAvatarBtn.textContent = "Uploading...";
    const res = await fetch(`${BASE_URL}/api/v1/users/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    uploadAvatarBtn.textContent = "Upload";
    if (!res.ok) throw new Error(data.error || data.message || "Upload failed");

    alert("Avatar updated successfully!");
    checkToken();
  } catch (err) {
    uploadAvatarBtn.textContent = "Upload";
    alert(err.message);
  }
});

// Event Listeners
cityFilter.addEventListener("change", applyFilters);
providerFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);
locateBtn.addEventListener("click", findNearest);
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

// App Entrypoint
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  checkToken();
  fetchRestaurants();
});
