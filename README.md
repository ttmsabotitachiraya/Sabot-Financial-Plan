# 🏥 Hospital Budget Crowdsourcing App

ระบบ Web Application สำหรับบุคลากรในโรงพยาบาล เพื่อเสนอไอเดียการพัฒนาและขอรับงบประมาณ  
รองรับการใช้งานบน **Mobile 100%** พร้อม Admin Panel เชื่อมต่อ Google Sheets

---

## ✨ Features

### 👥 User Side
- **Home Dashboard** — สรุปงบรวม, จำนวนโครงการแยกตามความสำคัญ, งบแยกตามตึก
- **Submit Form** — Step-by-step form เสนอโครงการใหม่ (4 ขั้นตอน)
- **Tracking** — ติดตามสถานะโครงการพร้อม Progress Timeline

### 🛡️ Admin Side
- **Login** — Username/Password authentication
- **Dashboard** — จัดการรายการทั้งหมด, กรองตามสถานะ/ตึก/ความสำคัญ
- **Edit Entry** — แก้ไขข้อมูลทุกฟิลด์
- **Quick Status Change** — เปลี่ยนสถานะได้ทันทีจาก dropdown
- **Remark Modal** — เพิ่มหมายเหตุจากที่ประชุม

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 (Composition API) + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Icons | Lucide Vue Next |
| Routing | Vue Router 4 |
| Backend | Google Apps Script + Google Sheets |

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd hospital-budget-app
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=your_secure_password
```

> **หมายเหตุ:** หากไม่ตั้งค่า `VITE_GAS_URL` แอปจะทำงานใน **Demo Mode** โดยใช้ข้อมูลตัวอย่าง

### 3. Run Development Server

```bash
npm run dev
```

เปิด http://localhost:5173

### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## 📋 Google Apps Script Setup

### ขั้นตอนการติดตั้ง Backend

1. เปิด [Google Sheets](https://sheets.google.com) → สร้าง Spreadsheet ใหม่
2. ไปที่ **Extensions → Apps Script**
3. Copy code จากไฟล์ `gas/Code.gs` ทั้งหมดใส่ใน editor
4. เปลี่ยน `ADMIN_PASSWORD` ใน Code.gs ให้ตรงกับ `.env`
5. **Save** แล้วกด **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy **Web App URL** ไปใส่ใน `.env` ที่ `VITE_GAS_URL`

### Database Schema (Google Sheets Columns)

| Column | Type | Description |
|--------|------|-------------|
| id | String | Auto-generated UUID |
| timestamp | DateTime | วันที่เสนอ |
| title | String | หัวข้อโครงการ |
| location | String | ตึก OPD ใหม่ / ตึก OPD เก่า / ตึกโภชนาการ / อื่นๆ |
| budget_requested | Number | งบประมาณที่เสนอ (บาท) |
| priority | String | เขียว / เหลือง / แดง |
| description | String | รายละเอียด |
| status | String | เสนอใหม่ / รอเข้าที่ประชุม / อนุมัติ / ปฏิเสธ / ดำเนินการแล้ว |
| admin_remark | String | หมายเหตุจากที่ประชุม |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── BottomNav.vue          # Bottom navigation bar + FAB
│   ├── EntryCard.vue          # Card component สำหรับแสดงโครงการ
│   └── EntryDetailModal.vue   # Bottom sheet แสดงรายละเอียด
├── router/
│   └── index.ts               # Vue Router configuration
├── services/
│   └── api.ts                 # API layer + Mock data
├── stores/
│   └── appStore.ts            # Global state management (reactive)
├── types/
│   └── index.ts               # TypeScript types + constants
├── views/
│   ├── HomeView.vue           # Dashboard หน้าหลัก
│   ├── SubmitView.vue         # Form เสนอโครงการ
│   ├── TrackingView.vue       # ติดตามสถานะ
│   ├── AdminLoginView.vue     # Admin login
│   └── AdminDashboardView.vue # Admin management
├── App.vue
├── main.ts
└── style.css

gas/
└── Code.gs                    # Google Apps Script backend
```

---

## 🎨 Design System

### Priority Colors

| Priority | Color | Hex | Meaning |
|----------|-------|-----|---------|
| 🔴 แดง | Red | `#EF4444` | เร่งด่วนมาก |
| 🟡 เหลือง | Amber | `#F59E0B` | เร่งด่วน |
| 🟢 เขียว | Emerald | `#10B981` | ทั่วไป |

### Status Flow

```
เสนอใหม่ → รอเข้าที่ประชุม → อนุมัติ → ดำเนินการแล้ว
                                    ↘ ปฏิเสธ
```

---

## 🔐 Admin Access

| Field | Default Value |
|-------|--------------|
| Username | `admin` |
| Password | `admin1234` |

> ⚠️ **เปลี่ยน password ก่อน deploy จริงทุกครั้ง!**
> แก้ไขใน `.env` และ `gas/Code.gs`

---

## 📱 Mobile Support

แอปนี้ออกแบบมาสำหรับ **Mobile-First** โดยเฉพาะ:
- Bottom Navigation Bar
- Floating Action Button (+) สำหรับเพิ่มโครงการ
- Touch-friendly buttons (min 44px)
- Bottom Sheet Modals
- Safe area padding สำหรับ iPhone notch

---

## 🔧 API Actions (Google Apps Script)

| Action | Description | Auth Required |
|--------|-------------|---------------|
| `READ_ALL` | ดึงข้อมูลทั้งหมด | ❌ |
| `CREATE` | เพิ่มโครงการใหม่ | ❌ |
| `UPDATE_STATUS` | อัปเดตสถานะ + หมายเหตุ | ✅ Admin |
| `EDIT_ENTRY` | แก้ไขข้อมูลทุกฟิลด์ | ✅ Admin |

---

## 📦 Scripts

```bash
npm run dev          # Start development server
npm run build        # Type-check + Build production
npm run preview      # Preview production build (port 4173)
npm run preview:open # Preview + auto-open browser
```

---

## 🌐 Demo Mode

เมื่อไม่ได้ตั้งค่า `VITE_GAS_URL` แอปจะทำงานใน **Demo Mode**:
- ใช้ข้อมูลตัวอย่าง 8 โครงการ
- ทุก Action จะ simulate ใน memory
- มีป้าย **DEMO** แสดงที่หัวหน้า
- Admin login: `admin` / `admin1234`
- ข้อมูลจะ reset เมื่อ refresh หน้า

---

*Built with ❤️ for Hospital Staff*