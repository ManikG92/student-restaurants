const BASE_URL = "https://media2.edu.metropolia.fi/restaurant";

export const getRestaurants = async () => {
  const res = await fetch(`${BASE_URL}/api/v1/restaurants`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.restaurants || [];
};

export const getDailyMenu = async (restaurantId, lang = "fi") => {
  const res = await fetch(
    `${BASE_URL}/api/v1/restaurants/daily/${restaurantId}/${lang}`,
  );
  if (!res.ok) throw new Error("Failed to fetch daily menu");
  return res.json();
};

export const getWeeklyMenu = async (restaurantId, lang = "fi") => {
  const res = await fetch(
    `${BASE_URL}/api/v1/restaurants/weekly/${restaurantId}/${lang}`,
  );
  if (!res.ok) throw new Error("Failed to fetch weekly menu");
  return res.json();
};

export const loginUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const registerUser = async (username, password, email) => {
  const res = await fetch(`${BASE_URL}/api/v1/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
};

export const checkAuthToken = async (token) => {
  const res = await fetch(`${BASE_URL}/api/v1/users/token`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Token expired");
  return res.json();
};

export const updateFavorite = async (token, restaurantId) => {
  const res = await fetch(`${BASE_URL}/api/v1/users`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ favouriteRestaurant: restaurantId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update favorite");
  return data;
};

export const uploadAvatar = async (token, file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${BASE_URL}/api/v1/users/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || data.message || "Avatar upload failed");
  return data;
};

export { BASE_URL };
