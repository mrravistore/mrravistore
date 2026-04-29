import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
    getDatabase,
    ref,
    onValue,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

/* =========================
   FIREBASE INIT
========================= */
const firebaseConfig = {
    apiKey: "AIzaSyCC73AAM0FMnDJre7V6JM7_Jgtj0do1Fg4",
    databaseURL: "https://mrravistorebyssj-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mrravistorebyssj",
    appId: "1:149128166292:web:24d5049444e41ac0f02d81"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =========================
   CONSTANTS
========================= */
const ADMIN_1 = "94702680801";
const ADMIN_2 = "94743876598";

const OPEN_TIME = 990;   // 16:30
const CLOSE_TIME = 1350; // 22:30

/* =========================
   DOM CACHE (PERFORMANCE BOOST)
========================= */
const dom = {};

/* =========================
   STATE CONTROL
========================= */
let popupOpen = false;
let pendingOrder = null;
let cooldown = false;
let firebaseBound = false;

/* =========================
   SAFE HELPERS
========================= */
function $(id) {
    if (dom[id]) return dom[id];
    dom[id] = document.getElementById(id);
    return dom[id];
}

function isMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
}

/* =========================
   TIME (COLOMBO SAFE)
========================= */
function getColomboMinutes() {
    try {
        const now = new Date();
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Colombo",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).formatToParts(now);

        const h = parseInt(parts.find(x => x.type === "hour")?.value || "0");
        const m = parseInt(parts.find(x => x.type === "minute")?.value || "0");

        return h * 60 + m;
    } catch {
        return 0;
    }
}

/* =========================
   STORE STATUS + NEXT OPEN TIME
========================= */
function updateStoreStatus() {
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");

    if (!dot || !text) return;

    try {
        // 🇱🇰 REAL COLOMBO TIME (NOT DEVICE TIME)
        const now = new Date();

        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Colombo",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).formatToParts(now);

        const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
        const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0");

        const currentMinutes = (hour * 60) + minute;

        const openTime = 16 * 60 + 30;   // 4:30 PM
        const closeTime = 22 * 60 + 30;  // 10:30 PM

        const formatTime = (mins) => {
            let h = Math.floor(mins / 60);
            let m = mins % 60;
            const ampm = h >= 12 ? "PM" : "AM";
            h = h % 12;
            if (h === 0) h = 12;
            return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
        };

        const openStr = formatTime(openTime);
        const closeStr = formatTime(closeTime);

        const isOpen = currentMinutes >= openTime && currentMinutes < closeTime;

        if (isOpen) {
            dot.style.cssText = "background:#00ff88;box-shadow:0 0 10px #00ff88";

            text.innerHTML = `OPEN NOW • CLOSES AT ${closeStr}`;
            text.style.color = "#00ff88";

        } else {
            dot.style.cssText = "background:#ff4444;box-shadow:0 0 10px #ff4444";

            // next open logic
            let nextOpen = openTime;
            if (currentMinutes > closeTime) {
                // next day open
                nextOpen = openTime;
            }

            text.innerHTML = `CLOSED • OPENS AT ${openStr}`;
            text.style.color = "#ff4444";
        }

    } catch (e) {
        console.error("Store status error:", e);
    }
}

