// Theme toggle functionality
function toggleTheme() {
    const html = document.documentElement;
    const themeToggle = document.querySelector('.theme-toggle .theme-icon');
    
    if (html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        themeToggle.textContent = '◐';
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '◑';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const html = document.documentElement;
    const themeToggle = document.querySelector('.theme-toggle .theme-icon');
    
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.textContent = '◑';
    } else {
        html.removeAttribute('data-theme');
        if (themeToggle) themeToggle.textContent = '◐';
    }
}

// Toggle mobile menu
function toggleMenu() {
    console.log('toggleMenu called'); // Debug log
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    console.log('navMenu:', navMenu); // Debug log
    console.log('hamburger:', hamburger); // Debug log
    
    if (navMenu && hamburger) {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
        console.log('Menu toggled, active:', navMenu.classList.contains('active')); // Debug log
    } else {
        console.error('Could not find nav-menu or hamburger elements');
    }
}

// Close menu when clicking on a link
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    // Add click listeners to nav links to close menu
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        const headerControls = document.querySelector('.header-controls');
        
        if (!headerControls.contains(e.target) && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});