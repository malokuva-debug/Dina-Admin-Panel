import { addPropertyControls, ControlType } from "framer"

export default function BookingWidget(props) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <iframe
                srcDoc={getHTMLContent(props)}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                }}
                title="Booking Widget"
            />
        </div>
    )
}

function getHTMLContent(props) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Book Appointment</title>
<style>
* { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: ${props.fontFamily};
}

body {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.container {
  width: 50%;
  height: 50%;
  max-width: 100%;
  max-height: 100%;
  background: #080808;
  border-radius: ${props.borderRadius}px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: rgba(79, 26, 214, 0.4) 0px -19px 70px 0px, rgba(79, 26, 214, 0.02) 0px -0.796192px 3.98096px 0px, rgba(79, 26, 214, 0.05) 0px -2.41451px 12.0725px 0px, rgba(79, 26, 214, 0.13) 0px -6.38265px 31.9133px 0px, rgba(79, 26, 214, 0.4) 0px -20px 100px 0px
}

.header {
  padding: clamp(16px, 3vh, 32px);
  text-align: center;
  color: white;
  flex-shrink: 0;
}

.header h1 {
  font-size: clamp(18px, 2.5vw, 28px);
  font-weight: 700;
  margin-bottom: 4px;
  color: #ffffff;
}

.header p {
  font-size: clamp(12px, 1.5vw, 15px);
  opacity: 0.95;
  color: #ffffff;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  justify-content: space-between;
  padding: clamp(12px, 2vh, 24px) clamp(16px, 3vw, 32px);
  background: #080808;
  flex-shrink: 0;
}

.step {
  flex: 1;
  text-align: center;
  position: relative;
}

.step-number {
  width: clamp(28px, 4vw, 36px);
  height: clamp(28px, 4vw, 36px);
  border-radius: 50%;
  background: #3333;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 6px;
  font-weight: 600;
  font-size: clamp(12px, 1.5vw, 14px);
  transition: all 0.3s;
}

.step.active .step-number {
  background: #ffffff;
  color: black;
  transform: scale(1.1);
}

.step.completed .step-number {
  background: #4f1ad6;
  color: white;
}

.step-label {
  font-size: clamp(10px, 1.2vw, 13px);
  color: #ffffff;
  font-weight: 500;
}

.step.active .step-label {
  color: #ffffff;
  font-weight: 600;
}

/* Content Area - NO SCROLLBARS */
.content {
  padding: clamp(16px, 3vh, 32px);
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.step-content {
  display: none;
  height: 100%;
  overflow: hidden;
}

.step-content.active {
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Form Elements */
label {
  display: block;
  font-size: clamp(12px, 1.5vw, 14px);
  font-weight: 600;
  color: #495057;
  margin-bottom: 8px;
  flex-shrink: 0;
}

select option {
    color: white;
    background-color: #080808;
}

select, input {
  width: 100%;
  padding: clamp(8px, 1.5vh, 12px) clamp(12px, 2vw, 16px);
  border: 2px solid #e9ecef;
  border-radius: 12px;
  border-color: #ffffff14;
  font-size: clamp(13px, 1.5vw, 15px);
  transition: all 0.2s;
  margin-bottom: clamp(12px, 2vh, 20px);
  background: #080808;
  flex-shrink: 0;
  color: white;
}

.dropdown-content {
    background-color: #080808;
    }

select:focus, input:focus {
  outline: none;
  background-color: #080808;
  border-color: ${props.accentColor};
}

input::placeholder {
  color: #adb5bd;
}

/* Grid for selections - NO SCROLLBARS */
.selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(clamp(100px, 15vw, 140px), 1fr));
  gap: clamp(8px, 1.5vh, 12px);
  flex: 1;
  overflow: hidden;
  padding: 4px;
  align-content: start;
}

/* Make grids scrollable on step 1 and 2 only if needed */
.step-content[data-step="1"] .selection-grid,
.step-content[data-step="2"] .selection-grid {
  overflow-y: auto;
}

/* Hide scrollbar but keep functionality */
.selection-grid::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.selection-item {
  padding: clamp(10px, 2vh, 16px);
  border: 2px solid #ffffff14;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #080808;
  font-size: clamp(12px, 1.5vw, 14px);
  font-weight: 500;
  color: #ffffff;
  height: fit-content;
}

.selection-item:hover {
  border-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0px 8px 40px rgba(79, 26, 214, 0.5),
    inset 0px -12px 20px rgba(255, 255, 255, 0.25),
    0px 0px 0px 1px rgba(79, 26, 214, 0.12);
}

.selection-item.selected {
  border-color: #ffffff14;
  box-shadow: 0px 8px 40px rgba(79, 26, 214, 0.5),
    inset 0px -12px 20px rgba(255, 255, 255, 0.25),
    0px 0px 0px 1px rgba(79, 26, 214, 0.12);
  background: #4f1ad6;
  color: white;
  font-weight: 600;
}

.selection-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.time-slot {
  padding: clamp(8px, 1.5vh, 12px);
  font-size: clamp(13px, 1.5vw, 15px);
  font-weight: 600;
}

.date-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-day {
  font-size: clamp(10px, 1.2vw, 12px);
  opacity: 0.8;
}

/* Buttons */
/* Buttons wrapper (optional spacing) */
.buttons {
  display: flex;
  gap: 16px;
  padding: 12px;
}

/* Base Framer-style button */
.buttons button {
  width: 100%;
  padding: 14px 18px;

  background: #4f1ad6;
  color: #fff;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;

  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.2px;

  cursor: pointer;

  box-shadow:
    0px -19px 70px rgba(79, 26, 214, 0.4),
    0px -6px 32px rgba(79, 26, 214, 0.13),
    0px -2px 12px rgba(79, 26, 214, 0.05),
    0px -1px 4px rgba(79, 26, 214, 0.02);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

/* Hover */
.buttons button:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);

  box-shadow:
    0px -25px 90px rgba(79, 26, 214, 0.55),
    0px -10px 40px rgba(79, 26, 214, 0.25);
}

