// Replace with your actual API key

const GEMINI_API_KEY = "AIzaSyAGnXonvBR68MS4mh5LRNESBSe7yhlS8f0";
// const GEMINI_API_KEY = "AIzaSyD7g6FpA_Q3RSEDd3WdkfEtix80p0VhN9A";

// List of supported Gemini models
const SUPPORTED_MODELS = [
    "chat-bison-001",
    "text-bison-001",
    "embedding-gecko-001",
    "gemini-1.0-pro-vision-latest",
    "gemini-pro-vision",
    "gemini-1.5-pro-latest",
    "gemini-1.5-pro-001",
    "gemini-1.5-pro-002",
    "gemini-1.5-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-001-tuning",
    "gemini-1.5-flash",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash-8b-001",
    "gemini-1.5-flash-8b-latest",
    "gemini-1.5-flash-8b-exp-0827",
    "gemini-1.5-flash-8b-exp-0924",
    "gemini-2.5-pro-exp-03-25",
    "gemini-2.5-pro-preview-03-25",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-exp-image-generation",
    "gemini-2.0-flash-lite-001",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.0-flash-lite-preview",
    "gemini-2.0-pro-exp",
    "gemini-2.0-pro-exp-02-05",
    "gemini-exp-1206",
    "gemini-2.0-flash-thinking-exp-01-21",
    "gemini-2.0-flash-thinking-exp",
    "gemini-2.0-flash-thinking-exp-1219",
    "learnlm-1.5-pro-experimental",
    "gemma-3-1b-it",
    "gemma-3-4b-it",
    "gemma-3-12b-it",
    "gemma-3-27b-it",
    "embedding-001",
    "text-embedding-004",
    "gemini-embedding-exp-03-07",
    "gemini-embedding-exp",
    "aqa",
    "imagen-3.0-generate-002"
];

let selectedCity = ""; // Store the selected city for safety tips

// Function to select an appropriate model based on task (default to gemini-2.0-flash)
function selectModel(prompt) {
    // For simplicity, default to gemini-2.0-flash; you can add logic to choose based on prompt
    return "gemini-2.0-flash";
}

// Function to call Gemini API with dynamic model selection
async function callGeminiAPI(prompt) {
    const model = selectModel(prompt); // Dynamically select model
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from API.";
    } catch (error) {
        console.error("API Error:", error);
        return "Error fetching data. Please try again.";
    }
}

// Get user's location
function getCurrentLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => callback({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
            () => callback(null)
        );
    } else {
        callback(null);
    }
}

// Show/hide plan input based on user choice
function showPlanInput(hasPlan) {
    const planInputSection = document.getElementById("planInputSection");
    planInputSection.classList.remove("hidden");
    document.querySelector(".plan-check").classList.add("hidden");

    if (!hasPlan) {
        document.getElementById("destination").value = "";
        document.getElementById("travelDate").value = "";
        document.getElementById("duration").value = "7";
    }
}

// Show loading animation
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = `
        <div class="loading">
            <div class="loading-ball"></div>
            <div class="loading-ball"></div>
            <div class="loading-ball"></div>
        </div>
    `;
}

// Hide loading animation and show content
async function hideLoading(elementId, content, delay = 2000) {
    const element = document.getElementById(elementId);
    await new Promise(resolve => setTimeout(resolve, delay));
    element.innerHTML = content;
}

// Fetch famous destinations
async function getDestinations() {
    const destination = document.getElementById("destination").value;
    const travelDate = document.getElementById("travelDate").value;
    const duration = document.getElementById("duration").value;

    if (!destination || !travelDate || !duration) {
        alert("Please enter all fields.");
        return;
    }

    showLoading("destinations");
    document.getElementById("destinationsList").classList.remove("hidden");

    const prompt = `List the 10 most famous tourist destinations in ${destination}.`;
    const response = await callGeminiAPI(prompt);
    
    let destinations = response.split("\n").filter(item => item.trim()).slice(0, 10);
    const formattedDestinations = destinations.map((dest, i) => 
        `<li onclick="getTravelPlan('${dest.replace(/'/g, "\\'")}', '${destination.replace(/'/g, "\\'")}', '${travelDate}', '${duration}')">${dest}</li>`
    ).join("");
    
    hideLoading("destinations", formattedDestinations);
}

