// 11's Kitchen – main.js

// Navbar shadow on scroll
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
  } else {
    navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  }
});
