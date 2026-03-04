// global.js - MPA Shared Logic
document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Management
    const htmlElement = document.documentElement;
    const themeSwitch = document.getElementById('checkbox');
    const savedTheme = localStorage.getItem('vtp_theme') || 'light';

    htmlElement.setAttribute('data-theme', savedTheme);
    if (themeSwitch) {
        themeSwitch.checked = savedTheme === 'dark';

        themeSwitch.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('vtp_theme', newTheme);
        });
    }

    // 2. Sidebar Mobile Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }

    // 3. Global Topbar Controls (Back & Refresh)
    const btnBack = document.getElementById('btn-back');
    const btnRefresh = document.getElementById('btn-refresh');

    if (btnBack) {
        btnBack.addEventListener('click', () => {
            // If there's history, go back; otherwise go to root index.html
            if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
                window.history.back();
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            // Trigger a custom event for local page state resets without full reload if possible,
            // or perform a hard refresh. For MPA, a hard refresh is standard, 
            // but we can look for a reset function in the page scope for better UX.
            if (typeof window.resetCurrentPage === 'function') {
                window.resetCurrentPage();
            } else {
                window.location.reload();
            }
        });
    }

    // Auto highlight correct nav item based on URL
    const pathname = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const link = item.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            // Basic matching (e.g. tutorials.html matches /tutorials/)
            if (pathname.includes(href) || (pathname.endsWith('/') && href === 'index.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');

                // Keep parent active if in sub-page (e.g. in tut-home.html, tutorials.html is active)
                if (href === 'tutorials.html' && pathname.includes('tut-')) item.classList.add('active');
                if (href === 'practices.html' && pathname.includes('prac-')) item.classList.add('active');
                if (href === 'tests.html' && pathname.includes('test-')) item.classList.add('active');
            }
        }
    });
});
