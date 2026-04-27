// script.js

const STORE_NUMBER = "94702680801";

function updateStoreStatus() {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');

    // Get current time specifically for Sri Lanka timezone
    const slTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Colombo',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
    }).formatToParts(new Date());

    const hours = parseInt(slTime.find(p => p.type === 'hour').value);
    const minutes = parseInt(slTime.find(p => p.type === 'minute').value);
    const currentTimeInMinutes = (hours * 60) + minutes;

    // 4:30 PM = 16:30 = 990 minutes
    // 10:30 PM = 22:30 = 1350 minutes
    const openTime = 990;
    const closeTime = 1350;

    if (currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime) {
        dot.classList.add('dot-online');
        dot.classList.remove('dot-offline');
        text.innerText = 'OPEN NOW (UNTIL 10:30 PM)';
    } else {
        dot.classList.add('dot-offline');
        dot.classList.remove('dot-online');
        text.innerText = 'CLOSED (OPENS AT 4:30 PM)';
    }
}

// Update immediately and check every 1 minute
updateStoreStatus();
setInterval(updateStoreStatus, 60000);

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

    const msg = `Hello RAVI.STORE! 🎮

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

const msg = `Hello RAVI.STORE! 🔥

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

const msg = `Hello RAVI.STORE! I need more package details.`;

openWhatsApp(msg);
}

function scrollToId(id){
document.getElementById(id).scrollIntoView({
behavior:"smooth"
});
}

