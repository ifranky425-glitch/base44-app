import { createClient } from "@base44/sdk";

// 1. Initialize connection with your private project ID
const base44 = createClient({
    appId: "6ac2a2c658b71f654f65e2f3" 
});

// 2. Map UI DOM Elements
const reflectionForm = document.getElementById('reflectionForm');
const stageSelect = document.getElementById('stageSelect');
const journalText = document.getElementById('journalText');
const statusMessage = document.getElementById('statusMessage');
const logContainer = document.getElementById('logContainer');

// 3. Render Live Reflection Logs from the Cloud
async function fetchAndRenderLogs() {
    try {
        // ✅ Native Base44 SDK Fix: Use lower-case entity name and standard .list() method
        const entries = await base44.entities.reflections.list();

        if (!entries || entries.length === 0) {
            logContainer.innerHTML = '<p class="empty-state">No reflection entries logged yet on this machine.</p>';
            return;
        }

        // Sort entries locally by timestamp descending
        const sortedEntries = entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        logContainer.innerHTML = sortedEntries.map(entry => `
            <div class="log-card">
                <div class="meta">📅 ${new Date(entry.timestamp).toLocaleString()} | 📍 ${entry.currentStageId.toUpperCase()}</div>
                <div>${entry.content}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Fetch Error:', error);
        logContainer.innerHTML = '<p class="empty-state" style="color: #ef4444;">❌ Failed to load active log feed.</p>';
    }
}

// 4. Handle Form Submission Actions
reflectionForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const stageValue = stageSelect.value;
    const content = journalText.value.trim();

    if (!content) {
        statusMessage.textContent = '❌ Please enter your thoughts.';
        statusMessage.style.color = '#ef4444';
        return;
    }

    statusMessage.textContent = '🚀 Deploying record...';
    statusMessage.style.color = '#38bdf8';

    try {
        // ✅ Native Base44 SDK Fix: Lower-case entity route definition
        await base44.entities.reflections.create({
            content: content,
            currentStageId: stageValue,
            timestamp: new Date().toISOString()
        });

        statusMessage.textContent = '✅ Reflection successfully secured!';
        statusMessage.style.color = '#4ade80';
        
        journalText.value = ''; 
        
        await fetchAndRenderLogs(); 
    } catch (error) {
        console.error('Submission Error:', error);
        statusMessage.textContent = '❌ Sync failed. View browser inspector console (F12) for network errors.';
        statusMessage.style.color = '#ef4444';
    }
});

// 5. Run initial feed pull on page load
fetchAndRenderLogs();
