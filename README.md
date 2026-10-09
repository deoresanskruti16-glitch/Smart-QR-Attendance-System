# 🎓 SmartAttend - Smart QR Attendance System with GPS Geofencing

A modern, high-security **Smart QR Attendance System with GPS-Based Classroom Geofence Verification** designed for college/university lectures and engineering capstone demonstrations.

---

## 🚀 Key Features

### 📍 GPS-Based Classroom Geofence Verification (Anti-Proxy Engine)
- **Classroom Location Management**: Register and configure actual physical coordinates (Latitude, Longitude), permitted proximity radius (e.g. 15m–35m), and GPS accuracy tolerance thresholds.
- **Auto-GPS Coordinate Acquisition**: 1-click "Use My GPS" helper tool for faculty to automatically record classroom coordinates directly on-site using the browser Geolocation API.
- **Server-Side Geofencing Logic**: Validates student coordinates using the **Haversine Distance Formula** ($R = 6,371,000\text{ m}$) against the database-registered classroom.
- **GPS Accuracy Protection**: Rejects weak GPS fixes (e.g. $\pm 95\text{m} > \text{threshold}$) to avoid false verifications and requests student retry.
- **Built-in Viva & Demo Simulation Presets**: 1-click test scenarios for presentations:
  - 🟢 **Inside Class**: 4.5m away (Physical Presence Verified & Present Recorded)
  - 🔴 **In Canteen**: 135m away (Blocked with `OUT_OF_BOUNDS`)
  - 🟡 **Weak GPS Fix**: $\pm 95\text{m}$ (Prompted to step near a window and retry)
  - 🔵 **Live Device Hardware GPS**: Real-time sensor fix from mobile/laptop.

### 👨‍🏫 Faculty & Admin Portal
- **Faculty Authentication & Role-Based Access**: Role validation for Class Admin and Teachers.
- **Classroom Location Registration**: Full CRUD management of lecture halls, labs, and seminar halls (`/teacher/classrooms`).
- **Interactive Geofencing Sandbox**: Test any coordinate pair in real-time with instant Haversine distance readout.
- **Dynamic QR Code Generation**: 
  - Dynamic QR codes generated with cryptographic session tokens.
  - Bound to the designated **Classroom ID & Geofence**.
  - Configurable auto-expiry timers (1m, 2m, 5m, 10m).
- **Live Attendance Monitoring**:
  - Real-time attendee counter with geofence distance indicators.
  - CSV audit export including GPS distance, GPS accuracy, and verification status.
- **Reports & Analytics**:
  - Interactive **Weekly Attendance Bar Chart** and **Subject Turnout Line Chart** (`recharts`).
  - Attendance Defaulter table for students below 75% attendance.

### 📱 Student Attendance Portal
- **Mobile Scanner Interface**:
  - Live camera scanner with laser scan animation (`html5-qrcode`).
  - Image upload fallback and direct token fallback.
- **GPS Proximity Handshake**:
  - Live proximity indicator before marking attendance.
  - Prevents proxy attendance from hostels, canteens, or off-campus locations.
- **Anti-Duplicate Constraints**: Single attendance record per PRN per lecture session.
- **Contextual Error Handling**: Tailored screens for Out of Bounds, Weak GPS, Expired QR, and Duplicate Submissions.

---

## 📐 Mathematical Distance Engine (Haversine Formula)

$$\Delta\phi = \text{lat}_2 - \text{lat}_1, \quad \Delta\lambda = \text{lon}_2 - \text{lon}_1$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \operatorname{atan2}(\sqrt{a}, \sqrt{1-a})$$
$$d = R \cdot c \quad (R = 6,371,000\text{ meters})$$

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite 6
- **Routing**: React Router DOM v6
- **Geospatial Calculation**: Pure Mathematical Haversine Engine (`src/utils/geoUtils.js`)
- **QR Generation**: `qrcode`
- **QR Scanning**: `html5-qrcode`
- **Charts & Data Visualization**: `recharts`
- **Icons**: `lucide-react`
- **Styling**: Vanilla CSS Design System with CSS Variables, Dark Accents & Glassmorphism

---

## 💻 How to Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the automated geofencing test suite**:
   ```bash
   npm test
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - **Faculty / Admin Portal**: [http://localhost:5173/teacher/login](http://localhost:5173/teacher/login)
   - **Classroom Geofencing**: [http://localhost:5173/teacher/classrooms](http://localhost:5173/teacher/classrooms)
   - **Student Scanner**: [http://localhost:5173/student/scan](http://localhost:5173/student/scan)

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Faculty & Class Admin** | `yogeshpathak6@gmail.com` | `Rcpit@123` |

**Quick Demo Session Tokens**:
- `DEMO_CSF_02` (Active Session - Room 204)
- `DEMO_DBMS_01`
- `DEMO_MIS_03`
- `DEMO_UHV_04`
