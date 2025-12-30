document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menu-button');
    const closeSidebarButton = document.getElementById('close-sidebar');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContent = document.getElementById('page-content');
    const authButton = document.getElementById('auth-button');

    let isLoggedIn = false;

    // --- Page Content ---
    const pages = {
        home: `
            <h2>Home Page</h2>
            <p>Welcome to LearnFlow! This is the main page.</p>
        `,
        about: `
            <h2>About Us</h2>
            <p>This page provides information about the LearnFlow project.</p>
        `,
        terms: `
            <h2>Terms of Service</h2>
            <p>Please read our terms of service carefully.</p>
        `,
        privacy: `
            <h2>Privacy Policy</h2>
            <p>Your privacy is important to us. Here is our policy.</p>
        `,
        disclaimer: `
            <h2>Disclaimer</h2>
            <p>The information provided on this website is for general informational purposes only.</p>
        `
    };

    // --- Functions ---
    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
    };

    const loadPage = (page) => {
        pageContent.innerHTML = pages[page] || pages['home'];
        if (window.innerWidth < 768) {
            sidebar.classList.remove('open');
        }
    };

    const updateAuthStatus = () => {
        if (isLoggedIn) {
            authButton.textContent = 'Sign Out';
        } else {
            authButton.textContent = 'Sign In';
        }
    };

    const handleAuth = () => {
        isLoggedIn = !isLoggedIn;
        updateAuthStatus();
        alert(isLoggedIn ? 'You have been signed in.' : 'You have been signed out.');
    };

    // --- Event Listeners ---
    menuButton.addEventListener('click', toggleSidebar);
    closeSidebarButton.addEventListener('click', toggleSidebar);
    authButton.addEventListener('click', handleAuth);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            loadPage(page);
        });
    });

    // --- Initial Load ---
    loadPage('home');
    updateAuthStatus();
});
