<!-- PROJECT LOGO -->
<p align="center">
  <img src="https://github.com/user-attachments/assets/ca7110c3-ad7d-426e-8b2f-17218f7223e5" alt="Logo" width="250" height="320">
</p>

<h1 align="center">🧑‍💻 Full-Stack Creative Task Management Dashboard</h1>

<p align="center">
  <em>🚀 A next-generation, role-based, full-stack web application integrating advanced data visualization, 3D environments, and modern UI design. 🚀</em>
</p>

<p align="center">
  <a href="https://dashboard-creative-web-app.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-Click%20Here-brightgreen?style=for-the-badge" alt="Live Demo"></a>
  <img src="https://img.shields.io/github/license/hey-itz-sameerkhan/Dashboard---creative-web-app?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Made%20With-❤️%20React%20|%20Node.js%20|%20MongoDB-blueviolet?style=for-the-badge" alt="Tech Stack">
</p>

---

## ✨ Overview

The **Full-Stack Creative Task Management Dashboard** is a powerful, role-based, task-management web app built with modern technologies.  
It merges **functional excellence** (authentication, RBAC, analytics, exports) with **visual creativity** (3D scenes, smooth UI transitions, interactive charts).

> 🔥 Built for professionals who want *data, design, and depth* — all in one dynamic dashboard.

---

## 🚀 Live Demo
🎯 **Try it out now:** [Dashboard – Creative Web App](https://dashboard-creative-web-app.vercel.app/)

---

## 🧠 Project Philosophy

This project bridges **enterprise-level functionality** with **creative web aesthetics**, offering:
- Secure user & admin management.
- Task scheduling, tracking, and analytics.
- Advanced data visualization with 3D & chart integrations.
- A smooth, delightful UX powered by Framer Motion animations.

---

## 🧩 Tech Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://skillicons.dev/icons?i=react,vite,tailwind,materialui,threejs) | UI, 3D rendering, responsive styling |
| **Backend** | ![NodeJS](https://skillicons.dev/icons?i=nodejs,express,mongodb) | RESTful API, database & authentication |
| **Auth & Security** | ![JWT](https://img.shields.io/badge/JWT-Auth-blue?logo=jsonwebtokens) ![bcrypt](https://img.shields.io/badge/Bcrypt-Hashing-orange) | Secure token-based authentication |
| **Data Visualization** | ![Chart.js](https://img.shields.io/badge/Chart.js-Analytics-lightgrey) ![Nivo](https://img.shields.io/badge/Nivo-Visualization-orange) ![Recharts](https://img.shields.io/badge/Recharts-Reports-yellow) | Interactive & analytical reports |
| **Animation** | ![Framer Motion](https://img.shields.io/badge/FramerMotion-Smooth%20Transitions-purple) | Component & route transitions |
| **File Handling** | `multer`, `react-easy-crop` | Uploads & client-side cropping |
| **Calendar** | `@fullcalendar` | Event & schedule management |
| **Export Utility** | `jspdf`, `html2canvas` | Export reports to PDF |

---

## 💼 Core Features


| Category | Description |
| :--- | :--- |
| 🔐 **Authentication** | Local + Google OAuth using JWT & Passport.js |
| 👑 **RBAC** | Role-Based Access Control for Admin/User routes |
| 🧾 **Task Management** | CRUD + Drag & Drop (Kanban via react-beautiful-dnd) |
| 📅 **Calendar Scheduling** | FullCalendar for task & event timelines |
| 📊 **Analytics Dashboard** | Nivo, Recharts & Chart.js for deep insights |
| 🖼️ **3D Visualization** | Three.js & R3F scenes within React components |
| 📂 **File Uploads** | multer for backend, react-easy-crop for client |
| 📑 **Data Export** | jsPDF + html2canvas for downloadable reports |

---

## 🧱 Architecture Overview

**Backend:** MVC architecture (Models, Controllers, Routes, Middleware)  
- Models → `User.js`, `Task.js`, `Notification.js`  
- Middleware → `auth.js`, `adminAuth.js`  

**Frontend:** Component-based React structure with protected routes  
- Protected user dashboard & Admin-only routes  
- Pages: `Home`, `Login`, `Signup`, `Dashboard`, `Tasks`, `Calendar`, `Charts`, `Account`, `Admin Management`

---

## 🖼️ Preview

<p align="center">
  <img src="https://github.com/user-attachments/assets/a517a841-a780-4423-a4bc-61f8b1f6704a" alt="Dashboard Preview" width="800">
</p>

---

## 📜 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 💖 Acknowledgements

> _"This application successfully integrates robust operational utility with advanced, next-generation visual design — transforming complex data into dynamic, actionable insights."_

---

## 🧡 Footer

<p align="center">
  <b>✨ Created with ❤️ by <a href="https://github.com/hey-itz-sameerkhan">Sameer Khan</a> ✨</b><br>
  <sub>© 2025 Dashboard – Creative Web App</sub>
</p>
