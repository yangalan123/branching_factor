var dContents = document.querySelector('d-contents');
var dArticle = document.querySelector('d-article');

console.log('Contents bar script loaded');
console.log('dContents element:', dContents);
console.log('dArticle element:', dArticle);
console.log('Window width:', window.innerWidth);

// Sticky Sidebar Implementation
var stickySidebar = null;
var originalOffsetTop = 0;
var resizeTimeout = null;

// Function to determine which section is in view
function getActiveSection() {
    var sections = document.querySelectorAll('section');
    var scrollPosition = window.scrollY || document.documentElement.scrollTop;

    for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop + sections[i].offsetHeight > scrollPosition + 1) {
            return sections[i].id;
        }
    }
    return null;
}

// Function to update the navigation items
function updateNavigation() {
    var activeSection = getActiveSection();
    var navLinks = document.querySelectorAll('d-contents nav a, #sticky-sidebar nav a');

    navLinks.forEach(function(navLink) {
        if (navLink.getAttribute('href') === '#' + activeSection) {
            navLink.classList.add('active-nav-item');
            // Add inline styles to make it more visible
            navLink.style.color = '#0d6efd';
            navLink.style.fontWeight = 'bold';
            navLink.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
            navLink.style.borderLeft = '3px solid #0d6efd';
            navLink.style.paddingLeft = '8px';
            navLink.style.borderRadius = '4px';
            navLink.style.transition = 'all 0.3s ease';
        } else {
            navLink.classList.remove('active-nav-item');
            // Reset inline styles
            navLink.style.color = '';
            navLink.style.fontWeight = '';
            navLink.style.backgroundColor = '';
            navLink.style.borderLeft = '';
            navLink.style.paddingLeft = '';
            navLink.style.borderRadius = '';
            navLink.style.transition = '';
        }
    });
}

// Function to handle scroll
function onScroll() {
    if (window.innerWidth > 1000 && stickySidebar && dContents) {
        var scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Get the safe threshold that was calculated during initialization
        var safeThreshold = parseInt(stickySidebar.dataset.safeThreshold) || (originalOffsetTop + 50);
        
        // Check if we should show the sticky sidebar
        if (scrollPosition >= safeThreshold && originalOffsetTop > 0) {
            if (stickySidebar.style.display !== 'block') {
                console.log('Showing sticky sidebar at scroll position:', scrollPosition, 'threshold:', safeThreshold);
                stickySidebar.style.display = 'block';
                dContents.style.visibility = 'hidden';
            }
        } else {
            if (stickySidebar.style.display !== 'none') {
                console.log('Hiding sticky sidebar, showing original at scroll position:', scrollPosition, 'threshold:', safeThreshold);
                stickySidebar.style.display = 'none';
                dContents.style.visibility = 'visible';
            }
        }
        
        // Ensure sticky sidebar stays within viewport bounds
        if (stickySidebar.style.display === 'block') {
            var stickyRect = stickySidebar.getBoundingClientRect();
            if (stickyRect.top < 0) {
                stickySidebar.style.top = '20px';
            }
            if (stickyRect.bottom > window.innerHeight) {
                stickySidebar.style.maxHeight = (window.innerHeight - 40) + 'px';
            }
        }
    }
    
    // Update navigation
    updateNavigation();
}

// Function to handle window resize
function onResize() {
    console.log('Window resized to:', window.innerWidth);
    
    if (window.innerWidth <= 1000) {
        // On mobile, remove sticky sidebar and show original
        if (stickySidebar) {
            stickySidebar.remove();
            stickySidebar = null;
        }
        if (dContents) {
            dContents.style.visibility = 'visible';
            dContents.style.display = 'block';
        }
        window.removeEventListener('scroll', onScroll);
    } else {
        // On desktop, initialize sticky sidebar
        initStickySidebar();
    }
}

// Initialize sticky sidebar
function initStickySidebar() {
    console.log('Initializing sticky sidebar...');
    
    // Remove any existing sticky sidebar
    if (stickySidebar) {
        stickySidebar.remove();
        stickySidebar = null;
    }
    
    // Get the original sidebar
    dContents = document.querySelector('d-contents');
    if (!dContents) {
        console.log('No d-contents found');
        return;
    }
    
    // Force the sidebar to be visible on desktop
    dContents.style.display = 'block';
    dContents.style.visibility = 'visible';
    
    // Wait for layout to stabilize, then get position
    setTimeout(function() {
        // Get the original position
        originalOffsetTop = dContents.offsetTop;
        
        // Calculate a safe threshold that accounts for header content
        var headerHeight = 0;
        var header = document.querySelector('.header-container');
        if (header) {
            headerHeight = header.offsetHeight;
        }
        
        // Use the larger of: original sidebar position + buffer, or header height + buffer
        var safeThreshold = Math.max(originalOffsetTop + 50, headerHeight + 100);
        
        console.log('Original sidebar offset top:', originalOffsetTop);
        console.log('Header height:', headerHeight);
        console.log('Safe threshold for sticky sidebar:', safeThreshold);
        
        // Create sticky sidebar clone
        stickySidebar = dContents.cloneNode(true);
        stickySidebar.id = 'sticky-sidebar';
        stickySidebar.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            width: 280px;
            max-height: calc(100vh - 40px);
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: none;
            padding: 20px;
            box-sizing: border-box;
            /* Override grid layout for single column display */
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
            grid-column: 1 !important;
            grid-row: 1 !important;
            align-items: start !important;
            justify-items: start !important;
        `;
        
        // Also fix the navigation layout inside the sticky sidebar
        var stickyNav = stickySidebar.querySelector('nav');
        if (stickyNav) {
            stickyNav.style.cssText = `
                display: block !important;
                width: 100% !important;
                max-width: none !important;
                grid-column: 1 !important;
                grid-row: 1 !important;
            `;
            
            // Fix all navigation elements to display as single column
            var navElements = stickyNav.querySelectorAll('*');
            navElements.forEach(function(element) {
                if (element.tagName === 'UL' || element.tagName === 'LI' || element.tagName === 'DIV') {
                    element.style.cssText = `
                        display: block !important;
                        width: 100% !important;
                        max-width: none !important;
                        grid-column: 1 !important;
                        grid-row: auto !important;
                        margin-bottom: 0.5em !important;
                    `;
                }
                if (element.tagName === 'A') {
                    element.style.cssText = `
                        display: block !important;
                        width: 100% !important;
                        padding: 0.25em 0 !important;
                        text-decoration: none !important;
                        color: rgba(0, 0, 0, 0.8) !important;
                    `;
                }
            });
        }
        
        // Add to body
        document.body.appendChild(stickySidebar);
        console.log('Sticky sidebar created and added to body');
        
        // Store the safe threshold for use in scroll handler
        stickySidebar.dataset.safeThreshold = safeThreshold;
        
        // Initial scroll check
        onScroll();
    }, 100);
}

// Cleanup function
function cleanup() {
    if (stickySidebar) {
        stickySidebar.remove();
        stickySidebar = null;
    }
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing contents bar...');
    
    // Initialize sticky sidebar on desktop
    if (window.innerWidth > 1000) {
        initStickySidebar();
    }
    
    // Add event listeners
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', function() {
        // Debounce resize events
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(onResize, 250);
    });
    
    // Initial navigation update
    updateNavigation();
});

// Also initialize on window load to ensure everything is ready
window.addEventListener('load', function() {
    console.log('Window loaded, ensuring sticky sidebar is initialized...');
    if (window.innerWidth > 1000 && !stickySidebar) {
        initStickySidebar();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

console.log('Contents bar initialization complete');
