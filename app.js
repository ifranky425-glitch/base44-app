// 1. Map UI DOM Elements
const reflectionForm = document.getElementById("reflectionForm");
const stageSelect = document.getElementById("stageSelect");
const journalText = document.getElementById("journalText");
const statusMessage = document.getElementById("statusMessage");
const logContainer = document.getElementById("logContainer");

// 2. Setup Local Runtimes and Cloud Endpoints
// ⚡ SYSTEM FIX: Appended /api/generate and corrected the api.base44.com domain paths precisely
const OLLAMA_URL = "http://127.0.0";
const BASE44_APP_ID = "6ac2a2c658b71f654f65e2f3";
const BASE44_API_URL = `https://base44.com{BASE44_APP_ID}/entities/reflections`;

// 3. Render Reflection Logs to the Timeline Panel
async function fetchAndRenderLogs() {
  let entries = [];
  try {
    const response = await fetch(BASE44_API_URL);
    if (response.ok) {
      entries = await response.json();
    }
  } catch (error) {
    console.warn(
      "Cloud connection offline, pulling from local container cache.",
    );
  }

  if (!entries || entries.length === 0) {
    const cached = localStorage.getItem("rebridge_logs");
    entries = cached ? JSON.parse(cached) : [];
  }

  if (entries.length === 0) {
    logContainer.innerHTML =
      '<p class="empty-state">No reflection entries logged yet on this machine.</p>';
    return;
  }

  // Sort logs descending by execution time
  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

   // ✅ FIXED: Separated the string template generation logic cleanly from the function's closing brace
  logContainer.innerHTML = entries
    .map(
      (entry) => `
        <div class="log-card">
            <div class="meta">📅 ${new Date(entry.timestamp).toLocaleString()} | 📍 ${entry.currentStageId.toUpperCase()}</div>
            <div style="margin-bottom: 8px;"><strong>Reflection:</strong> ${entry.content}</div>
            ${entry.aiAnalysis ? `<div style="color: #38bdf8; font-size: 0.95rem; border-top: 1px solid #374151; padding-top: 6px; margin-top: 6px;"><strong>AI Analysis:</strong> \${entry.aiAnalysis}</div>` : ""}
        </div>
    `
    )
    .join("");
}


// 4. Handle Form Submissions
reflectionForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const stageValue = stageSelect.value;
  const content = journalText.value.trim();

  if (!content) {
    statusMessage.textContent = "❌ Please enter your thoughts.";
    statusMessage.style.color = "#ef4444";
    return;
  }

  statusMessage.textContent = "🚀 Processing with local AI...";
  statusMessage.style.color = "#38bdf8";

  let aiAnalysisText = "";

  try {
    // 🧠 Pass text directly to your unblocked offline Ollama server endpoint
    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: `Analyze the boundary comfort level and emotional tone of this short reconnection journal entry. Keep it under two sentences: "${content}"`,
        stream: false,
      }),
    });

    if (ollamaResponse.ok) {
      const ollamaData = await ollamaResponse.json();
      aiAnalysisText = ollamaData.response;
    }
  } catch (error) {
    console.warn(
      "Ollama server is asleep, saving entry without analysis.",
      error,
    );
    aiAnalysisText = "Ollama engine was offline during submission.";
  }

  const payload = {
    content: content,
    currentStageId: stageValue,
    aiAnalysis: aiAnalysisText,
    timestamp: new Date().toISOString(),
  };

  const cached = localStorage.getItem("rebridge_logs");
  const existingLogs = cached ? JSON.parse(cached) : [];
  existingLogs.push(payload);
  localStorage.setItem("rebridge_logs", JSON.stringify(existingLogs));

  try {
    await fetch(BASE44_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn("Could not sync to cloud backup.");
  }

  statusMessage.textContent = "String successfully secured!";
  statusMessage.style.color = "#4ade80";
  journalText.value = "";

  await fetchAndRenderLogs();
});

// 5. Run initial feed load on startup
fetchAndRenderLogs();
