// script.js

const STORE_NUMBER = "94702680801";

function updateStoreStatus() {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');

    if (!dot || !text) return;

    // Sri Lanka Time Calculation
    const now = new Date();
    const slTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Colombo',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    }).formatToParts(now);

    const hours = parseInt(slTime.find(p => p.type === 'hour').value);
    const minutes = parseInt(slTime.find(p => p.type === 'minute').value);
    const currentTime = (hours * 60) + minutes;

    // 4:30 PM (990 mins) to 10:30 PM (1350 mins)
    const openTime = 990; 
    const closeTime = 1350;

    if (currentTime >= openTime && currentTime < closeTime) {
        // ONLINE / OPEN
        dot.style.backgroundColor = '#00ff88';
        dot.style.boxShadow = '0 0 10px #00ff88';
        text.innerText = 'OPEN NOW (UNTIL 10:30 PM)';
        text.style.color = '#00ff88';
    } else {
        // OFFLINE / CLOSED
        dot.style.backgroundColor = '#ff4444';
        dot.style.boxShadow = '0 0 10px #ff4444';
        text.innerText = 'CLOSED (OPENS AT 4:30 PM)';
        text.style.color = '#ff4444';
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    updateStoreStatus();
    setInterval(updateStoreStatus, 30000); // Check every 30 seconds
});

function openWhatsApp(message) {
    const encoded = encodeURIComponent(message);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // If mobile, use the direct protocol link.
    // If PC, use the API link which handles Desktop App vs Web fallbacks.
    const url = isMobile 
        ? `https://wa.me/${STORE_NUMBER}?text=${encoded}` 
        : `https://api.whatsapp.com/send?phone=${STORE_NUMBER}&text=${encoded}`;

    window.open(url, "_blank");
}

function buyGuild(squads, price) {
    // Mapping the specific details based on squads to make the message professional
    const gloryData = {
        1: { bots: "3 Bots", glory: "100K - 200K" },
        2: { bots: "6 Bots", glory: "200K - 400K" },
        3: { bots: "9 Bots", glory: "400K - 600K" },
        4: { bots: "12 Bots", glory: "600K - 900K" },
        5: { bots: "15 Bots", glory: "900K - 1.2M" },
        6: { bots: "18 Bots", glory: "1.2M - 1.5M" }
    };

    const info = gloryData[squads] || { bots: squads + " Squads", glory: "N/A" };

    const msg = `Hello RAVI STORE! 🎮

I want to purchase a Guild Glory Package.

📦 Package Details:
• Package: ${squads} Squad(s) (${info.bots})
• Expected Glory: ${info.glory}
• Price: LKR ${price}

📝 My Info:
• Guild ID: [Paste Guild ID here]
• UID: [Paste UID here]

Please provide payment instructions.`;

    openWhatsApp(msg);
}

function buyLikes(){

const msg = `Hello RAVI STORE! 🔥

I want to purchase Likes Package.

📦 Package Details:
• 7 Days Likes
• Total Likes: 1500
• Daily Likes: 220
• Price: LKR 1000

📝 My Info:
• UID: [Paste UID here]

Please provide payment instructions.`;

openWhatsApp(msg);
}

function contactNow(){

const msg = `Hello RAVI STORE! I need more package details.`;

openWhatsApp(msg);
}

function scrollToId(id){
document.getElementById(id).scrollIntoView({
behavior:"smooth"
});
}

function whatsappRedirect(type, id) {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (type === 'channel') {
        // Channels: Use deep link for mobile, web link for PC
        const url = isMobile 
            ? `whatsapp://channel/${id}` 
            : `https://whatsapp.com/channel/${id}`;
        
        window.location.href = url;

        // Fallback for Channel deep link
        setTimeout(() => {
            window.location.href = `https://whatsapp.com/channel/${id}`;
        }, 500);
        
    } else {
        // Groups: The standard HTTPS link is actually BEST for groups
        // Mobile phones will automatically detect this and open the App.
        // PCs will show the "Join Chat" web button.
        window.location.href = `https://chat.whatsapp.com/${id}`;
    }
}
