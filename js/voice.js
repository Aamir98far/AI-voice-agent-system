// ================ELEMENTS ============================
const micBtn = document.getElementById("micBtn");
const chatArea = document.getElementById("chatArea");
const micStatus = document.getElementById("micStatus");

// ========SPEECH RECOGNITION (STT) ===========================
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("❌ Speech Recognition not supported in this browser");
}

const recognition = new SpeechRecognition();
recognition.lang = "en-IN";
recognition.interimResults = false;
recognition.continuous = false;

let isListening = false;

// ===================TEXT TO SPEECH (TTS)=======================
const synth = window.speechSynthesis;
let selectedVoice = null;

function loadVoices() {
  const voices = synth.getVoices();
  if (!voices.length) return;

  selectedVoice =
    voices.find(v => v.name.includes("Google")) || voices[0];
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// ===========MIC BUTTON CLICK ============================
micBtn.addEventListener("click", () => {
  if (isListening) {
    recognition.stop();
    return;
  }

  try {
    recognition.start();
    isListening = true;
    micBtn.classList.add("listening");
    if (micStatus) micStatus.innerText = "Listening...";
  } catch (err) {
    console.error("Mic start error:", err);
  }
});

// ============VOICE RESULT ======================
recognition.onresult = (event) => {
  const userText = event.results[0][0].transcript.trim().toLowerCase();
  if (!userText) return;

  addUserMessage(userText);

  // 🌦️ WEATHER VOICE COMMAND
  const weatherMatch =
    userText.match(/weather (in|is)?\s*(.+)/);

  if (weatherMatch) {
    const city = weatherMatch[2].trim();
    fetchWeather(city); 
    speak(`Fetching weather for ${city}`);
    return; 
  }

  // Normal dummy AI flow
  setTimeout(() => {
    const reply = getDummyReply(userText);
    addAIMessage(reply);
    speak(reply);
  }, 500);
};


// =============MIC END =========================
recognition.onend = () => {
  isListening = false;
  micBtn.classList.remove("listening");
  if (micStatus) micStatus.innerText = "Tap to Speak";
};

// ===============ERROR HANDLING =====================
recognition.onerror = (e) => {
  console.error("Speech error:", e.error);
  isListening = false;
};

// =============================== USER MESSAGE UI ===============================
function addUserMessage(text) {
  const msg = document.createElement("div");
  msg.className = "flex items-start gap-3 justify-end";

  msg.innerHTML = `
    <div class="flex flex-col max-w-[80%] items-end">
      <div class="bg-slate-800 text-white px-4 py-3 rounded-2xl rounded-tr-none text-sm">
        ${text}
      </div>
    </div>

    <!-- USER ICON -->
    <div class="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
      <i class="ri-user-3-fill text-white text-sm"></i>
    </div>
  `;

  chatArea.appendChild(msg);
  scrollChat();
}

// =============================== AI MESSAGE UI ===============================
function addAIMessage(text) {
  const msg = document.createElement("div");
  msg.className = "flex items-start gap-3";

  msg.innerHTML = `
    <!-- AI ICON -->
    <div class="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0">
      <i class="ri-robot-2-fill text-white text-sm"></i>
    </div>

    <div class="flex flex-col max-w-[80%]">
      <div
        class="bg-primary/10 border border-primary/20 px-4 py-3 rounded-2xl rounded-tl-none text-sm text-slate-800 dark:text-slate-200">
        ${text}
      </div>
    </div>
  `;

  chatArea.appendChild(msg);
  scrollChat();
}

// ============== AUTO SCROLL============
function scrollChat() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

// =============== TEXT TO SPEECH ==================
function speak(text) {
  if (!synth) return;

  if (!selectedVoice) {
    loadVoices();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice;
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  synth.cancel();
  synth.speak(utterance);
}

// ================ DUMMY AI LOGIC ===============================
function getDummyReply(input) {
  input = input.toLowerCase();

  if (input.includes("weather")) {
    return "🌤️ The weather is pleasant today.";
  }

  if (input.includes("task")) {
    return "You have three pending tasks.";
  }

  if (input.includes("reminder")) {
    return "I can help you set reminders.";
  }

  if (input.includes("hello") || input.includes("hi")) {
    return "Hello. How can I help you?";
  }

  return "I am listening and learning.";
}