/* =========================
   WHATSAPP SAFE ROUTER
========================= */
function openWhatsApp(number, message) {
    try {
        const encoded = encodeURIComponent(message);

        const url = isMobile()
            ? `https://wa.me/${number}?text=${encoded}`
            : `https://api.whatsapp.com/send?phone=${number}&text=${encoded}`;

        if (isMobile()) {
            window.location.href = url;
        } else {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    } catch (e) {
        console.error(e);
        alert("WhatsApp open failed");
    }
}

/* =========================
   FIREBASE TRANSACTION SAFE
========================= */
async function safeIncrement(path) {
    if (!path) return;

    try {
        await runTransaction(ref(db, path), (val) => {
            return (val || 0) + 1;
        });
    } catch (e) {
        console.error("Transaction failed", e);
    }
}

/* =========================
   COUNTERS (NO DUPLICATE LISTENERS)
========================= */
function bindCounter(id, path, suffix = " Sold") {
    const el = $(id);
    if (!el) return;

    onValue(ref(db, path), (snap) => {
        el.innerText = (snap.val() || 0) + suffix;
    });
}

function initCounters() {
    if (firebaseBound) return;
    firebaseBound = true;

    bindCounter("glory1-display", "sold_glory1");
    bindCounter("glory2-display", "sold_glory2");
    bindCounter("glory3-display", "sold_glory3");
    bindCounter("glory4-display", "sold_glory4");
    bindCounter("glory5-display", "sold_glory5");
    bindCounter("glory6-display", "sold_glory6");
    bindCounter("likes1-display", "sold_Likes1");
    bindCounter("likes2-display", "sold_Likes2");
    bindCounter("likes3-display", "sold_Likes3");
    bindCounter("sxs-display", "download_sxs", " Downloads");
}

/* =========================
   POPUP SYSTEM (FIXED)
========================= */
function resetPopupButtons() {
    const b1 = $("adminBtn1");
    const b2 = $("adminBtn2");

    if (b1) b1.disabled = false;
    if (b2) b2.disabled = false;

    cooldown = false;
}

function createPopup() {
    if ($("adminPopupWrap")) return;

    const wrap = document.createElement("div");
    wrap.id = "adminPopupWrap";

    wrap.innerHTML = `
    <div id="adminPopupBox">
        <div id="adminCloseBtn">✕</div>

        <div id="adminTitle">SEND REQUEST TO ADMINS</div>
        <div id="adminSub">Choose your admin</div>

        <button id="adminBtn1" class="adminBtn">
            ADMIN 1 <small>070 268 0801</small>
        </button>

        <button id="adminBtn2" class="adminBtn">
            ADMIN 2 <small>074 438 76598</small>
        </button>
    </div>`;

    document.body.appendChild(wrap);

    wrap.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.75);
        z-index:999999;
        display:none;
        align-items:center;
        justify-content:center;
    `;

    const box = document.getElementById("adminPopupBox");
    // Update this section inside createPopup()
box.style.cssText = `
    width: 90%;
    max-width: 400px;
    background: linear-gradient(145deg, #0f172a, #020617);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 30px;
    position: relative;
    transform: scale(0.9);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    text-align: center;
    color: white;
    font-family: 'Inter', sans-serif;
`;

    // ❗ IMPORTANT: stop click bubbling from box
    box.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // overlay click closes ONLY popup
    wrap.addEventListener("click", closePopup);

    document.getElementById("adminCloseBtn")
        .addEventListener("click", closePopup);

    // CLEAN BUTTON HANDLING (NO DOUBLE FIRING)
    document.getElementById("adminBtn1")
        .addEventListener("click", (e) => {
            e.stopPropagation();
            handleAdmin(ADMIN_1);
        });

    document.getElementById("adminBtn2")
        .addEventListener("click", (e) => {
            e.stopPropagation();
            handleAdmin(ADMIN_2);
        });
}

function openPopup() {
    createPopup();

    resetPopupButtons();

    const p = $("adminPopupWrap");
    const box = $("adminPopupBox");

    p.style.display = "flex";

    setTimeout(() => {
        box.style.transform = "scale(1)";
    }, 10);

    popupOpen = true;
}

function closePopup() {
    const p = $("adminPopupWrap");
    const box = $("adminPopupBox");

    if (!p || !box) return;

    box.style.transform = "scale(0.9)";
    p.style.display = "none";

    popupOpen = false;
    pendingOrder = null;
}

/* =========================
   ADMIN HANDLER (ANTI-SPAM)
========================= */
async function handleAdmin(number) {
    if (!pendingOrder || cooldown) return;

    cooldown = true;

    const b1 = $("adminBtn1");
    const b2 = $("adminBtn2");

    if (b1) b1.disabled = true;
    if (b2) b2.disabled = true;

    try {
        if (pendingOrder.dbKey) {
            await safeIncrement(pendingOrder.dbKey);
        }

        openWhatsApp(number, pendingOrder.message);

        setTimeout(() => {
            closePopup();
        }, 1200);

        setTimeout(() => {
            resetPopupButtons();
        }, 6000);

    } catch (e) {
        console.error(e);
        resetPopupButtons();
        closePopup();
    }
}

/* =========================
   ORDER FUNCTIONS
========================= */
function buyGuild(s, price) {
    const data = {
        1: ["3 Bots", "100K - 200K"],
        2: ["6 Bots", "200K - 400K"],
        3: ["9 Bots", "400K - 600K"],
        4: ["12 Bots", "600K - 900K"],
        5: ["15 Bots", "900K - 1.2M"],
        6: ["18 Bots", "1.2M - 1.5M"]
    }[s] || ["N/A", "N/A"];

    pendingOrder = {
        dbKey: `sold_glory${s}`,
        message: `Guild Order:\n${s} Squad\nBots: ${data[0]}\nGlory: ${data[1]}\nPrice: LKR ${price}`
    };

    openPopup();
}

function buyLikes(price) {

    let dbKey = "";
    let packageText = "";

    if (price === "1000") {
        dbKey = "sold_Likes1";
        packageText = "7 Days Likes";
    }

    if (price === "2000") {
        dbKey = "sold_Likes2";
        packageText = "14 Days Likes";
    }

    if (price === "4000") {
        dbKey = "sold_Likes3";
        packageText = "28 Days Likes";
    }

    pendingOrder = {
        dbKey: dbKey,
        message: "I want to buy " + packageText + " LKR " + price + " for my Free Fire Account. Please send me the payment details."
    };

    openPopup(); // popup first for every button
}

window.contactNow = function (mode) {
    if (mode === 'rare') {
        // Specifically for the Rare UID section
        pendingOrder = {
            dbKey: "click_rare_uid", 
            message: `🔥 RARE UID REQUEST\n\nI want to buy a Unique UID.\n\nPlease send available options + pricing details.\n\nI am ready to purchase immediately.`
        };
    } else {
        // For the general "WhatsApp Us" button
        pendingOrder = {
            dbKey: "click_general_contact", 
            message: `Hello! I'm interested in your services. Can you help me with more information?`
        };
    }

    // Now trigger the selection popup
    openPopup();
};

/* =========================
   SCROLL FIX
========================= */
function scrollToId(id) {
    const el = $(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
    updateStoreStatus();
    setInterval(updateStoreStatus, 30000);

    initCounters();
    createPopup();
});

window.socialRedirect = (type, url) => {
    try {
        const mobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

        if (mobile) {
            window.location.href = url;
        } else {
            window.open(url, "_blank");
        }

    } catch (e) {
        console.error(type + " redirect failed:", e);
    }
};

/* =========================
   EXPORT
========================= */
window.whatsappRedirect = (type, id) => {
    try {
        const mobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

        let url = "";

        if (type === "channel") {
            url = `https://whatsapp.com/channel/${id}`;
        } else {
            url = `https://chat.whatsapp.com/${id}`;
        }

        if (mobile) {
            window.location.href = url;
        } else {
            window.open(url, "_blank");
        }

    } catch (e) {
        console.error("WhatsApp redirect failed:", e);
    }
};

window.buyGuild = buyGuild;
window.buyLikes = buyLikes;
window.contactNow = contactNow;
window.scrollToId = scrollToId;