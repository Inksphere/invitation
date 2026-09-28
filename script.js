/**
 * WEDDING DATA CONFIGURATION
 */
const weddingData = {
    names: {
        bride: "Ayesha Rahman",
        groom: "Zayan Ibrahim",
        short: "Ayesha & Zayan"
    },
    date: "December 24, 2024",
    countdownTarget: "2024-12-24T10:00:00",
    
    couple: {
        bride: {
            name: "Ayesha Rahman",
            bio: "Daughter of Mr. Abdul Rahman & Mrs. Fatima Rahman. A creative soul who loves art and culture.",
            img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600"
        },
        groom: {
            name: "Zayan Ibrahim",
            bio: "Son of Mr. Ibrahim Kutty & Mrs. Sainaba. An engineer with a passion for travel and photography.",
            img: "https://images.unsplash.com/photo-1537367663815-fdca5e67910b?q=80&w=600"
        }
    },
    
    events: [
        {
            title: "Nikah",
            date: "Dec 24, 2024",
            time: "10:30 AM",
            venue: "Grand Juma Masjid",
            address: "Calicut, Kerala",
            enabled: true
        },
        {
            title: "Reception",
            date: "Dec 24, 2024",
            time: "12:30 PM",
            venue: "Convention Centre",
            address: "Beach Road, Calicut",
            enabled: true
        }
    ],
    
    backend: {
        enabled: true,
        // PASTE YOUR GOOGLE APPS SCRIPT URL HERE
        googleAppsScriptUrl: "https://script.google.com/macros/s/AKfycbyrMn61XPKq5UV65O6MMq2USq7vqrcu3p-ZtG2jvuYZWIZuIYEKo9PwAeaXkyBXkDLKpw/exec"
    }
};

/**
 * INITIALIZATION
 */
document.addEventListener('DOMContentLoaded', () => {
    initContent();
    startCountdown();
    setupEventListeners();
    loadApprovedWishes();
});

function initContent() {
    // Populate Names & Info
    document.getElementById('overlay-names').textContent = weddingData.names.short;
    document.getElementById('overlay-date').textContent = weddingData.date;
    document.getElementById('hero-names').textContent = weddingData.names.short;
    document.getElementById('nav-logo').textContent = "A & Z";
    
    // Couple
    document.getElementById('bride-name').textContent = weddingData.couple.bride.name;
    document.getElementById('bride-bio').textContent = weddingData.couple.bride.bio;
    document.getElementById('bride-img').src = weddingData.couple.bride.img;
    
    document.getElementById('groom-name').textContent = weddingData.couple.groom.name;
    document.getElementById('groom-bio').textContent = weddingData.couple.groom.bio;
    document.getElementById('groom-img').src = weddingData.couple.groom.img;

    // Events
    const container = document.getElementById('events-container');
    weddingData.events.filter(e => e.enabled).forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <h3>${event.title}</h3>
            <p><strong>${event.date}</strong></p>
            <p>${event.time}</p>
            <hr style="margin: 15px 0; opacity: 0.2;">
            <p>${event.venue}</p>
            <p><small>${event.address}</small></p>
        `;
        container.appendChild(card);
    });

    document.getElementById('footer-names').textContent = weddingData.names.short;
    document.getElementById('footer-date').textContent = weddingData.date;
}

/**
 * COUNTDOWN LOGIC
 */
function startCountdown() {
    const target = new Date(weddingData.countdownTarget).getTime();
    
    const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        
        if (diff < 0) {
            clearInterval(interval);
            document.getElementById('countdown').innerHTML = "<h3>The Day Has Arrived!</h3>";
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('mins').textContent = mins.toString().padStart(2, '0');
        document.getElementById('secs').textContent = secs.toString().padStart(2, '0');
    }, 1000);
}

/**
 * FORM HANDLING & BACKEND INTEGRATION
 */
function setupEventListeners() {
    // Overlay Enter
    document.getElementById('enter-btn').addEventListener('click', () => {
        document.getElementById('overlay').classList.add('hide');
        const audio = document.getElementById('bg-music');
        audio.play().catch(() => console.log("Autoplay blocked"));
    });

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    // RSVP Submission
    const rsvpForm = document.getElementById('rsvp-form');
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-rsvp');
        const status = document.getElementById('rsvp-status');
        
        const formData = new FormData(rsvpForm);
        const data = Object.fromEntries(formData.entries());
        data.action = 'rsvp';

        await submitToBackend(data, btn, status, "Thank you! RSVP received.");
    });

    // Wish Submission
    const wishForm = document.getElementById('wish-form');
    wishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = wishForm.querySelector('button');
        const status = document.getElementById('wish-status');
        
        const formData = new FormData(wishForm);
        const data = Object.fromEntries(formData.entries());
        data.action = 'wish';

        await submitToBackend(data, btn, status, "Wish sent for approval!");
        wishForm.reset();
    });
}

async function submitToBackend(data, btn, statusEl, successMsg) {
    if (!weddingData.backend.googleAppsScriptUrl) {
        statusEl.textContent = "Backend not configured.";
        return;
    }

    btn.disabled = true;
    statusEl.textContent = "Processing...";

    try {
        const response = await fetch(weddingData.backend.googleAppsScriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Google Apps Script requires no-cors for simple POST
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // Since no-cors doesn't allow reading response, we assume success if no error thrown
        statusEl.style.color = "green";
        statusEl.textContent = successMsg;
    } catch (error) {
        console.error(error);
        statusEl.style.color = "red";
        statusEl.textContent = "Something went wrong. Please try again.";
        btn.disabled = false;
    }
}

async function loadApprovedWishes() {
    const display = document.getElementById('wishes-display');
    if (!weddingData.backend.googleAppsScriptUrl) return;

    try {
        const url = `${weddingData.backend.googleAppsScriptUrl}?action=getWishes`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.success && result.wishes.length > 0) {
            display.innerHTML = result.wishes.map(w => `
                <div class="event-card" style="padding:20px; border-top: 2px solid var(--accent)">
                    <p>"${w.message}"</p>
                    <h4 style="margin-top:10px; color: var(--accent)">— ${w.name}</h4>
                </div>
            `).join('');
        } else {
            display.innerHTML = "<p>No wishes yet. Be the first!</p>";
        }
    } catch (e) {
        display.innerHTML = "<p>Couldn't load wishes.</p>";
    }
}
