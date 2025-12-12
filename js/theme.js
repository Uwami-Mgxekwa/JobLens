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

// Safe theme toggle with null checks
function safeToggleTheme() {
    const html = document.documentElement;
    const themeToggle = document.querySelector('.theme-toggle .theme-icon');
    
    if (!themeToggle) {
        console.log('Theme toggle not found on this page');
        return;
    }
    
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

// Toggle mobile menu (legacy function - hamburger removed)
function toggleMenu() {
    // Function kept for compatibility but hamburger menu was removed
    console.log('toggleMenu called - hamburger menu has been removed');
}

// Initialize theme and handle navigation
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    // Add click listeners to nav links (if they exist)
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Add active state handling if needed
            console.log('Navigation link clicked:', link.href);
        });
    });
});