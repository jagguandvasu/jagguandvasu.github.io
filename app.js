
// ============================================
// A LITTLE WORLD FOR VASU ♡
// Complete JavaScript file
// Made with love by Jaggu ❤️
// ============================================


// --------------------------------------------
// 1. SUPABASE CONFIGURATION
// --------------------------------------------

const cfg = window.APP_CONFIG || {};

const backendReady = !!(
  cfg.SUPABASE_URL &&
  cfg.SUPABASE_ANON_KEY &&
  !cfg.SUPABASE_URL.includes("YOUR_") &&
  !cfg.SUPABASE_ANON_KEY.includes("YOUR_")
);

let db = null;

if (backendReady && window.supabase) {
  db = window.supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );
}


// --------------------------------------------
// 2. FLOATING SPARKLES ✨
// --------------------------------------------

const sparkleContainer = document.getElementById("sparkles");

const sparkleSymbols = ["✨", "♡", "✦", "💗", "🌸", "⋆"];

function createSparkle() {
  if (!sparkleContainer) return;

  const sparkle = document.createElement("span");

  sparkle.className = "floaty";

  sparkle.textContent =
    sparkleSymbols[
      Math.floor(Math.random() * sparkleSymbols.length)
    ];

  sparkle.style.left = Math.random() * 100 + "vw";

  sparkle.style.fontSize =
    (12 + Math.random() * 18) + "px";

  sparkle.style.animationDuration =
    (7 + Math.random() * 6) + "s";

  sparkleContainer.appendChild(sparkle);

  setTimeout(() => {
    sparkle.remove();
  }, 14000);
}

// Create sparkles continuously

if (sparkleContainer) {
  setInterval(createSparkle, 500);

  for (let i = 0; i < 12; i++) {
    setTimeout(createSparkle, i * 200);
  }
}


// --------------------------------------------
// 3. VISITOR CONSENT & REACTION SHARING ❤️
// --------------------------------------------

let sharingAllowed =
  localStorage.getItem("vasu_reaction_consent") === "yes";

const consent = document.getElementById("consentBackdrop");

if (
  consent &&
  !localStorage.getItem("vasu_reaction_consent")
) {
  consent.hidden = false;
}


async function logReaction(eventName, detail = "") {

  if (!sharingAllowed || !db) return;

  try {

    const { error } = await db
      .from("love_reactions")
      .insert({
        event_name: String(eventName).slice(0, 80),
        detail: String(detail).slice(0, 180),
        page: "vasu-love"
      });

    if (error) {
      console.warn("Reaction could not be saved:", error);
    }

  } catch (err) {

    console.warn("Reaction error:", err);

  }
}


function trackClick(id, detail = "") {
  logReaction(id, detail);
}


// Allow reaction sharing

const allowSharing = document.getElementById("allowSharing");

if (allowSharing) {

  allowSharing.onclick = () => {

    sharingAllowed = true;

    localStorage.setItem(
      "vasu_reaction_consent",
      "yes"
    );

    if (consent) consent.hidden = true;

    logReaction(
      "sharing_enabled",
      "Visitor chose to share page interactions"
    );

    showToast("Thanks for sharing a little love ♡");

  };

}


// Decline reaction sharing

const declineSharing =
  document.getElementById("declineSharing");

if (declineSharing) {

  declineSharing.onclick = () => {

    sharingAllowed = false;

    localStorage.setItem(
      "vasu_reaction_consent",
      "no"
    );

    if (consent) consent.hidden = true;

    showToast("No problem — enjoy the page ♡");

  };

}


// --------------------------------------------
// 4. TOAST NOTIFICATIONS 💗
// --------------------------------------------

function showToast(msg) {

  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = msg;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2800);

}


// --------------------------------------------
// 5. TRACK BUTTON INTERACTIONS
// --------------------------------------------

document.querySelectorAll("[data-track]").forEach(el => {

  el.addEventListener("click", () => {

    trackClick(el.dataset.track);

  });

});


// --------------------------------------------
// 6. TEN REASONS I ADORE YOU 🌷
// --------------------------------------------

const reasons = [

  ["Your smile", "It makes an ordinary day feel brighter. 😊"],

  ["Your heart", "Your kindness is one of my favourite things. 💗"],

  ["Your silly side", "You make me laugh when I need it most. 😂"],

  ["Your voice", "It makes everything feel calmer. 🎧"],

  ["Your little things", "The details that make you wonderfully you. 🌷"],

  ["Your support", "You remind me I don't have to do everything alone. 🫶"],

  ["Our conversations", "I could talk to you about absolutely nothing. ☁️"],

  ["Your hugs", "My favourite place to pause the world. 🤗"],

  ["Your dreams", "I love cheering you on. ✨"],

  ["Simply you", "No big reason needed. You're just my person. ♡"]

];

const grid = document.getElementById("reasonsGrid");