/* Active */
.buttons button:active {
  transform: translateY(0);

  box-shadow:
    0px -10px 40px rgba(79, 26, 214, 0.35);
}

/* Primary (Next / Submit) */
#nextBtn,
#submitBtn,
#backBtn {

  border: 3px solid rgba(255, 255, 255, 0.15);

  box-shadow:
    0px 8px 40px rgba(79, 26, 214, 0.5),
    inset 0px -12px 20px rgba(255, 255, 255, 0.25),
    0px 0px 0px 1px rgba(79, 26, 214, 0.12);
}

/* Primary hover */
#nextBtn:hover,
#submitBtn:hover
#backBtn:hover {
  box-shadow:
    0px 14px 60px rgba(79, 26, 214, 0.7),
    inset 0px -14px 24px rgba(255, 255, 255, 0.35);
}

/* Back button (secondary) */
#backBtn {

  opacity: 0.8;
}

#backBtn:hover {
  opacity: 1;
}

/* Loading & Messages */
.loading, .no-data {
  text-align: center;
  padding: clamp(20px, 4vh, 40px) clamp(10px, 2vw, 20px);
  color: #6c757d;
  font-size: clamp(12px, 1.5vw, 14px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.spinner {
  width: clamp(30px, 5vw, 40px);
  height: clamp(30px, 5vw, 40px);
  border: 4px solid #e9ecef;
  border-top-color: ${props.accentColor};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Confirmation Popup */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.popup-overlay.show {
  display: flex;
}

.popup {
  background: white;
  border-radius: 20px;
  padding: clamp(24px, 5vh, 40px);
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: popIn 0.3s;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.popup-icon {
  width: clamp(48px, 8vw, 64px);
  height: clamp(48px, 8vw, 64px);
  background: ${props.accentGradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: clamp(24px, 4vw, 32px);
}

.popup h2 {
  font-size: clamp(18px, 3vw, 24px);
  margin-bottom: 12px;
  color: #212529;
}

.popup p {
  color: #6c757d;
  font-size: clamp(13px, 1.5vw, 15px);
  line-height: 1.6;
}

/* Summary Box */
.summary {
  background: #080808;
  border: 2px solid #ffffff14;
  border-radius: 12px;
  border-color: #ffffff14;
  padding: clamp(12px, 2vh, 20px);
  margin-bottom: clamp(12px, 2vh, 20px);
  overflow-y: auto;
  flex-shrink: 0;
}

/* Hide scrollbar on summary */
.summary::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: clamp(6px, 1vh, 8px) 0;
  border-bottom: 1px solid #e9ecef;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  color: #ffffff;
  font-size: clamp(12px, 1.5vw, 14px);
}

.summary-value {
  font-weight: 600;
  color: #ffffff;
  font-size: clamp(12px, 1.5vw, 14px);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .container {
    border-radius: 0;
  }
  
  .selection-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

/* Tablet adjustments */
@media (min-width: 769px) and (max-width: 1024px) {
  .selection-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
</head>
<body>

<div class="container">
  <!-- Header -->
  <div class="header">
    <h1>${props.headerTitle}</h1>
  </div>

  <!-- Progress Steps -->
  <div class="progress-steps">
    <div class="step active" data-step="1">
      <div class="step-number">1</div>
      <div class="step-label">${props.step1Label}</div>
    </div>
    <div class="step" data-step="2">
      <div class="step-number">2</div>
      <div class="step-label">${props.step2Label}</div>
    </div>
    <div class="step" data-step="3">
      <div class="step-number">3</div>
      <div class="step-label">${props.step3Label}</div>
    </div>
    <div class="step" data-step="4">
      <div class="step-number">4</div>
      <div class="step-label">${props.step4Label}</div>
    </div>
  </div>

  <!-- Content -->
  <div class="content">
    <!-- Step 1: Service -->
    <div class="step-content active" data-step="1">
      <label>Select Category</label>
      <select id="categorySelect">
        <option value="">Choose a category</option>
      </select>

      <label>Select Service</label>
      <div id="serviceGrid" class="selection-grid">
        <div class="loading">
          <div>Please select an artist and category</div>
        </div>
      </div>
    </div>

    <!-- Step 2: Date & Time -->
    <div class="step-content" data-step="2">
      <label>Select Date</label>
      <div id="dateGrid" class="selection-grid">
        <div class="loading">
          <div class="spinner"></div>
          <div>Loading available dates...</div>
        </div>
      </div>

      <label style="margin-top: clamp(12px, 2vh, 20px);">Select Time</label>
      <div id="timeGrid" class="selection-grid">
        <div class="loading">
          <div>Please select a date first</div>
        </div>
      </div>
    </div>

    <!-- Step 3: Your Details -->
    <div class="step-content" data-step="3">
      <label>Your Name</label>
      <input type="text" id="nameInput" placeholder="Enter your full name">

      <label>Phone Number</label>
      <input type="tel" id="phoneInput" placeholder="(123) 456-7890" maxlength="14">
    </div>

    <!-- Step 4: Confirm -->
    <div class="step-content" data-step="4">
      <div class="summary">
        <div class="summary-item">
          <span class="summary-label">Artist</span>
          <span class="summary-value" id="summaryArtist">-</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Service</span>
          <span class="summary-value" id="summaryService">-</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Date</span>
          <span class="summary-value" id="summaryDate">-</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Time</span>
          <span class="summary-value" id="summaryTime">-</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Duration</span>
          <span class="summary-value" id="summaryDuration">-</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Price</span>
          <span class="summary-value" id="summaryPrice">-</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Name</span>
          <span class="summary-value" id="summaryName">-</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Phone</span>
          <span class="summary-value" id="summaryPhone">-</span>
        </div>
      </div>
      <p style="text-align: center; color: #6c757d; font-size: clamp(12px, 1.5vw, 14px); margin-top: clamp(12px, 2vh, 20px);">
        Please review your appointment details before confirming
      </p>
    </div>
  </div>

  <!-- Navigation Buttons -->
  <div class="buttons">
    <button class="framer-1o49z64-container" id="backBtn" style="display: none;">Back</button>
    <button class="framer-1o49z64-container" id="nextBtn">Next</button>
    <button class="framer-1o49z64-container" id="submitBtn" style="display: none;">Confirm Booking</button>
  </div>
</div>

<!-- Confirmation Popup -->
<div class="popup-overlay" id="popupOverlay">
  <div class="popup">
    <div class="popup-icon">✓</div>
    <h2>Booking Confirmed!</h2>
    <p>Your appointment has been successfully scheduled. You will receive a confirmation notification.</p>
  </div>
</div>

<script type="module">
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "${props.supabaseUrl}",
  "${props.supabaseKey}"
);

// Add these lines:
const TIMEZONE = 'America/New_York'; // Change to your timezone

function isPastTime(dateStr, timeStr) {
  const now = new Date().toLocaleString("en-US", {timeZone: TIMEZONE});
  const currentDate = new Date(now);
  const currentDateStr = currentDate.toISOString().split("T")[0];
  
  // If not today, allow all times
  if (dateStr !== currentDateStr) return false;
  
  // If today, check if time has passed
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const slotMinutes = toMinutes(timeStr);
  
  return slotMinutes <= currentMinutes;
}

// State
let currentStep = 1;
let bookingData = {
  worker: 'dina',
  categoryId: '',
  service: '',
  serviceDuration: 30,
  servicePrice: 0,
  date: '',
  dateDisplay: '',
  time: '',
  name: '',
  phone: ''
};
let servicesCache = {};

// Elements
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const popupOverlay = document.getElementById('popupOverlay');

// Initialize
loadAllServices();
loadCategories();

// Navigation
backBtn.onclick = () => changeStep(currentStep - 1);
nextBtn.onclick = () => changeStep(currentStep + 1);
submitBtn.onclick = submitBooking;

function changeStep(step) {
  if (step < 1 || step > 4) return;
  if (!canProceed(currentStep) && step > currentStep) return;
  
  currentStep = step;
  updateUI();
  
  if (step === 2) loadDates();
  if (step === 4) updateSummary();
}

function canProceed(step) {
  switch(step) {
    case 1: return bookingData.service;
    case 2: return bookingData.date && bookingData.time;
    case 3: return bookingData.name && bookingData.phone.length === 14;
    default: return true;
  }
}

function updateUI() {
  document.querySelectorAll('.step').forEach(el => {
    const stepNum = parseInt(el.dataset.step);
    el.classList.toggle('active', stepNum === currentStep);
    el.classList.toggle('completed', stepNum < currentStep);
  });
  
  document.querySelectorAll('.step-content').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step) === currentStep);
  });
  
  backBtn.style.display = currentStep > 1 ? 'block' : 'none';
  nextBtn.style.display = currentStep < 4 ? 'block' : 'none';
  submitBtn.style.display = currentStep === 4 ? 'block' : 'none';
  nextBtn.disabled = !canProceed(currentStep);
}

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toTimeString(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return \`\${h}:\${m}\`;
}

async function loadAllServices() {
  const { data, error } = await supabase.from("services").select("*");
  if (error) return console.error(error);
  
  data.forEach(s => {
    servicesCache[s.name] = {
      duration: s.duration,
      price: s.price
    };
  });
}

async function loadCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) return console.error(error);
  
  const select = document.getElementById('categorySelect');
  select.innerHTML = '<option value="">Choose a category</option>' +
    data.map(c => \`<option value="\${c.id}">\${c.name}</option>\`).join("");
}

document.getElementById('categorySelect').onchange = async (e) => {
  bookingData.categoryId = e.target.value;
  bookingData.service = '';
  const grid = document.getElementById('serviceGrid');
  
  if (!bookingData.categoryId) {
    grid.innerHTML = '<div class="loading"><div>Please select a category</div></div>';
    return;
  }
  
  grid.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading services...</div></div>';
  
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("category_id", bookingData.categoryId)
    .order("name");
  
  if (error) {
    grid.innerHTML = '<div class="no-data">Error loading services</div>';
    return;
  }
  
  if (data.length === 0) {
    grid.innerHTML = '<div class="no-data">No services available</div>';
    return;
  }
  
  grid.innerHTML = data.map(s => \`
    <div class="selection-item" onclick="selectService('\${s.name}', \${s.duration}, \${s.price})">
      <div><strong>\${s.name}</strong></div>
      <div style="font-size: 12px; margin-top: 4px; opacity: 0.8;">$\${s.price} • \${s.duration}min</div>
    </div>
  \`).join("");
};

window.selectService = (name, duration, price) => {
  bookingData.service = name;
  bookingData.serviceDuration = duration;
  bookingData.servicePrice = price;
  
  document.querySelectorAll('#serviceGrid .selection-item').forEach(el => {
    el.classList.remove('selected');
  });
  event.target.closest('.selection-item').classList.add('selected');
  
  updateUI();
};

async function loadDates() {
  const grid = document.getElementById('dateGrid');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading dates...</div></div>';
  
  if (!bookingData.service) {
    grid.innerHTML = '<div class="no-data">Please select a service first</div>';
    return;
  }
  
  try {
    const { data: bh } = await supabase
      .from("business_hours")
      .select("*")
      .eq("worker", bookingData.worker)
      .single();
    
    if (!bh) {
      grid.innerHTML = '<div class="no-data">Business hours not set</div>';
      return;
    }

    const business = {
      open: bh.open.slice(0, 5),
      close: bh.close.slice(0, 5),
      lunchEnabled: bh.lunch_enabled,
      lunchStart: bh.lunch_start ? bh.lunch_start.slice(0, 5) : null,
      lunchEnd: bh.lunch_end ? bh.lunch_end.slice(0, 5) : null
    };
    
    const { data: weekly } = await supabase
      .from("weekly_days_off")
      .select("*")
      .eq("worker", bookingData.worker)
      .eq("is_off", true);
    
    const { data: unavailDates } = await supabase
      .from("unavailable_dates")
      .select("date")
      .eq("worker", bookingData.worker);
    
    const daysOff = weekly?.map(d => d.day) || [];
    const unavailableDates = unavailDates?.map(d => d.date) || [];
    
    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 60);
    const endDateStr = endDate.toISOString().split("T")[0];
    
    const { data: allBookings } = await supabase
      .from("appointments")
      .select("*")
      .eq("worker", bookingData.worker)
      .gte("date", startDate)
      .lte("date", endDateStr);
    
    const { data: allUnavailTimes } = await supabase
      .from("unavailable_times")
      .select("*")
      .eq("worker", bookingData.worker)
      .gte("date", startDate)
      .lte("date", endDateStr);
    
    const bookingsByDate = {};
    const unavailTimesByDate = {};
    
    allBookings?.forEach(b => {
      if (!bookingsByDate[b.date]) bookingsByDate[b.date] = [];
      bookingsByDate[b.date].push(b);
    });
    
    allUnavailTimes?.forEach(u => {
      if (!unavailTimesByDate[u.date]) unavailTimesByDate[u.date] = [];
      unavailTimesByDate[u.date].push(u);
    });
    
    const bStart = toMinutes(business.open);
    const bEnd = toMinutes(business.close);
    const hasLunch = business.lunchEnabled && business.lunchStart && business.lunchEnd;
    const lStart = hasLunch ? toMinutes(business.lunchStart) : null;
    const lEnd = hasLunch ? toMinutes(business.lunchEnd) : null;
    
    let html = '';
    let datesAdded = 0;
    
    for (let i = 0; i < 60 && datesAdded < 30; i++) {
  const now = new Date().toLocaleString("en-US", {timeZone: TIMEZONE});
  const d = new Date(now);
  d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      
      if (daysOff.includes(dayName) || unavailableDates.includes(dateStr)) continue;
      
      const bookings = bookingsByDate[dateStr] || [];
      const unavailTimes = unavailTimesByDate[dateStr] || [];
      
      let hasAvailableSlot = false;
      
      for (let m = bStart; m + bookingData.serviceDuration <= bEnd; m += 15) {
  const slot = toTimeString(m);

  // 🚨 NEW: skip past times for TODAY (NY time)
  if (isPastTime(dateStr, slot)) continue;
        const slotEnd = m + bookingData.serviceDuration;
        
        if (hasLunch && !(slotEnd <= lStart || m >= lEnd)) continue;
        
        let conflict = bookings.some(b => {
          const dur = b.duration || servicesCache[b.service]?.duration || 60;
          const bStart = toMinutes(b.time);
          const bEnd = bStart + dur;
          return !(slotEnd <= bStart || m >= bEnd);
        });
        if (conflict) continue;
        
        conflict = unavailTimes.some(u => {
          const uStart = toMinutes(u.start);
          const uEnd = toMinutes(u.end);
          return !(slotEnd <= uStart || m >= uEnd);
        });
        if (conflict) continue;
        
        hasAvailableSlot = true;
        break;
      }
      
      if (!hasAvailableSlot) continue;
      
      const displayDate = d.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
      const displayDay = d.toLocaleDateString("en-US", { weekday: 'short' });
      
      html += \`
        <div class="selection-item date-item" onclick="selectDate('\${dateStr}', '\${displayDate}')">
          <div class="date-day">\${displayDay}</div>
          <div><strong>\${displayDate}</strong></div>
        </div>
      \`;
      datesAdded++;
    }
    
    grid.innerHTML = html || '<div class="no-data">No available dates</div>';
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="no-data">Error loading dates</div>';
  }
}

window.selectDate = (dateStr, displayDate) => {
  bookingData.date = dateStr;
  bookingData.dateDisplay = displayDate;
  bookingData.time = '';
  
  document.querySelectorAll('#dateGrid .selection-item').forEach(el => {
    el.classList.remove('selected');
  });
  event.target.closest('.selection-item').classList.add('selected');
  
  loadTimes(dateStr);
};

async function loadTimes(dateStr) {
  const grid = document.getElementById('timeGrid');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div><div>Loading times...</div></div>';
  
  try {
    const { data: bh } = await supabase
      .from("business_hours")
      .select("*")
      .eq("worker", bookingData.worker)
      .single();
    
    const business = {
      open: bh.open.slice(0, 5),
      close: bh.close.slice(0, 5),
      lunchEnabled: bh.lunch_enabled,
      lunchStart: bh.lunch_start ? bh.lunch_start.slice(0, 5) : null,
      lunchEnd: bh.lunch_end ? bh.lunch_end.slice(0, 5) : null
    };
    
    const bStart = toMinutes(business.open);
    const bEnd = toMinutes(business.close);
    const hasLunch = business.lunchEnabled && business.lunchStart && business.lunchEnd;
    const lStart = hasLunch ? toMinutes(business.lunchStart) : null;
    const lEnd = hasLunch ? toMinutes(business.lunchEnd) : null;
    
    const { data: bookings } = await supabase
      .from("appointments")
      .select("*")
      .eq("worker", bookingData.worker)
      .eq("date", dateStr);
    
    const { data: unavailTimes } = await supabase
      .from("unavailable_times")
      .select("*")
      .eq("worker", bookingData.worker)
      .eq("date", dateStr);
    
    let html = '';
    
    for (let m = bStart; m + bookingData.serviceDuration <= bEnd; m += 15) {
      const slotEnd = m + bookingData.serviceDuration;
      
      if (hasLunch && !(slotEnd <= lStart || m >= lEnd)) continue;
      
      let conflict = false;
      if (bookings) {
        conflict = bookings.some(b => {
          const dur = b.duration || servicesCache[b.service]?.duration || 60;
          const bStart = toMinutes(b.time);
          const bEnd = bStart + dur;
          return !(slotEnd <= bStart || m >= bEnd);
        });
      }
      if (conflict) continue;
      
      if (unavailTimes) {
        conflict = unavailTimes.some(u => {
          const uStart = toMinutes(u.start);
          const uEnd = toMinutes(u.end);
          return !(slotEnd <= uStart || m >= uEnd);
        });
      }
      if (conflict) continue;
      
      const slot = toTimeString(m);
const isPast = isPastTime(dateStr, slot);

// Skip past times entirely - don't show them
if (isPast) continue;

html += \`
  <div class="selection-item time-slot" onclick="selectTime('\${slot}')">
    \${slot}
  </div>
\`;
    }
    
    grid.innerHTML = html || '<div class="no-data">No available times</div>';
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="no-data">Error loading times</div>';
  }
}

window.selectTime = (time) => {
  bookingData.time = time;
  
  document.querySelectorAll('#timeGrid .selection-item').forEach(el => {
    el.classList.remove('selected');
  });
  event.target.closest('.selection-item').classList.add('selected');
  
  updateUI();
};

document.getElementById('phoneInput').oninput = (e) => {
  let digits = e.target.value.replace(/\\D/g, "").slice(0, 10);
  let formatted = "";
  if (digits.length > 0) formatted = "(" + digits.substring(0, 3);
  if (digits.length >= 4) formatted += ") " + digits.substring(3, 6);
  if (digits.length >= 7) formatted += "-" + digits.substring(6, 10);
  e.target.value = formatted;
  bookingData.phone = formatted;
  updateUI();
};

document.getElementById('nameInput').oninput = (e) => {
  bookingData.name = e.target.value.trim();
  updateUI();
};

function updateSummary() {
  document.getElementById('summaryArtist').textContent = bookingData.worker.charAt(0).toUpperCase() + bookingData.worker.slice(1);
  document.getElementById('summaryService').textContent = bookingData.service;
  document.getElementById('summaryDate').textContent = bookingData.dateDisplay;
  document.getElementById('summaryTime').textContent = bookingData.time;
  document.getElementById('summaryDuration').textContent = bookingData.serviceDuration + ' minutes';
  document.getElementById('summaryPrice').textContent = '$' + bookingData.servicePrice;
  document.getElementById('summaryName').textContent = bookingData.name;
  document.getElementById('summaryPhone').textContent = bookingData.phone;
}

async function submitBooking() {
  submitBtn.disabled = true;
  submitBtn.textContent = 'Booking...';

  try {
    const { error } = await supabase.from("appointments").insert({
      worker: bookingData.worker,
      service: bookingData.service,
      date: bookingData.date,
      time: bookingData.time,
      price: bookingData.servicePrice,
      duration: bookingData.serviceDuration,
      customer_name: bookingData.name,
      customer_phone: bookingData.phone.replace(/\\D/g, "")
    });

    if (error) {
      console.error(error);
      alert("Failed to book appointment. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking';
      return;
    }

    popupOverlay.classList.add('show');
    setTimeout(() => {
      popupOverlay.classList.remove('show');
      window.location.reload();
    }, 3000);

  } catch (error) {
    console.error(error);
    alert('Failed to book appointment. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Booking';
  }
}

updateUI();
</script>
</body>
</html>`
}

addPropertyControls(BookingWidget, {
    supabaseUrl: {
        type: ControlType.String,
        title: "Supabase URL",
        defaultValue: "https://orbwnbzmefjokcijiusq.supabase.co",
    },
    supabaseKey: {
        type: ControlType.String,
        title: "Supabase Key",
        defaultValue: "sb_publishable_Em-mbbMmLjG_O-c5_8p-Mw_f8lBp_65",
    },
    headerTitle: {
        type: ControlType.String,
        title: "Header Title",
        defaultValue: "Book Your Appointment",
    },
    step1Label: {
        type: ControlType.String,
        title: "Step 1 Label",
        defaultValue: "Service",
    },
    step2Label: {
        type: ControlType.String,
        title: "Step 2 Label",
        defaultValue: "Date & Time",
    },
    step3Label: {
        type: ControlType.String,
        title: "Step 3 Label",
        defaultValue: "Your Details",
    },
    step4Label: {
        type: ControlType.String,
        title: "Step 4 Label",
        defaultValue: "Confirm",
    },
    fontFamily: {
        type: ControlType.String,
        title: "Font Family",
        defaultValue:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    headerGradient: {
        type: ControlType.String,
        title: "Header Gradient",
        defaultValue: "linear-gradient(135deg, #040404 0%, #4f4f4f 100%)",
    },
    accentGradient: {
        type: ControlType.String,
        title: "Accent Gradient",
        defaultValue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent Color",
        defaultValue: "#667eea",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Border Radius",
        defaultValue: 24,
        min: 0,
        max: 50,
        step: 1,
    },
    buttonRadius: {
        type: ControlType.Number,
        title: "Button Radius",
        defaultValue: 12,
        min: 0,
        max: 30,
        step: 1,
    },
})
