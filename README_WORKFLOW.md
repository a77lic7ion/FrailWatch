# ElderWatch Morning Care Reassurance — System Workflow & Architecture Guide

> **Zero-Hardware Morning Safety Reassurance Protocol for Assisted Living, Retirement Villages & Frail Care Facilities**  
> Powered by **4TIFY SECURITY & Care Solutions**

---

## 1. Executive Summary & Overview

ElderWatch eliminates the need for morning door-to-door physical walking rounds across entire care facilities. Instead, it provides:
1. **A friction-free smartphone interface for residents** with two massive high-contrast buttons:
   - **BIG GREEN BUTTON:** `"I AM OK"` *(Yes)*
   - **BIG RED BUTTON:** `"I NEED HELP"` *(No / Assistance Needed)*
2. **A real-time triage dashboard for care nursing staff** showing who is checked in, who tapped help, and who has not responded by the morning cutoff time (e.g., 09:15 AM).
3. **Automated escalation**: Missed cutoffs immediately flag overdue residents, alerting staff to conduct targeted in-person checks only for residents who actually need it.

---

## 2. What Is the Resident Link & How Do Residents Access Their Screen?

### The Link Structure
Every resident enrolled in ElderWatch is assigned a persistent, secure verification token tied to their room, facility, and phone number.

The access links use the following formats:
- **Personalized 1-Click Verification Link**:  
  `https://[APP-DOMAIN]/?verify=[TOKEN]&home=[HOME_ID]`  
  *Example:* `https://elderwatch.app/?verify=ew_margaret_8921&home=home-benoni-01`
- **Direct Resident Profile Link**:  
  `https://[APP-DOMAIN]/?residentId=[RESIDENT_ID]`  
  *Example:* `https://elderwatch.app/?residentId=res-1`