if (grid) {

  reasons.forEach(([title, msg], i) => {

    const button = document.createElement("button");

    button.className = "reason";

    const emojis = [
      "🌷", "💗", "😂", "🎧", "✨",
      "🫶", "☁️", "🤗", "🌙", "♡"
    ];

    const icon = document.createElement("span");

    icon.className = "emoji";

    icon.textContent = emojis[i];

    const label = document.createElement("span");

    label.textContent = title;

    button.append(icon, label);

    button.onclick = () => {

      showToast(msg);

      trackClick("love_reason_tapped", title);

    };

    grid.appendChild(button);

  });

}


// --------------------------------------------
// 7. OPEN AND CLOSE LOVE LETTER 💌
// --------------------------------------------

const openLetter =
  document.getElementById("openLetter");

const letterPaper =
  document.getElementById("letterPaper");


if (openLetter && letterPaper) {

  openLetter.onclick = () => {

    letterPaper.hidden = !letterPaper.hidden;

    openLetter.textContent = letterPaper.hidden
      ? "Open your letter ♡"
      : "Close your letter ♡";

    if (!letterPaper.hidden) {

      updateMusicReminder();

    }

    trackClick(
      letterPaper.hidden
        ? "letter_closed"
        : "letter_opened"
    );

  };

}


// --------------------------------------------
// 8. VIRTUAL HUG BUTTONS 🤗
// --------------------------------------------

const letterHug =
  document.getElementById("letterHug");

if (letterHug) {

  letterHug.onclick = () => {

    showToast("A hug, delivered with love 🤗");

    trackClick("virtual_hug_from_letter");

  };

}


const finalHug =
  document.getElementById("finalHug");

if (finalHug) {

  finalHug.onclick = () => {

    showToast(
      "I love you, Vasu. More than this page can say. ♡"
    );

    trackClick("final_virtual_hug");

  };

}


// --------------------------------------------
// 9. OPTIONAL PHOTO UPLOAD 📷
// --------------------------------------------

const photoUpload =
  document.getElementById("photoUpload");

if (photoUpload) {

  photoUpload.addEventListener("change", e => {

    [...e.target.files].slice(0, 3).forEach((file, i) => {

      const target =
        document.getElementById("photo" + i);

      if (!target) return;

      if (!file.type.startsWith("image/")) return;

      const img = document.createElement("img");

      img.src = URL.createObjectURL(file);

      img.alt = "A favourite memory";

      target.replaceChildren(img);

    });

  });

}


// --------------------------------------------
// 10. ENNA SONA MUSIC PLAYER 🎵
// --------------------------------------------

const audio = document.getElementById("audio");

const playButton =
  document.getElementById("playSong");

const pauseButton =
  document.getElementById("pauseSong");

const songStatus =
  document.getElementById("songStatus");


if (audio && playButton && pauseButton && songStatus) {

  // PLAY SONG

  playButton.addEventListener("click", async () => {

    try {

      await audio.play();

      songStatus.textContent =
        "Playing Enna Sona ❤️";

      trackClick("song_played");

    } catch (error) {

      songStatus.textContent =
        "Unable to play. Check the music file path!";

      console.error("Music error:", error);

    }

  });


  // PAUSE SONG

  pauseButton.addEventListener("click", () => {

    audio.pause();

    songStatus.textContent = "Paused ❤️";

    trackClick("song_paused");

  });


  // AUDIO ERROR

  audio.addEventListener("error", () => {

    songStatus.textContent =
      "Music file not found or unsupported!";

    console.error(
      "Audio loading error:",
      audio.error
    );

  });


  // SONG ENDED

  audio.addEventListener("ended", () => {

    songStatus.textContent =
      "Play it again, Vasu 💗";

  });

}


// --------------------------------------------
// 11. MUSIC REMINDER INSIDE LOVE LETTER 🥺
// --------------------------------------------

const message =
  document.getElementById("musicReminder");


function updateMusicReminder() {

  if (!audio || !message) return;


  if (!audio.paused && !audio.ended) {

    message.textContent =
      "Awww! Music play kar liya tumne 🥹❤️ Ab letter padho aur feel karo... 🎶";

    message.classList.add("music-playing");

  }

  else {

    message.textContent =
      "Oye Vasu! Pehle music play kar beta 🎶❤️ Niche jaa kar abhi tak kiya nahi hai! 😤";

    message.classList.remove("music-playing");

  }

}


// Update reminder whenever music state changes

if (audio && message) {

  updateMusicReminder();

  audio.addEventListener(
    "play",
    updateMusicReminder
  );

  audio.addEventListener(
    "pause",
    updateMusicReminder
  );

  audio.addEventListener(
    "ended",
    updateMusicReminder
  );

}


// --------------------------------------------
// 12. SERVICE WORKER / PWA SUPPORT 📱
// --------------------------------------------

if (
  "serviceWorker" in navigator &&
  location.protocol.startsWith("http")
) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("./sw.js")
      .catch(error => {

        console.warn(
          "Service worker registration failed:",
          error
        );

      });

  });

}


// --------------------------------------------
// END OF APP.JS ❤️
// A LITTLE WORLD FOR VASU
// --------------------------------------------
