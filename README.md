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
   - Open the root file `index.html` directly in your browser using live server
   - Note: Some features may behave differently without a local server

4. **Start using Campus Connect**
   - Register with your university email
   - Browse and filter events
   - Add events to your cart and register
   - Create and submit your own events for admin approval
  
### 🔑 Note on Environment Variables
For the purpose of this academic evaluation, the API configuration file (`scripts/config/env.js`) has been included in the repository. This contains the necessary **Supabase** and **Google Maps** keys to ensure the application works "out of the box" without additional setup.
**Security Note:** In a production environment, these sensitive credentials would be managed via `.env` files and excluded from version control (via `.gitignore`) to follow industry security best practices.

---

## 📁 Project Structure

```
campus-connect/
├── admin/
│   ├── admin.css                 # Admin dashboard styles
│   ├── admin.js                  # Admin panel, moderation logic, and role-based access
│   ├── ai.js                     # AI chatbot logic
│   └── index.html                # Admin dashboard page
├── api/
│   └── config.js                 # Google API handlers
├── assets/
│   ├── Icons/                    # UI icons and logos
│   └── Images/                   # Event images and graphics
├── pages/
│   ├── cart.html                 # Cart page
│   ├── contact.html              # Contact page
│   ├── create.html               # Create event page
│   ├── details.html              # Individual event detail page
│   ├── email-verification.html   # Email verification page
│   ├── events.html               # Browse events page
│   ├── help.html                 # Help/User Manual page
│   ├── login.html                # Login page
│   ├── profile.html              # User profile page
│   ├── reset-password.html       # Password reset page
│   └── signup.html               # Registration page
├── scripts/
│   ├── components/
│   │   ├── eventCardsComponents.js   # Reusable event card rendering function
│   │   ├── footerComponent.js        # Reusable footer component
│   │   └── navbarComponent.js        # Reusable navigation bar component
│   ├── config/
│   │   ├── env.js                    # API keys and environment variables
│   │   └── supabase.js               # Supabase client initialization
│   ├── pages/
│   │   ├── cart.js                   # Cart management and checkout
│   │   ├── createEvent.js            # Event creation form handling
│   │   ├── events.js                 # Event browsing, filtering, and search
│   │   ├── home.js                   # Homepage logic
│   │   ├── login.js                  # Login form handling and post-login redirection
│   │   ├── profile.js                # User profile interactions
│   │   └── signup.js                 # Registration form handling
│   ├── services/
│   │   ├── emailVerification.js      # Email verification flow
│   │   ├── eventsDatabase.js         # Supabase event data queries
│   │   ├── loggedInLogic.js          # Auth state UI across all pages
│   │   ├── notifications.js          # User notification handling
│   │   ├── resetPassword.js          # Password reset logic
│   │   └── wishlist.js               # Wishlist/saved events logic
│   └── utils/
│       └── modal.js                  # Reusable modal utility
├── styles/
│   ├── pages/
│   │   ├── cart.css                  # Cart page styles
│   │   ├── details.css               # Event detail page styles
│   │   ├── events.css                # Events page styles
│   │   ├── home.css                  # Homepage styles
│   │   ├── login-register.css        # Login and signup page styles
│   │   └── profile.css               # Profile page styles
│   └── global.css                    # Shared styles across all pages
├── .gitignore
├── index.html                        # Landing page
├── package.json                      # Project dependencies
├── README.md                         # Project documentation and setup guide
├── server.js                         # Node.js server for AI chatbot
└── terms&conditions.txt              # Terms and conditions
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

<img width="2530" height="7084" alt="CampusConnect" src="https://github.com/user-attachments/assets/3b5d5d33-ba84-4fc0-8b75-a22949d0a33a" />


- Event page

<img width="2530" height="5008" alt="CampusConnect · 3 28pm · 04-30" src="https://github.com/user-attachments/assets/9efc31e0-fea6-480a-b2f8-c214b86d6e63" />


- Event Detail page

<img width="2530" height="3696" alt="CampusConnect · 3 29pm · 04-30" src="https://github.com/user-attachments/assets/1e7345d2-0393-44a7-9a96-5c3160bf2676" />


- Registration flow

<img width="2530" height="1716" alt="Login page" src="https://github.com/user-attachments/assets/69bcfd21-99ac-4028-99db-d203a0d42d67" />
<img width="2530" height="1716" alt="Sign Up - Campus Connect" src="https://github.com/user-attachments/assets/ab04e15f-98fe-4d65-a029-402d275c4a40" />


- User profile

<img width="2530" height="4562" alt="CampusConnect · 3 30pm · 04-30" src="https://github.com/user-attachments/assets/5a53c649-828f-469f-8ee7-5dc60f1af0d8" />

- Event creation form

<img width="2530" height="5090" alt="CampusConnect · 3 31pm · 04-30" src="https://github.com/user-attachments/assets/9769ee97-84a4-4c53-b510-31b6af65701e" />

- Cart page

<img width="2530" height="1816" alt="CampusConnect" src="https://github.com/user-attachments/assets/334151fc-9819-4373-93fc-b671dba054e7" />

- Admin Dashboard

<img width="2552" height="1650" alt="CampusConnect _ Admin" src="https://github.com/user-attachments/assets/7fb335b2-25f1-46ab-8d1e-bf2dc467baae" />
<img width="2552" height="3898" alt="CampusConnect _ Admin · 3 38pm · 04-30" src="https://github.com/user-attachments/assets/daeac8e5-00b6-409b-9fd7-4c7c48303ae4" />
<img width="2552" height="4738" alt="CampusConnect _ Admin · 3 39pm · 04-30" src="https://github.com/user-attachments/assets/7e5d94ef-0639-4876-969a-694ca465d949" />
<img width="2552" height="1650" alt="CampusConnect _ Admin · 3 39pm · 04-30 (1)" src="https://github.com/user-attachments/assets/bd1b632b-5b42-4bd9-b764-15ef3d566b37" />

---

## 🔮 Future Product Release Plan

CampusConnect successfully delivered a functional MVP addressing the need for a centralized university event hub in Qatar. While the initial plan relied on a traditional MongoDB/Node.js stack, the team pivoted to a BaaS model using Supabase, enabling live authentication and database persistence within the project timeframe. Most Must Have requirements were met, including event discovery, cart registration, and a functional admin approval workflow.

### Phase 1 — Ecosystem Integration & Institutional Partnerships
- **University SSO Integration** — Connect directly with university databases to automate student verification via Single Sign-On
- **Strategic Sponsorships** — Partner with local Qatari businesses (cafes, bookstores, tech hubs) to offer exclusive CampusConnect Discounts, establishing a sustainable revenue model
- **Official University Sanctioning** — Transition from a student-led prototype to an officially recognised campus tool, ensuring all events meet institutional safety and policy standards
- **Advanced Notification features** - Currently the notifications are limited to admin and students for approve/reject events, or creation of events. We will transition to more advanced notifications to communicate attendance updates, new events alert, and more flexible communication between students and admin.

### Phase 2 — Operational Scaling
- **Native Mobile Deployment** — Transition the responsive web app into a native iOS/Android application with push notifications and event reminders
- **Ticketing & Attendance** — Implement QR code generation per ticket and an organiser-facing scan tool for real-time attendance tracking
- **Enhanced AI Capabilities** — Expand the AI chatbot to handle a wider range of student inquiries and reduce the administrative burden on organisers

### Phase 3 — Advanced Social Features
- **Peer-to-Peer Engagement** — User-to-user messaging, collaborative event study groups, and social features including sharing, liking, and commenting on events
- **Gamification** — Introduction of bonuses, event funding, points, and discounts to drive ongoing user engagement
- **Multilingual Expansion** — Full localisation into Arabic to serve the diverse university demographic in Qatar
- **Payment Integration** — Secure payment gateway integration for paid events

---

## Known Issues

- Cart doesn't process paid events money (paid event checkout will be fully implemented with a proper payment and ticketing system)
- Event editing/deletion not yet implemented
- Admin approval system UI complete but backend pending
- Ticketing and approval of tickets not yet implemented
- AI Chatbot not funcitonal on deployed version

---

## 👥 Contributors

| Name | Role |
|------|------|
| **Haniyah Umair** | Project Manager, UX/UI Designer, Full-Stack Developer |
| **Abdalla Kabashi** | Full-Stack Developer (JavaScript, Supabase Integration, Admin Panel) |
| **Rafiah Al Mohannadi** | Assistant Manager, Technical Writer, Frontend Developer |
| **Mohammad Al Nasr** | Frontend Developer (HTML) |

---

## 📄 License

This project was developed as part of a university coursework assignment at the University of Aberdeen.

---

## 📞 Contact

For questions or feedback:
- University Email: u01hu23@abdn.ac.uk
- Personal Email: haniyah.umair.18@gmail.com

---

**Made with ❤️ for the Qatar student community**
