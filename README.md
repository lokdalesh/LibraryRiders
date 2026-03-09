# Nexus - Premium Library Management System (LMS)

A modern, fully functional frontend prototype for a Library Maintenance System built with Vanilla HTML, CSS, and JavaScript. 

![Nexus LMS Dashboard](.github/preview.png) *(Add a screenshot here later)*

## Features

This single-page application (SPA) prototype includes four main modules:

*   **Dashboard:** High-level metrics, active counters, and a recent transaction feed.
*   **Books Catalog:** Inventory tracking table with search and mock data.
*   **Member Directory:** User management table displaying role, active loans, and account status.
*   **Issue & Return Terminal:** An intuitive checkout and return flow that auto-calculates return dates and overdue fines.

## Design Highlights

Built specifically to look and feel premium:
- **Glassmorphism Theme:** Semi-transparent frosted glass panels (`backdrop-filter: blur`).
- **Modern Typography:** Utilizing the clean geometric 'Outfit' font from Google Fonts.
- **Micro-Animations:** Fluid CSS transitions on hover, pulse effects on notifications, and smooth fade-ins between pages.
- **Dynamic Content:** JavaScript handles all routing between views without page reloads, and injects stateful mock data into tables.

## Quick Start (How to run)

Since this project relies entirely on client-side frontend code (Vanilla web stack), no build tools or package managers are required!

### Option 1: Direct File
Just double-click the `index.html` file to open it directly in your web browser. 

### Option 2: Local Development Server
For the best experience (to ensure fonts and local assets render perfectly), serve it via a local HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve .
```
Then navigate to `http://localhost:8000` in your browser.

## Tech Stack
*   **HTML5**
*   **CSS3** (CSS Variables, Flexbox/Grid, Animations)
*   **JavaScript (ES6+)**
*   **Icons:** [Boxicons](https://boxicons.com/)
*   **Fonts:** [Google Fonts (Outfit)](https://fonts.google.com/specimen/Outfit)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
