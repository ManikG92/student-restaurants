let map = null;
let markers = [];

export const initMap = (elementId = "map") => {
  map = L.map(elementId).setView([60.1699, 24.9384], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  return map;
};

export const updateMapMarkers = (restaurants) => {
  if (!map) return;
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

export const setUserMarker = (lat, lng) => {
  if (!map) return;
  map.setView([lat, lng], 13);
  L.marker([lat, lng], { title: "Your Location" })
    .addTo(map)
    .bindPopup("<b>You are here</b>")
    .openPopup();
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kms
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
