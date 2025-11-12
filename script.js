// DOM elements
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Conversation history and user context
let conversation = [];
let userName = null;

// Append a message to the chat window and store in history
function appendMessage(message, sender = "ai") {
  conversation.push({ sender, message });
  const msgDiv = document.createElement("div");
  msgDiv.className = sender === "user" ? "msg user" : "msg ai";
  msgDiv.innerHTML = message
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Initial bot greeting
appendMessage(
  "👋 Bonjour! How can I help you with L’Oréal products today?",
  "ai"
);

/* Handle form submission */

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // Append user message
  appendMessage(message, "user");
  userInput.value = "";

  // Remove any previous latest-question element
  const prevQ = document.getElementById("latest-question");
  if (prevQ) prevQ.remove();

  // Insert latest question above the AI response
  const latestQ = document.createElement("div");
  latestQ.id = "latest-question";
  latestQ.className = "latest-question";
  latestQ.innerHTML = `<span class="q-label">You asked:</span> ${message}`;
  chatWindow.appendChild(latestQ);

  // Show typing indicator
  appendMessage("🤖 Thinking...", "ai");

  try {
    const response = await fetch(
      "https://loreal-chatbot-worker.kdavi136.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message }),
      }
    );

    const data = await response.json();

    // Replace "Thinking..." with actual AI reply
    chatWindow.lastChild.innerHTML = data.reply
      ? data.reply
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.+?)`/g, "<code>$1</code>")
          .replace(/\n/g, "<br>")
      : "Sorry, I couldn't process that.";
  } catch (err) {
    chatWindow.lastChild.textContent = "❌ Error connecting to API.";
    console.error("Chatbot error:", err);
  }
});
