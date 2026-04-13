const API = "http://127.0.0.1:5000";
let currentMode = "manual";

// Mode Switch 
function switchMode(mode) {
  currentMode = mode;

  document.getElementById("manualTab").classList.toggle("active", mode === "manual");
  document.getElementById("autoTab").classList.toggle("active", mode === "auto");

  // Show tourist dropdown only in manual mode
  document.getElementById("touristRow").style.display = mode === "manual" ? "block" : "none";

  // Update button label
  document.getElementById("actionBtn").textContent =
    mode === "manual" ? "Calculate Price" : "Auto Predict Demand";

  // Clear previous result when switching modes
  document.getElementById("result").style.display = "none";
}

// Single Entry Point 
function handleSubmit() {
  if (currentMode === "manual") manualCalc();
  else autoCalc();
}

//  Local Fallback (runs if Flask is offline) 
function localCalc(base, season, checkin, tourist) {
  let steps = [];
  let price = base;
  steps.push({ rule: "Base Price", value: price, change: "—" });

  if (season === "peak") {
    price *= 1.25;
    steps.push({ rule: "Peak Season", value: price, change: "+25%" });
  } else if (season === "off") {
    price *= 0.80;
    steps.push({ rule: "Off Season", value: price, change: "-20%" });
  }

  if (checkin === "weekend") {
    price *= 1.10;
    steps.push({ rule: "Weekend", value: price, change: "+10%" });
  }

  if (tourist === "high") {
    price *= 1.20;
    steps.push({ rule: "High Tourist Demand", value: price, change: "+20%" });
  } else if (tourist === "low") {
    price *= 0.90;
    steps.push({ rule: "Low Tourist Demand", value: price, change: "-10%" });
  }

  const max = base * 1.5;
  const min = base * 0.7;
  let final = Math.min(max, Math.max(min, price));
  if (final !== price) {
    steps.push({ rule: "Fairness Cap Applied", value: final, change: "Capped" });
  }

  return { final_price: Math.round(final), breakdown: steps };
}

// Manual Calculate 
async function manualCalc() {
  const base = parseFloat(document.getElementById("hotel").value);
  const payload = {
    base_price:    base,
    season:        document.getElementById("season").value,
    checkin_day:   document.getElementById("checkin").value,
    tourist_level: document.getElementById("tourist").value
  };
  try {
    const r = await fetch(API + "/calculate-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error();
    render(await r.json());
  } catch {
    render(localCalc(
      payload.base_price,
      payload.season,
      payload.checkin_day,
      payload.tourist_level
    ));
  }
}

// Auto Predict
async function autoCalc() {
  const base = parseFloat(document.getElementById("hotel").value);
  const payload = {
    base_price:  base,
    season:      document.getElementById("season").value,
    checkin_day: document.getElementById("checkin").value
  };
  try {
    const r = await fetch(API + "/auto-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error();
    render(await r.json());
  } catch {
    // Browser-side prediction fallback
    const hour = new Date().getHours();
    let demand = "medium";
    if (hour >= 17 && hour < 22) demand = "high";
    else if (hour >= 0 && hour < 6) demand = "low";
    render(localCalc(payload.base_price, payload.season, payload.checkin_day, demand));
  }
}

//  Render Result 
function render(data) {
  document.getElementById("result").style.display = "block";
  document.getElementById("finalPrice").innerText =
    "Final Price: ₹" + Number(data.final_price).toLocaleString("en-IN");

  const container = document.getElementById("breakdown");
  container.innerHTML = "";
  data.breakdown.forEach(row => {
    let cls = "badge-base";
    if (row.change.startsWith("+")) cls = "badge-up";
    if (row.change.startsWith("-")) cls = "badge-down";
    container.innerHTML += `
      <div class="row">
        <span>${row.rule}</span>
        <span>₹${Number(row.value).toLocaleString("en-IN")}</span>
        <span class="${cls}">${row.change}</span>
      </div>`;
  });
}

// Init 
switchMode("manual");
