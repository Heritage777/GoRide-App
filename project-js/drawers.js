const contentData = {
    // Support Data
    'help-center': '<h3>How can we help?</h3><p>Search our database for answers regarding your GoRïde experience...</p>',
    'safety-info': '<h3>Safety First</h3><p>Our 24/7 monitoring ensures you are always protected...</p>',
    'refunds': '<h3>Refund Policy</h3><p>Refunds are processed within 3-5 business days to your original payment method.</p>',
    'contact': '<h3>Contact Us</h3><p>Email: support@goride.com.ng<br>Phone: +234 800 GORIDE</p>',
    
    // Legal Data
    'privacy': '<h3>Privacy Policy</h3><p>We respect your data. We only track what is needed for the trip...</p>',
    'terms': '<h3>Terms of Service</h3><p>By using GoRïde, you agree to our community guidelines...</p>',
    'cookies': '<h3>Cookie Policy</h3><p>We use cookies to improve your personalized experience...</p>',
    'compliance': '<h3>Regulatory Compliance</h3><p>GoRïde is fully licensed to operate in Lagos and Oyo state.</p>'
};

function openSupport(initialTab = 'help-center') {
    const drawer = document.getElementById('drawer-support');
    drawer.classList.add('active');
    // Set initial content
    document.getElementById('support-content-area').innerHTML = contentData[initialTab];
}

function openLegal(initialTab = 'privacy') {
    const drawer = document.getElementById('drawer-legal');
    drawer.classList.add('active');
    // Set initial content
    document.getElementById('legal-content-area').innerHTML = contentData[initialTab];
}

function switchTab(btn, contentKey) {
    // Update active button state
    const parent = btn.parentElement;
    parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update content area (detect which drawer is open)
    const containerId = btn.closest('.drawer-overlay').id === 'drawer-support' 
                        ? 'support-content-area' 
                        : 'legal-content-area';
    
    document.getElementById(containerId).innerHTML = contentData[contentKey];
}

function closeAllDrawers() {
    document.querySelectorAll('.drawer-overlay').forEach(d => d.classList.remove('active'));
}