- **Standard Check-In Mode URL**:  
  `https://[APP-DOMAIN]/?mode=checkin`  
  *(Opens the currently paired resident screen stored in the phone's browser cache)*

---

### How Residents Access the Screen (Step-by-Step)

#### **Step 1: Enrollment by Facility Nurse or Administrator**
1. Staff opens the **Staff Morning Dashboard** and clicks **"Add Resident"**.
2. Staff enters:
   - **Resident Full Name** (e.g., *Margaret Thompson*)
   - **Room & Wing** (e.g., *Room 14, Willow Cottage*)
   - **Cell Phone Number** (e.g., *+27 82 555 1201*)
   - **Assigned Caregiver** (e.g., *Sr. Sarah Botha*)
   - **Emergency Family Contact** (e.g., *Claire Thompson, Daughter, +27 83 444 8921*)
3. The system generates the unique link and saves the record in Google Cloud Firestore.

#### **Step 2: Sending the Link to the Resident's Phone**
From the dashboard, staff can send the link via:
- **WhatsApp**: 1-click button opens WhatsApp with a pre-written message:  
  *"Good morning Margaret! Here is your ElderWatch morning check-in link for Benoni Frail Care. Tap this link every morning before 09:15 to let Sr. Sarah know you are safe: https://... "*
- **SMS**: Staff copies the invite message and texts it directly to the senior's phone number.
- **QR Code Scan**: If nursing staff or visiting family are in the room, they can simply point the senior's phone camera at the on-screen QR code.

#### **Step 3: First Tap & Automatic Device Pairing**
1. The resident taps the link in their SMS or WhatsApp message.
2. The phone opens directly into the **Senior Check-In Website**.
3. **No username or password required**: The security token automatically registers the smartphone with the care home database.
4. The screen greets the senior personally:  
   *"Good morning, Margaret! — Room 14 · Willow Cottage"*

#### **Step 4: Adding to Phone Home Screen (1-Tap App Icon)**
To make it effortless every day without digging through text messages:
- **On iPhone (Safari)**: Tap the **Share** button (box with upward arrow) → Scroll down and tap **"Add to Home Screen"** → Tap **"Add"**.
- **On Android (Chrome)**: Tap the **3 vertical dots** (top right) → Tap **"Add to Home screen"** or **"Install app"**.
- Now an **ElderWatch icon** appears directly on the resident's phone home screen like a native mobile app!

---

## 3. The Senior Experience (Yes / No Screen)

When the resident opens ElderWatch each morning, they see a clean, distraction-free screen designed specifically for senior eyes and arthritic hands:

### 1. High Contrast Identity Banner
- Displays today's date, the senior's first name, room number, and the morning cutoff time (e.g., `09:15 AM`).
- Mentions their assigned sister on duty (e.g., `Assigned: Sr. Sarah Botha`).

### 2. The Primary Decision: Two Giant Buttons
- **🟢 BIG GREEN BUTTON: "I AM OK" (YES)**
  - Size: 110px+ height, full screen width.
  - Action: Tapping plays a pleasant chime, gives subtle vibration feedback, and records:
    - Status: `Checked In (OK)`
    - Timestamp: e.g., `08:14 AM`
  - Reassurance message: *"Have a wonderful morning! Your check-in is saved with care staff."*
  - An undo option is available if tapped accidentally.
- **🔴 BIG RED BUTTON: "I NEED HELP" (NO)**
  - Size: 85px+ height, high-visibility crimson.
  - Action: Tapping plays an audible alert, vibrates the phone, and dispatches an instant emergency alert to the nurse on duty:
    - Status: `NOT OK / HELP REQUESTED`
    - Nurse notification: *"Alert: Margaret Thompson in Room 14 tapped I NEED HELP."*
  - Reassurance message: *"Care staff have been alerted. Sister Sarah is on her way to Room 14."*

### 3. 7-Day Peace-of-Mind Strip
- Shows a 7-day visual history (green checkmarks) confirming their morning check-ins for the week.

### 4. Direct Nurse Phone Call
- A 1-tap **"Call Care Desk"** button directly dials the nurse station.

---

## 4. The Care Staff & Nursing Workflow

### Morning Protocol Timeline
1. **06:30 AM — System Resets**: Daily board opens in `awaiting` state.
2. **06:30 – 09:15 AM — Natural Check-Ins**: As seniors wake up, have tea, and tap their green button, their card turns green (`Checked in at 08:14 AM`).
3. **Immediate Alerts**: If anyone taps **"I NEED HELP"**, their card flashes crimson with an audible chime and dispatch alert.
4. **09:15 AM — Morning Cutoff Reached**:
   - Any resident still in `awaiting` state automatically flips to **`⚠️ OVERDUE`**.
   - The dashboard prioritizes these residents in an **Urgent Attention Queue**.
5. **09:15 – 09:30 AM — Targeted Physical Rounds**:
   - Instead of checking 80 rooms, nursing staff only visits the 2 or 3 rooms that are marked `OVERDUE` or `NEEDS HELP`.
   - Staff checks the resident in person, confirms they are safe, and taps **"Mark Safe (In-Person Check)"**.

---

## 5. Mobile Optimization Features

The entire application is optimized for mobile screens (smartphones and tablets):
- **Responsive Layout**: Designed mobile-first for touch screens from 360px up to large desktop monitors.
- **Mobile Bottom Navigation Bar**: Easy thumb-friendly navigation on phones to switch between Staff Triage, Senior Screen, Simulator, and Family Hub.
- **Haptic Feedback**: Uses `navigator.vibrate` on mobile devices when tapping buttons.
- **Sound Feedback**: Synthesizes pleasant reassurance chimes via Web Audio API without external audio file latency.
- **Offline / Local Persistence**: Remembers linked resident identity even if the browser is closed or refreshed.

---

## 6. Cloud Database & Firebase Storage

All resident profiles, check-in timestamps, and facility settings are stored in **Google Cloud Firestore**:
- **Project ID**: `gen-lang-client-0808815070`
- **Database**: `ai-studio-elderwatch-03638f06-0745-4e6f-b43d-eabc49175051`
- **Collections**:
  - `residents`: Master list of residents, room numbers, contact info, and device verification tokens.
  - `homes`: Facility definitions, locations, and cutoff times.
  - `checkin_events`: Historical audit log of every morning check-in and alert.
- **Security**: Firestore security rules ensure residents can verify and check in safely while preventing unauthorized data tampering.

---

*ElderWatch © 2026. In partnership with 4TIFY SECURITY & Care Solutions.*