// Fetch detailed travel plan
async function getTravelPlan(selectedDestination, city, dateStr, duration) {
    selectedCity = city; // Store the city for safety tips
    document.getElementById("travelPlan").classList.remove("hidden");
    showLoading("planOutput");

    getCurrentLocation(async (location) => {
        const locationText = location ? `User's location: ${location.latitude}, ${location.longitude}.` : "User location unknown.";

        const prompt = `
            Provide a detailed travel plan for ${selectedDestination} in ${city} starting on ${dateStr} for ${duration} days.
            ${locationText}
            Include:
            - Best time to visit
            - Best hotel recommendations at different price ranges
            - Local transportation options (taxis, public transport, rental cars)
            - Emergency preparedness (nearest hospitals, emergency contacts)
            - Cultural and safety tips
            - Downloadable offline safety guide suggestion
            Format the response with clear headings and bullet points.
            Highlight any high-risk areas or safety concerns in red.
        `;

        const response = await callGeminiAPI(prompt);
        const formattedResponse = formatText(response);
        hideLoading("planOutput", formattedResponse);
    });
}

// Show safety tips prompt section
function showSafetyTipsPrompt() {
    document.getElementById("safetyTipsSection").classList.remove("hidden");
}

// Fetch safety tips based on user prompt
async function getSafetyTips() {
    const safetyPrompt = document.getElementById("safetyPrompt").value;
    if (!safetyPrompt) {
        alert("Please enter a safety tips prompt.");
        return;
    }

    document.getElementById("safetyTips").classList.remove("hidden");
    showLoading("tipsOutput");

    const prompt = `
        Provide detailed travel safety tips based on this prompt: "${safetyPrompt}" for ${selectedCity}.
        Include:
        - Specific examples
        - Emergency contacts for the location
        - Basic translation phrases for emergencies
        - Advice on reliable transportation
        - Any high-risk areas to avoid (highlight these in red)
        Format the response with clear headings and bullet points.
    `;

    const response = await callGeminiAPI(prompt);
    const formattedResponse = formatText(response);
    hideLoading("tipsOutput", formattedResponse);
}

// Format text for better readability
function formatText(text) {
    // Remove markdown formatting (**, etc.)
    text = text.replace(/\*\*/g, '');
    
    const lines = text.split("\n").filter(line => line.trim());
    let formatted = "";
    let listItems = [];
    let listType = null;
    let inList = false;

    lines.forEach(line => {
        // Check for warning lines (should be marked with [WARNING] or similar)
        if (line.match(/\[(WARNING|DANGER|RISK)\]/i) || line.match(/avoid/i) || line.match(/dangerous/i) || line.match(/unsafe/i)) {
            if (inList) {
                formatted += closeList(listItems, listType);
                listItems = [];
                inList = false;
            }
            formatted += `<p class="warning">⚠️ ${line.replace(/\[(WARNING|DANGER|RISK)\]/i, '').trim()}</p>`;
            return;
        }

        // Check if the line is a heading (e.g., starts with a keyword or is short)
        if (line.match(/^[A-Z][a-z]+:/) || (line.length < 50 && line.match(/^[A-Z][a-z ]+$/))) {
            if (inList) {
                formatted += closeList(listItems, listType);
                listItems = [];
                inList = false;
            }
            formatted += `<h3>${line}</h3>`;
        }
        // Check if the line is a numbered list item
        else if (line.match(/^\d+\.\s/)) {
            if (!inList || listType !== 'ol') {
                if (inList) {
                    formatted += closeList(listItems, listType);
                }
                listType = 'ol';
                inList = true;
            }
            listItems.push(`<li>${line.replace(/^\d+\.\s/, '')}</li>`);
        }
        // Check if the line is a bullet list item
        else if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
            if (!inList || listType !== 'ul') {
                if (inList) {
                    formatted += closeList(listItems, listType);
                }
                listType = 'ul';
                inList = true;
            }
            listItems.push(`<li>${line.substring(2)}</li>`);
        }
        // Check if the line is a continuation of a list item
        else if (inList && (line.startsWith("  ") || line.startsWith("\t"))) {
            if (listItems.length > 0) {
                listItems[listItems.length - 1] += `<br>${line.trim()}`;
            }
        }
        // Treat as a paragraph
        else {
            if (inList) {
                formatted += closeList(listItems, listType);
                listItems = [];
                inList = false;
            }
            formatted += `<p>${line}</p>`;
        }
    });

    if (inList) {
        formatted += closeList(listItems, listType);
    }

    return formatted;
}

// Helper function to close a list
function closeList(items, type) {
    if (items.length === 0) return '';
    return `<${type}>${items.join('')}</${type}>`;
}