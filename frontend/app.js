// Configuration
const API_URL = "http://localhost:8787/api/chat";

// State
let chatHistory = [];

// DOM Elements
const chatContainer = document.getElementById("chat-container");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Marked config
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Auto-resize textarea
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
  if (this.value.trim() === "") {
    this.style.height = "auto"; // Reset if empty
  }
});

// Submit on Enter (without shift)
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});

// Scroll optimization via MutationObserver
const observer = new MutationObserver(() => {
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth"
  });
});

observer.observe(chatContainer, {
  childList: true,
  subtree: true,
  characterData: true
});

// Generate User Bubble
function appendUserMessage(text) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start justify-end w-full user-msg";
  
  wrapper.innerHTML = `
    <div class="flex flex-col space-y-1 max-w-[85%] items-end">
      <span class="text-sm text-silver font-medium mr-1 mb-1">You</span>
      <div class="bg-slate-gray text-frost px-5 py-4 rounded-l-xl rounded-br-xl text-lg leading-relaxed shadow-sm">
        ${DOMPurify.sanitize(text.replace(/\\n/g, "<br>"))}
      </div>
    </div>
  `;
  
  chatContainer.appendChild(wrapper);
}

// Generate Bot Bubble
function appendBotMessage(markdownText) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start w-full";
  
  const rawHtml = marked.parse(markdownText);
  const cleanHtml = DOMPurify.sanitize(rawHtml);
  
  wrapper.innerHTML = `
    <div class="flex-shrink-0 mr-4 mt-1">
      <img src="assets/logo.png" alt="BeChad" class="h-10 w-10 rounded-md border border-white/10">
    </div>
    <div class="flex flex-col space-y-2 max-w-[85%]">
      <span class="text-sm text-silver font-medium">BeChad</span>
      <div class="text-frost border-l-4 border-chad-gold pl-5 text-lg leading-relaxed markdown-body">
        ${cleanHtml}
      </div>
    </div>
  `;
  
  chatContainer.appendChild(wrapper);
}

// Generate Loading Bubble
function appendLoadingMessage() {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-start w-full" ;
  wrapper.id = "loading-bubble";
  
  wrapper.innerHTML = `
    <div class="flex-shrink-0 mr-4 mt-1 opacity-70">
      <img src="assets/logo.png" alt="BeChad" class="h-10 w-10 rounded-md border border-white/10 grayscale">
    </div>
    <div class="flex flex-col space-y-2 max-w-[85%] justify-center">
      <span class="text-sm text-silver font-medium">BeChad</span>
      <div class="flex space-x-1 pl-5 h-8 items-center border-l-4 border-slate-700">
        <div class="w-2 h-2 bg-silver rounded-full animate-pulse"></div>
        <div class="w-2 h-2 bg-silver rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 bg-silver rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
      </div>
    </div>
  `;
  
  chatContainer.appendChild(wrapper);
}

function removeLoadingMessage() {
  const loading = document.getElementById("loading-bubble");
  if (loading) {
    loading.remove();
  }
}

// Submit handler
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const query = userInput.value.trim();
  if (!query) return;

  // 1. UI updates: Input clearing and disabling
  userInput.value = "";
  userInput.style.height = "auto";
  userInput.disabled = true;
  sendBtn.disabled = true;

  // 2. Append user message + loader
  appendUserMessage(query);
  appendLoadingMessage();

  // 3. API Request
  const startTime = Date.now();
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, history: chatHistory })
    });

    const data = await res.json().catch(() => ({}));

    // Ensure loading indicator shows for at least 400ms to allow
    // the initial smooth scroll animation to finish before we trigger another.
    const elapsed = Date.now() - startTime;
    if (elapsed < 400) {
      await new Promise(r => setTimeout(r, 400 - elapsed));
    }

    // Perform DOM updates synchronously so MutationObserver batches them into one smooth scroll
    removeLoadingMessage();

    if (!res.ok) {
      throw new Error(data.error || `Server error (${res.status})`);
    }

    appendBotMessage(data.response);

    // Update history
    chatHistory.push({ role: "user", content: query });
    chatHistory.push({ role: "assistant", content: data.response });

    // Keep history from getting too large (last 10 messages)
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(chatHistory.length - 10);
    }

  } catch (error) {
    removeLoadingMessage();
    appendBotMessage(`**Error:** Unable to reach the mentor. \n*${error.message}*`);
    console.error("Chat error:", error);
  } finally {
    // 4. Cleanup
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
});
