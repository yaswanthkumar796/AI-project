// Replace with your actual API key
const GEMINI_API_KEY = "AIzaSyAGnXonvBR68MS4mh5LRNESBSe7yhlS8f0";

let selectedCity = ""; // Store the selected city for safety tips




// Function to call Gemini API (or mock response for now)
async function callGeminiAPI(prompt) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
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

// Fetch famous destinations
async function getDestinations() {
    const destination = document.getElementById("destination").value;
    const travelDate = document.getElementById("travelDate").value;
    const duration = document.getElementById("duration").value;

    if (!destination || !travelDate || !duration) {
        alert("Please enter all fields.");
        return;
    }

    document.getElementById("destinations").innerHTML = "Loading...";
    document.getElementById("destinationsList").classList.remove("hidden");

    const prompt = `List the 10 most famous tourist destinations in ${destination}.`;
    const response = await callGeminiAPI(prompt);
    
    let destinations = response.split("\n").filter(item => item.trim()).slice(0, 10);
    document.getElementById("destinations").innerHTML = destinations.map((dest, i) => 
        `<li onclick="getTravelPlan('${dest}', '${destination}', '${travelDate}', '${duration}')">${dest}</li>`
    ).join("");
}

// Fetch detailed travel plan
async function getTravelPlan(selectedDestination, city, dateStr, duration) {
    selectedCity = city; // Store the city for safety tips
    document.getElementById("travelPlan").classList.remove("hidden");
    document.getElementById("planOutput").innerHTML = "Generating travel plan...";

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
           
        `;

        const response = await callGeminiAPI(prompt);
        document.getElementById("planOutput").innerHTML = formatText(response);
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
    document.getElementById("tipsOutput").innerHTML = "Fetching safety tips...";

    const prompt = `
        Provide detailed travel safety tips based on this prompt: "${safetyPrompt}" for ${selectedCity}.
        Include:
        - Specific examples
        - Emergency contacts for the location
        - Basic translation phrases for emergencies
        - Advice on reliable transportation
    `;

    const response = await callGeminiAPI(prompt);
    document.getElementById("tipsOutput").innerHTML = formatText(response);
}

// Format text for better readability
function formatText(text) {
    const lines = text.split("\n").filter(line => line.trim());
    let formatted = "";
    let inList = false;

    lines.forEach(line => {
        // Check if the line is a heading (e.g., starts with a keyword or is short)
        if (line.match(/^(Best|Emergency|Cultural|Local|Downloadable|Specific|Basic|Advice)/i) || line.length < 50) {
            if (inList) {
                formatted += "</ul>";
                inList = false;
            }
            formatted += `<h3>${line}</h3>`;
        }
        // Check if the line is a list item
        else if (line.startsWith("- ") || line.startsWith("* ")) {
            if (!inList) {
                formatted += "<ul>";
                inList = true;
            }
            formatted += `<li>${line.substring(2)}</li>`;
        }
        // Treat as a paragraph
        else {
            if (inList) {
                formatted += "</ul>";
                inList = false;
            }
            formatted += `<p>${line}</p>`;
        }
    });

    if (inList) {
        formatted += "</ul>";
    }

    return formatted;
}