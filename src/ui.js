import { BASE_URL } from "./api.js";

export const renderRestaurantRows = (
  container,
  restaurants,
  currentUser,
  onSelectMenu,
  onToggleFav,
) => {
  container.innerHTML = "";
  if (restaurants.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;">No restaurants found.</td></tr>`;
    return;
  }

  restaurants.forEach((r) => {
    const isFav = currentUser && currentUser.favouriteRestaurant === r._id;
    const tr = document.createElement("tr");
    tr.id = `restaurant-row-${r._id}`;

    tr.innerHTML = `
      <td><button class="fav-btn ${isFav ? "is-fav" : ""}" data-id="${r._id}">★</button></td>
      <td><strong>${r.name || "Unnamed"}</strong></td>
      <td>${r.address || "-"}</td>
      <td>${r.city || "-"}</td>
      <td>${r.company || "-"}</td>
      <td><button class="view-menu-btn" data-id="${r._id}">View Menu</button></td>
    `;
    container.appendChild(tr);
  });

  container.querySelectorAll(".view-menu-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      onSelectMenu(btn.getAttribute("data-id")),
    );
  });

  container.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      onToggleFav(btn.getAttribute("data-id")),
    );
  });
};

export const renderFilterOptions = (
  citySelect,
  providerSelect,
  restaurants,
) => {
  const cities = [
    ...new Set(restaurants.map((r) => r.city).filter(Boolean)),
  ].sort();
  citySelect.innerHTML = '<option value="all">All</option>';
  cities.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    citySelect.appendChild(opt);
  });

  const providers = [
    ...new Set(restaurants.map((r) => r.company).filter(Boolean)),
  ].sort();
  providerSelect.innerHTML = '<option value="all">All</option>';
  providers.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    providerSelect.appendChild(opt);
  });
};

export const renderMenuDisplay = (container, data, mode = "daily") => {
  container.innerHTML = "";
  if (mode === "daily") {
    const courses = data.courses || [];
    if (!courses.length) {
      container.innerHTML = "<p>No courses listed for today.</p>";
      return;
    }
    courses.forEach((c) => {
      const div = document.createElement("div");
      div.className = "course-item";
      div.innerHTML = `<strong>${c.name}</strong> <em>(${c.diets || "All"})</em> — <span>${c.price || ""}</span>`;
      container.appendChild(div);
    });
  } else {
    const days = data.days || [];
    if (!days.length) {
      container.innerHTML = "<p>No weekly schedule available.</p>";
      return;
    }
    days.forEach((day) => {
      const dayBlock = document.createElement("div");
      dayBlock.style.marginBottom = "1rem";
      dayBlock.innerHTML = `<h4>${day.date}</h4>`;
      (day.courses || []).forEach((c) => {
        dayBlock.innerHTML += `<p>• ${c.name} <em>(${c.diets || "-"})</em> ${c.price ? "— " + c.price : ""}</p>`;
      });
      container.appendChild(dayBlock);
    });
  }
};

export const renderProfile = (
  profileSection,
  usernameEl,
  emailEl,
  favEl,
  avatarImg,
  user,
  restaurants,
) => {
  if (!user) {
    profileSection.classList.add("hidden");
    return;
  }
  usernameEl.textContent = user.username;
  emailEl.textContent = user.email || "No email provided";
  avatarImg.src = user.avatar
    ? `${BASE_URL}/uploads/${user.avatar}`
    : "[https://place-hold.it/80x80](https://place-hold.it/80x80)";

  const fav = restaurants.find((r) => r._id === user.favouriteRestaurant);
  favEl.innerHTML = `Favorite Restaurant: <strong>${fav ? fav.name : "None selected"}</strong>`;
  profileSection.classList.remove("hidden");
};
