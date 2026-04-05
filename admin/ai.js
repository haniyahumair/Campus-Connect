import { marked } from "https://cdn.jsdelivr.net/npm/marked/src/marked.min.js";

marked.setOptions({
    mangle: false,
    headerIds: false,
  });

const messages = [];
let currentSystemPrompt = "";

function addUserMessage(text) {
  const userMessage = { role: "user", content: text };
  messages.push(userMessage);
  displayMessage(userMessage);
}

function addAssistantMessage(text) {
  const assistantMessage = { role: "assistant", content: text };
  messages.push(assistantMessage);
  displayMessage(assistantMessage);
}

function displayMessage(message) {
  const aiMsgs = document.getElementById("aiMsg");
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg msg-${message.role}`;

  if (message.role === "assistant") {
    msgDiv.innerHTML = marked.parse(message.content);
  } else {
    msgDiv.textContent = message.content;
  }

  aiMsgs.appendChild(msgDiv);
  aiMsgs.scrollTop = aiMsgs.scrollHeight;
}

function showTypingBubble() {
  const aiMsgs = document.getElementById("aiMsg");
  const bubble = document.createElement("div");
  bubble.className = "msg msg-assistant typing-bubble";
  bubble.id = "typing-bubble";
  bubble.innerHTML = `<span></span><span></span><span></span>`;
  aiMsgs.appendChild(bubble);
  aiMsgs.scrollTop = aiMsgs.scrollHeight;
}

function removeTypingBubble() {
  const bubble = document.getElementById("typing-bubble");
  if (bubble) bubble.remove();
}

async function fetchAIResponse(messages) {
  const response = await fetch("http://localhost:3001/api/anthropic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, systemPrompt: currentSystemPrompt }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function sendAI() {
  const input = document.getElementById("ai-input");
  const userText = input.value.trim();
  if (!userText) return;

  addUserMessage(userText);
  input.value = "";
  showTypingBubble();

  try {
    const aiResponse = await fetchAIResponse(messages);
    removeTypingBubble();
    addAssistantMessage(aiResponse);
  } catch (error) {
    console.error("Error fetching AI response:", error);
    removeTypingBubble();
    addAssistantMessage("Sorry, I couldn't process your request. Please try again.");
  }
}

export function initChatbot(systemPrompt = "") {
  currentSystemPrompt = systemPrompt;

  const aiChips = document.querySelectorAll(".ai-chips .chip");
  const sendButton = document.querySelector(".ai-send-btn");
  const inputField = document.getElementById("ai-input");

  aiChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      document.getElementById("ai-input").value = chip.textContent.trim();
      sendAI();
    });
  });

  inputField.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      sendAI();
    }
  });  

  sendButton.addEventListener("click", sendAI);
}
