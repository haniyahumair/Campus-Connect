# 🎓 Campus Connect

**A centralized platform for university students to discover, create, and register for campus events.**

Campus Connect solves the problem of scattered event information across multiple platforms by providing a single, verified student-only hub where all campus events can be discovered, promoted, and managed.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Product Release Plan](#product-release-plan)
- [Known Issues](#known-issues)
- [Contributors](#contributors)

---

## 🌟 Overview

Campus Connect addresses the common problem of students missing campus events due to fragmented information across emails, social media, posters, and group chats. Our platform provides:

- **Centralized Event Discovery**: All campus events in one organized, searchable location
- **Student Authentication**: Secure login and session management
- **Easy Event Management**: Simple event creation, submission, and admin approval workflow
- **Category-Based Browsing**: Filter events by type, price, and date
- **Cart & Registration System**: Add events to a cart and complete checkout in one flow
- **Admin Moderation**: Role-based admin panel for approving, rejecting, and managing submitted events
- **AI Chatbot**: An AI-powered assistant to handle student inquiries and support event moderation
- **Google Maps Integration**: Event venue locations displayed on an interactive map

Inspired by the success of Classmate (a student discount platform in Qatar), Campus Connect applies the same community-focused approach to campus event management.

---

## ✨ Features

### Current Features

#### 🔐 Authentication & User Management
- User registration and secure login
- Session management — client-side prototype uses localStorage; Supabase Auth provides live JWT-based sessions in the integration layer
- Protected pages with authentication gating and post-login redirect via `returnTo` query parameter
- Profile page displaying user information, upcoming registered events, and created events

#### 📅 Event Discovery
- Browse all campus events dynamically rendered from storage
- Filter by category (Academic, Sports, Arts & Culture, Tech & Innovation, Workshop, Career, Social, Health & Wellness, Entertainment)
- Filter by price and date; full-text search by event name
- Detailed event pages with venue, date, time, pricing, and organiser contact information
- Google Maps integration on event detail pages to display venue location

#### 🎫 Event Creation & Moderation
- Event creation form capturing title, description, date, time, venue, price, category, and contact email
- Events submitted with pending approval status
- Admin panel with role-based access control enforced via Supabase profiles table
- Admins can approve or reject events with a written reason; organiser notifications triggered automatically on status change

#### 🤖 AI Chatbot
- AI-powered assistant integrated into the platform
- Handles student inquiries about event logistics
- Supports the admin moderation flow
- Runs via a local Node.js server — see [Getting Started](#getting-started) for setup instructions

#### 🛒 Cart & Registration
- Add events to cart (authentication required; unauthenticated users redirected to login)
- Duplicate prevention with user alert feedback
- Remove items from cart
- Checkout flow with confirmation message; registered events appear in user profile under "My Upcoming Events"
- Cart data persisted to Supabase in the live integration layer

#### 💼 User Profile
- View registered upcoming events ("My Upcoming Events")
- View submitted and created events ("My Created Events")
- Edit profile details
- Sign out functionality

---

## 🛠 Tech Stack

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

**Backend & Data Storage:**
- Supabase (PostgreSQL database, Auth, REST API) — live integration layer
- localStorage — client-side simulation for prototype flows
- Node.js — local server for AI chatbot

**Design:**
- Figma — UI design and component prototyping
- Google Fonts (Inter, Fraunces, Manrope)

**APIs:**
- Google Maps API — venue location display on event detail pages
- AI Chatbot API — integrated via Node.js server

**Version Control:**
- Git / GitHub

**Originally Planned Backend (superseded by Supabase for the prototype):**
- Node.js + Express.js
- MongoDB

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js installed (required for the AI chatbot)
- A local web server (recommended for the main app)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/haniyahumair/Campus-Connect.git
   cd Campus-Connect
   ```

2. **Start the AI Chatbot server**

   In a terminal, run:
   ```bash
   node server.js
   ```
   The chatbot server will start locally and must be running for the AI assistant feature to work.

3. **Open the main application**

   **Option A: Using a local server (recommended)**
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js http-server
   npx http-server
   ```
   Then open `http://localhost:8000` in your browser.

   **Option B: Direct file opening**
   - Open `home.html` directly in your browser
   - Note: Some features may behave differently without a local server

4. **Start using Campus Connect**
   - Register with your university email
   - Browse and filter events
   - Add events to your cart and register
   - Create and submit your own events for admin approval

---

## 📁 Project Structure

```
campus-connect/
├── assets/
│   ├── Icons/                    # UI icons and logos
│   └── Images/                   # Event images and graphics
├── styles/
│   ├── global.css                # Shared styles across all pages
│   ├── home.css                  # Homepage styles
│   ├── events.css                # Events page styles
│   ├── eventDetails.css          # Event detail page styles
│   ├── cart.css                  # Cart page styles
│   ├── profile.css               # Profile page styles
│   ├── admin.css                 # Admin dashboard styles
│   ├── create.css                # Event creation page styles
│   └── login-register.css        # Login and signup page styles
├── auth.js                       # Authentication logic (localStorage + Supabase Auth)
├── login.js                      # Login form handling and post-login redirection
├── signup.js                     # Registration form handling
├── cart.js                       # Cart management and checkout
├── events.js                     # Event browsing, filtering, and search
├── admin.js                      # Admin panel, moderation logic, and role-based access
├── loggedInLogic.js              # Navigation and auth state UI across all pages
├── navbarComponent.js            # Reusable navigation bar component
├── footerComponent.js            # Reusable footer component
├── eventCardsComponents.js       # Reusable event card rendering function
├── cardDetails.js                # Event detail page interactions and Google Maps integration
├── server.js                     # Node.js server for AI chatbot
├── home.html                     # Landing page
├── events.html                   # Browse events page
├── eventDetails.html             # Individual event detail page
├── create.html                   # Create event page
├── cart.html                     # Shopping cart page
├── profile.html                  # User profile page
├── admin.html                    # Admin dashboard page
├── login.html                    # Login page
├── signup.html                   # Registration page
└── README.md
```

---

## 📖 Usage

### For Students (Event Attendees)

1. **Register / Login**
   - Click "Login" in the navigation bar
   - Create an account or log in with existing credentials
   - You will be redirected back to your original destination after authenticating

2. **Browse Events**
   - View all events on the homepage or Events page
   - Use category, price, and date filters to find relevant events
   - Search by event name
   - Click "View Details" to see the full event page including venue on Google Maps

3. **Register for Events**
   - Click "Add to Cart" on the event details page
   - View your cart and proceed to checkout
   - Registered events appear in your profile under "My Upcoming Events"

4. **Create an Event**
   - Navigate to the Create Event page
   - Fill in all event details and submit
   - Your event will appear as pending until reviewed and approved by an admin

5. **Use the AI Chatbot**
   - The chatbot is available on the platform to answer questions about events and logistics
   - Requires `node server.js` to be running locally (see Getting Started)

### For Administrators

1. **Access the Admin Panel**
   - Log in with an admin-role account
   - Navigate to the Admin Dashboard

2. **Moderate Events**
   - Review all pending event submissions
   - Approve or reject events with a written reason
   - Organisers are automatically notified of status changes via the notifications system

---

## 📸 Screenshots

- Homepage with event cards

  <img width="1267" height="720" alt="image" src="https://github.com/user-attachments/assets/7c895f91-ca2b-488a-b715-fbc316505b37" />
  <img width="1267" height="720" alt="image" src="https://github.com/user-attachments/assets/e9b9d8c4-7d66-4c32-8ca4-31e4e9d2521a" />

- Event page

  <img width="1267" height="720" alt="image" src="https://github.com/user-attachments/assets/891512b8-fcdf-4965-871e-e100bc80c82b" />
  <img width="1267" height="720" alt="image" src="https://github.com/user-attachments/assets/1d72254a-b9d8-463a-95a4-27671f9ef232" />

- Event Detail page

  <img width="1267" height="716" alt="image" src="https://github.com/user-attachments/assets/41f857ee-1c6c-427a-8d34-806b2e2221a8" />
  <img width="1267" height="716" alt="image" src="https://github.com/user-attachments/assets/b325e19f-34a6-4f4a-9620-cfc00f217774" />

- Registration flow

  <img width="1267" height="720" alt="image" src="https://github.com/user-attachments/assets/2acb0f21-0e07-45a8-9940-5817b5e3f412" />
  <img width="1267" height="720" alt="image" src="https://github.com/user-attachments/assets/ba9580d7-f385-4faf-904a-6aa4028a2996" />

- User profile

  <img width="1267" height="720" alt="image" src="https://github.com/user-attachments/assets/52f0af39-65fa-4ee3-9ff1-f7f6bfffe7f9" />
  <img width="1267" height="610" alt="image" src="https://github.com/user-attachments/assets/50b86dc5-139e-4349-b1d4-e2e4eac2e122" />

- Event creation form

  <img width="1267" height="712" alt="image" src="https://github.com/user-attachments/assets/6fa1b1f9-3162-4595-ba82-d2eaf6a8afe0" />
  <img width="1267" height="716" alt="image" src="https://github.com/user-attachments/assets/3f6da120-08f5-43f2-ba48-731d406c6520" />

- Cart page

  <img width="1267" height="716" alt="image" src="https://github.com/user-attachments/assets/470b34a8-a258-45f0-a9f0-cc9d4f51fa2e" />
  <img width="1267" height="716" alt="image" src="https://github.com/user-attachments/assets/50e79265-730a-4283-8b05-66bbef5bb850" />

---

## 🔮 Future Product Release Plan

CampusConnect successfully delivered a functional MVP addressing the need for a centralized university event hub in Qatar. While the initial plan relied on a traditional MongoDB/Node.js stack, the team pivoted to a BaaS model using Supabase, enabling live authentication and database persistence within the project timeframe. Most Must Have requirements were met, including event discovery, cart registration, and a functional admin approval workflow.

### Phase 1 — Ecosystem Integration & Institutional Partnerships
- **University SSO Integration** — Connect directly with university databases to automate student verification via Single Sign-On
- **Strategic Sponsorships** — Partner with local Qatari businesses (cafes, bookstores, tech hubs) to offer exclusive CampusConnect Discounts, establishing a sustainable revenue model
- **Official University Sanctioning** — Transition from a student-led prototype to an officially recognised campus tool, ensuring all events meet institutional safety and policy standards

### Phase 2 — Operational Scaling
- **Native Mobile Deployment** — Transition the responsive web app into a native iOS/Android application with push notifications and event reminders
- **Ticketing & Attendance** — Implement QR code generation per ticket and an organiser-facing scan tool for real-time attendance tracking
- **Enhanced AI Capabilities** — Expand the AI chatbot to handle a wider range of student inquiries and reduce the administrative burden on organisers

### Phase 3 — Advanced Social Features
- **Peer-to-Peer Engagement** — User-to-user messaging, collaborative event study groups, and social features including sharing, liking, and commenting on events
- **Gamification** — Introduction of bonuses, event funding, points, and discounts to drive ongoing user engagement
- **Multilingual Expansion** — Full localisation into Arabic to serve the diverse university demographic in Qatar
- **Financial Integration** — Secure payment gateway integration for paid events

---

## 🐛 Known Issues

- Cart currently only supports free events (paid event checkout coming soon)
- Event editing/deletion not yet implemented
- Admin approval system UI complete but backend pending
- Profile event lists currently show mock data (integration with real data in progress)

---

## 👥 Contributors

| Name | Role |
|------|------|
| **Haniyah Umair** | Project Manager, UX/UI Designer, Frontend Developer |
| **Abdalla Kabashi** | Full-Stack Developer (JavaScript, Supabase Integration, Admin Panel) |
| **Rafiah Al Mohannadi** | Assistant Manager, Technical Writer, Frontend Developer |
| **Mohammad Al Nasr** | Frontend Developer (HTML) |

---

## 📄 License

This project was developed as part of a university coursework assignment at the University of Aberdeen.

---

## 🙏 Acknowledgments

- Inspired by **Classmate**, a successful student discount platform in Qatar
- Built to address real student needs for centralized event discovery
- Developed for students, by students

---

## 📞 Contact

For questions or feedback:
- University Email: u01hu23@abdn.ac.uk
- Personal Email: haniyah.umair.18@gmail.com

---

**Made with ❤️ for the Qatar student community**
