// data.js
// Hotel data — loaded before script.js

const hotels = [
  { name: "Grand Palace Hotel", base: 5000 },
  { name: "Sea View Resort",    base: 6500 },
  { name: "City Comfort Stay",  base: 3500 }
];

// hotel dropdown
const hotelSelect = document.getElementById("hotel");
hotels.forEach(h => {
  const option = document.createElement("option");
  option.value = h.base;
  option.textContent = `${h.name} — ₹${h.base.toLocaleString("en-IN")}`;
  hotelSelect.appendChild(option);
});
