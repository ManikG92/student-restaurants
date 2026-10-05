# Student Restaurants in Finland

A modular, responsive web application that displays student cafeterias across Finland, daily and weekly menus, interactive Leaflet mapping, geolocation, and user authentication with favorite restaurant management.

---

## Live Deployment & Links

- **Live Dem:** [https://users.metropolia.fi/~manikg/student-restaurants/](https://users.metropolia.fi/~manikg/student-restaurants/)
- **GitHub Repo:** [https://github.com/ManikG92/student-restaurants](https://github.com/ManikG92/student-restaurants)

---

## Features

- **Modular ES6 Architecture:** Clean separation of concerns with native ES modules (`api.js`, `map.js`, `ui.js`, `main.js`).
- **Filtering & Search:** Real-time search by name/address and dropdown filters for city and provider (e.g., Sodexo, Compass Group).
- **Interactive Mapping (Leaflet.js):** Displays cafeteria markers with custom popups containing names and provider details.
- **Geolocation & Nearest Finder:** Uses the browser Geolocation API and the Haversine distance formula to identify and highlight the closest campus cafeteria.
- **Menu Dialogs:** Native `<dialog>` modal showing daily courses and full weekly menus fetched dynamically from the REST API.
- **User Authentication & Profile:**
  - JWT-based user registration and login.
  - Persistent favorite restaurant management.
  - Avatar image upload via `multipart/form-data`.
- **Standards-Compliant:** 100% valid HTML5 and CSS verified with official W3C validators.

---

## Project Structure

```text
student-restaurants/
├── index.html          # Semantic HTML5 layout and modal dialogs
├── style.css           # Responsive modern CSS layout and design tokens
├── README.md           # Project documentation and deployment guide
└── src/
    ├── api.js          # REST API endpoints (restaurants, menus, auth, avatar)
    ├── map.js          # Leaflet map initialization, markers, and distance calculations
    ├── ui.js           # Dynamic DOM rendering (tables, filters, profile, menus)
    └── main.js         # Application bootstrap and event coordination
```
