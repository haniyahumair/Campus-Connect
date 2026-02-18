import { createEventCard } from "../components/eventCardsComponents.js";
import { createNavbar } from '../components/navbarComponent.js';
import { createFooter } from '../components/footerComponent.js';

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();

const container = document.getElementById("eventCardsContainer");

const exampleEvents = [
  {
    id: 1,
    title: "AI Workshop",
    description: "Learn practical AI.",
    month: "November",
    day: "14",
    year: "2025",
    start: "04:00 PM",
    end: "06:00 PM",
    location: "BLDG 2",
    price: "Free",
    type: "Workshop",
    image: "/assets/Images/IMG_6404.jpg",
    attendees: 50,
    capacity: 100
  },
  
  {
    id: 2,
    title: "Football Championship Final",
    description: "Inter-university football championship finals - the ultimate showdown!",
    month: "December",
    day: "12",
    year: "2026",
    start: "05:00 PM",
    end: "08:00 PM",
    location: "Qatar University Sports Complex",
    price: "Free",
    type: "Sports",
    image: "/assets/Images/football.jpg",
    attendees: 200,
    capacity: 500
  },

  {
    id: 3,
    title: "Cultural Festival",
    description: "Experience the vibrant tapestry of cultures at our annual cultural festival, featuring music, dance, and cuisine from around the world.",
    month: "February",
    day: "06",
    year: "2026",
    start: "04:00 PM",
    end: "10:00 PM",
    location: "UDST Campus Grounds",
    price: "50 QAR",
    type: " Festival",
    image: "/assets/Images/foc.jpg",
    attendees: 150,
    capacity: 300
  },

  {
    id: 4,
    title: "CMU-Q Statistical Consulting Center Workshop Series",
    description: "The workshops will introduce statistical methods for biological scientists, focusing on how to choose appropriate methods for different research scenarios.",
    month: "March",
    day: "10",
    year: "2026",
    start: "02:00 PM",
    end: "04:00 PM",
    location: "3178 CMU-Q Building",
    price: "Free",  
    type: "Workshop",
    image: "/assets/Images/slide4-5.jpg",
    attendees: 30,
    capacity: 50
  },

  {
    id: 5,
    title: "AI, Skills, and the Future of (No) work",
    description: "How is artificial intelligence reshaping labor markets? Drawing on his research analyzing 1.5 billion online job vacancies, as well as his close tracking of AI-related venture capital investments, Professor Antoniades explores these questions and more, offering insights into the future of work in an AI-driven world.",
    month: "April",
    day: "15",
    year: "2026",
    start: "03:00 PM",
    end: "05:00 PM",
    location: "Auditorium Georgetown University Qatar",
    price: "Free",
    type: "Workshop",
    image: "/assets/Images/georgetown.avif",
    attendees: 80,
    capacity: 150
  },

  {
    id: 6,
    title: "Qatar University Research Forum",
    description: "The Qatar University Research Forum is an annual event that showcases the latest research and innovations from Qatar University. It provides a platform for researchers, students, and industry professionals to share their work and collaborate on future projects.",
    month: "May",
    day: "20",
    year: "2026",
    start: "09:00 AM",
    end: "05:00 PM",
    location: "Qatar University Main Campus",
    price: "Free",
    type: "Conference",
    image: "/assets/Images/default-event.jpg",
    attendees: 300,
    capacity: 500
  }
];

exampleEvents.forEach(event => {
  container.insertAdjacentHTML("beforeend", createEventCard(event));
});