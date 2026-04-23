<!-- PROJECT HEADER -->
<p align="center">
  <table>
    <tr>
      <td align="left" width="250">
        <img src="https://github.com/hey-itz-sameerkhan/my-protfolio/blob/main/images/dashboard%20logo%20image.jpeg" alt="Logo" width="240" height="320">
      </td>
      <td align="left">
        <h1>🧑‍💻 Full-Stack Creative Task Management Dashboard</h1>
        <em>🚀 A next-generation, role-based, full-stack web application integrating advanced data visualization, 3D environments, and modern UI design. 🚀</em>
      </td>
    </tr>
  </table>
</p>

---

<p align="center">
  <a href="https://dashboard-creative-web-4v9ho8j1m-sameer-khans-projects-50a9a7fe.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-Explore%20Now-00f0ff?style=for-the-badge&logo=vercel&logoColor=black">
  </a>
  <!-- <img src="https://img.shields.io/github/license/hey-itz-sameerkhan/Dashboard---creative-web-app?style=for-the-badge" alt="License"> -->
  <img src="https://img.shields.io/github/last-commit/hey-itz-sameerkhan/Dashboard---creative-web-app?style=for-the-badge" alt="Last Commit">
  <img src="https://img.shields.io/badge/Made%20With-❤️%20React%20|%20Node.js%20|%20MongoDB%20|%20Express.js-blueviolet?style=for-the-badge" alt="Tech Stack">
  <img src="https://img.shields.io/github/stars/hey-itz-sameerkhan/Dashboard---creative-web-app?style=social" alt="GitHub Stars">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4-red?style=for-the-badge" alt="Made with Love">
</p>

---

## ✨ Overview

The **Full-Stack Creative Task Management Dashboard** merges **enterprise functionality** with **modern design** — combining:
- 🔐 Secure authentication & admin controls  
- 📊 Deep analytics & data visualization  
- 🧩 3D graphics and smooth UI transitions  
- 🧠 Role-based workflows for productivity  

> 💡 Designed for creators & professionals who crave *power, precision, and polish* — all in one dashboard.

---

## 🚀 Live Demo
🎯 **Experience it now:** [Dashboard – Creative Web App](https://dashboard-creative-web-4v9ho8j1m-sameer-khans-projects-50a9a7fe.vercel.app/)

---

## 🧠 Project Philosophy

A fusion of **data intelligence** and **digital art** — this app transforms complex operations into an elegant user experience:

- 🔸 Streamlined user + admin management  
- 🔸 Dynamic task visualization with 3D motion  
- 🔸 Analytical charts that reveal performance patterns  
- 🔸 Minimal, futuristic, and immersive UI  

---

## 🧩 Tech Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://skillicons.dev/icons?i=react) ![Vite](https://skillicons.dev/icons?i=vite) ![Tailwind](https://skillicons.dev/icons?i=tailwind) ![MUI](https://skillicons.dev/icons?i=materialui) ![ThreeJS](https://skillicons.dev/icons?i=threejs) | Interactive UI, 3D rendering, responsive design |
| **Backend** | ![NodeJS](https://skillicons.dev/icons?i=nodejs) ![Express](https://skillicons.dev/icons?i=express) ![MongoDB](https://skillicons.dev/icons?i=mongodb) ![Mongoose](https://img.shields.io/badge/Mongoose-ODM-green?style=flat) | RESTful API, database connection, server logic |
| **Auth & Security** | ![JWT](https://img.shields.io/badge/JWT-Auth-blue?logo=jsonwebtokens) ![Passport](https://img.shields.io/badge/Passport.js-OAuth2-success) ![Bcrypt](https://img.shields.io/badge/Bcrypt-Hashing-orange) | Token-based authentication + Google OAuth |
| **Data Visualization** | ![Chart.js](https://img.shields.io/badge/Chart.js-Visuals-lightgrey) ![Nivo](https://img.shields.io/badge/Nivo-Interactive-orange) ![Recharts](https://img.shields.io/badge/Recharts-Reports-yellow) | Advanced analytical charts |
| **Animation** | ![Framer Motion](https://img.shields.io/badge/FramerMotion-Smooth-purple) | Page + component animations |
| **File Handling** | ![Multer](https://img.shields.io/badge/Multer-Uploads-blue) ![React Easy Crop](https://img.shields.io/badge/react--easy--crop-Cropping-teal) | Secure uploads & client-side image cropping |
| **Calendar** | ![FullCalendar](https://img.shields.io/badge/FullCalendar-Events-brightgreen) | Manage & visualize task schedules |
| **Export Utility** | ![jsPDF](https://img.shields.io/badge/jsPDF-PDF%20Export-red) ![html2canvas](https://img.shields.io/badge/html2canvas-Snapshot-lightblue) | Export tables & dashboard reports |

---


## 🖼️ Preview  

<p align="center">
  <img src="https://github.com/user-attachments/assets/a517a841-a780-4423-a4bc-61f8b1f6704a" alt="Dashboard Preview" width="850" style="border-radius:10px; box-shadow:0 0 10px #aaa;">
</p>

---

## 💼 Core Features  

| 🧩 Category | 🌟 Description |
| :--- | :--- |
| 🔐 **Authentication** | Local + Google OAuth using **JWT & Passport.js** |
| 👑 **RBAC (Access Control)** | Restricts routes for Admin/User roles dynamically |
| 🧾 **Task Management** | Full CRUD + **Drag & Drop Kanban** using `react-beautiful-dnd` |
| 📅 **Calendar Scheduling** | Integrated **FullCalendar** for task/event timelines |
| 📊 **Analytics Dashboard** | Data visualization using **Nivo, Recharts & Chart.js** |
| 🖼️ **3D Visualization** | Interactive 3D scenes via **Three.js & R3F** |
| 📂 **File Uploads** | Backend: **multer**, Frontend: **react-easy-crop** |
| 📑 **Data Export** | One-click **PDF export** using jsPDF + html2canvas |

> ✨ Each feature built with **performance, elegance, and scalability** in mind.

---

## 🧱 Architecture Overview

🛠 **Backend (Node + Express + MongoDB)**  
- **Models:** `User.js`, `Task.js`, `Notification.js`  
- **Controllers:** Business logic for authentication & task control  
- **Middleware:** `auth.js`, `adminAuth.js` for JWT and RBAC  
- **Structure:** Pure MVC design  

🎨 **Frontend (React + Vite)**  
- Component-based architecture  
- Protected & Admin-only routes  
- Pages: `Home`, `Login`, `Signup`, `Dashboard`, `Tasks`, `Calendar`, `Charts`, `Account`, `Admin Management`  

---


## 📜 License  

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 💖 Acknowledgements  

> _"A harmonious blend of performance, creativity, and technology — redefining how dashboards feel and function."_  

---

## 🧡 Footer  

<p align="center">
  <b>✨ Created with ❤️ by <a href="https://github.com/hey-itz-sameerkhan">Sameer Khan</a> ✨</b><br>
  <img src="https://github.com/user-attachments/assets/14ac8217-5d75-423f-8a79-7a6d26e2e2ef" width="250" height="330" alt="Mini Logo"><br>
  <sub>© 2025 Dashboard – Creative Web App</sub>
</p>
