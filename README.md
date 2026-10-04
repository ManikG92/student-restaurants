# Student Restaurants in Finland

A pure vanilla JavaScript single-page application displaying student campus restaurants across Finland, their daily and weekly menus, geolocation search, and user profile management[cite: 8, 11].

- **Live Application:** [Student Restaurants Live Deployment](https://users.metropolia.fi/~manikg/student-restaurants/)

---

## Features

- **Restaurant Directory:** Fetches and displays all available student cafeterias from the REST API[cite: 8, 11].
- **Daily & Weekly Menus:** Native `<dialog>` modal showing daily courses and full weekly menus per restaurant[cite: 8, 11].
- **Interactive Map:** Leaflet.js map with markers corresponding to cafeteria coordinates[cite: 8, 18].
- **Search & Filters:** Real-time filtering by city, service provider (Sodexo, Compass Group), and text search[cite: 8, 18].
- **Nearest Restaurant Finder:** Utilizes the Geolocation API to calculate distances (Haversine formula) and automatically highlights the closest restaurant[cite: 8].
- **Authentication & User Profile:** User login, persistent session with JWT bearer tokens, favorite restaurant selection, and profile picture avatar uploads[cite: 8, 12, 28, 30].

---

## Technical Specifications

- **Front-end:** Pure Vanilla JavaScript (ES6+), HTML5, and custom modern CSS (strictly no frameworks or libraries such as React, Bootstrap, or jQuery)[cite: 11].
- **Map Integration:** Leaflet.js[cite: 8].
- **Hosting:** Metropolia WebDisk (`shell.metropolia.fi`)[cite: 11].
