// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// // give basic startup info
// console.log("Starting backend...");

// const USE_MOCK = process.env.USE_MOCK === "true";

// // Only create Gemini client if API key present and not forcing mock
// let genAI = null;
// if (!USE_MOCK && process.env.GEMINI_API_KEY) {
//   try {
//     genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     console.log("Gemini client initialized.");
//   } catch (err) {
//     console.error("Failed to initialize Gemini client:", err);
//   }
// } else {
//   console.log("Running in MOCK mode (no Gemini client). Set GEMINI_API_KEY to enable real AI.");
// }

// // Simple health route
// app.get("/", (req, res) => {
//   res.json({ status: "ok", mock: USE_MOCK, gemini: !!genAI });
// });

// // Skill enhancement endpoint 
// app.post("/ai/skills", async (req, res) => {
//   try {
//     const { skills } = req.body;

//     if (!genAI) {
//       // Return a mock-friendly response if gemini not configured
//       return res.json({
//         success: true,
//         suggestions: `Mock suggestions because GEMINI_API_KEY is not set. Provided skills: ${skills.map(s => s.name + "(" + s.level + ")").join(", ")}`
//       });
//     }

//     const prompt = `
// You are an AI career mentor. Using the user's skill levels, suggest what they should learn next.
// Keep the output in 5–8 simple bullet points.

// User Skills:
// ${skills.map(s => `• ${s.name} (${s.level})`).join("\n")}
// `;

//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash",
//       generationConfig: {
//         temperature: 0.4
//       }
//     });

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     res.json({ success: true, suggestions: text });
//   } catch (error) {
//     console.error("AI ERROR:", error);
//     res.status(500).json({ success: false, error: "AI backend error" });
//   }
// });

// // Project Collaboration — AI Applicant Analysis
// app.post("/ai/analyse-collab", async (req, res) => {
//   try {
//     console.log("Received /ai/analyse-collab request:", {
//       bodyPreview: {
//         applicantName: req.body.applicantName,
//         applicantGithub: req.body.applicantGithub ? req.body.applicantGithub.slice(0, 80) : null,
//         requiredSkills: req.body.requiredSkills
//       }
//     });

//     const { applicantGithub = "Not provided", requiredSkills = [], applicantName = "Applicant" } = req.body;

//     // If no Gemini client, return a example mock to allow frontend testing
//     if (!genAI) {
//       const mockScore = 78;
//       return res.json({
//         matchScore: mockScore,
//         strengths: ["Clear repo structure", "Good README", "Relevant libraries used"],
//         weaknesses: ["Missing tests", "Sparse documentation in some modules"],
//         repoQuality: "Good",
//         recommendation: mockScore >= 70 ? "Suitable" : "May not be suitable",
//         details: `This is a MOCK analysis because GEMINI_API_KEY is not set on the server. Applicant: ${applicantName}, Repo: ${applicantGithub}`
//       });
//     }

//     // Real Gemini analysis
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const prompt = `
// You are an AI evaluating a contributor for a software project.
// You MUST give a VERY SHORT response. Do NOT add long explanations.

// Applicant:
// Name: ${applicantName}
// GitHub: ${applicantGithub}
// Required Skills: ${requiredSkills.join(", ")}

// RETURN THE ANSWER ONLY IN THIS EXACT FORMAT.  
// ABSOLUTELY NO EXTRA TEXT, NO EXTRA SECTIONS:

// MATCH SCORE: <number only>

// STRENGTHS:
// - <max 2 bullets>

// WEAKNESSES:
// - <max 2 bullets>

// REPO QUALITY: <one-word rating: Excellent, Good, Average, Poor>

// RECOMMENDATION: <Suitable / Borderline / Not Suitable>

// DETAILS: <ONE sentence ONLY. No more.>

// CONCLUSION: <2-3 sentence on what decision should user make.>

// RULES:
// - DO NOT add improvement lists.
// - DO NOT add analysis paragraphs.
// - DO NOT add introductions or conclusions.
// - DO NOT output more than what is required.
// - Keep everything as short as possible.
// `;

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     const response = {
//       matchScore: extractNumber(text, "MATCH SCORE") || null,
//       strengths: extractList(text, "STRENGTHS"),
//       weaknesses: extractList(text, "WEAKNESSES"),
//       repoQuality: extractLine(text, "REPO QUALITY"),
//       recommendation: extractLine(text, "RECOMMENDATION"),
//       details: extractSection(text, "DETAILS"),
//       conclusion: extractSection(text, "CONCLUSION"),
//     };

//     // Fix case where Gemini puts CONCLUSION inside DETAILS
//     if (response.details && response.details.includes("CONCLUSION:")) {
//       const parts = response.details.split(/CONCLUSION:/i);
//       response.details = parts[0].trim();
//       response.conclusion = parts[1].trim();
//     }


//     res.json(response);

//   } catch (err) {
//     console.error("AI Analyse Error:", err);
//     res.status(500).json({ error: "AI analysis failed" });
//   }
// });

// // parsing function
// function extractLine(text, key) {
//   const match = text.match(new RegExp(`${key}:\\s*(.*)`, "i"));
//   return match ? match[1].trim() : "";
// }

// function extractNumber(text, key) {
//   const line = extractLine(text, key);
//   const num = parseInt(line);
//   return isNaN(num) ? null : num;
// }

// function extractList(text, key) {
//   const splitIndex = text.toUpperCase().indexOf(key.toUpperCase() + ":");
//   if (splitIndex === -1) return [];
//   const rest = text.slice(splitIndex + key.length + 1);
//   // stop at next all-caps label if present
//   const stop = rest.search(/\n[A-Z\s]{3,30}:/);
//   const section = stop === -1 ? rest : rest.slice(0, stop);
//   return section
//     .split(/\r?\n/)
//     .map(l => l.replace(/^[\-\•\*\s]+/, "").trim())
//     .filter(l => l.length > 0);
// }

// function extractSection(text, key) {
//   const regex = new RegExp(`${key}:\\s*([\\s\\S]*?)(?=\\n[A-Z ]{3,20}:|$)`, "i");
//   const match = text.match(regex);

//   if (!match) return "";

//   return match[1].trim();
// }


// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}  (mock=${USE_MOCK})`));



import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Fix for ES modules (__dirname equivalent)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend files
app.use(express.static(path.join(__dirname, "../")));

console.log("Starting backend...");

const USE_MOCK = process.env.USE_MOCK === "true";

// Gemini client
let genAI = null;

if (!USE_MOCK && process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Gemini client initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
  }
} else {
  console.log("Running in MOCK mode (no Gemini client)");
}

// Serve frontend homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mock: USE_MOCK,
    gemini: !!genAI
  });
});


// Skill enhancement endpoint
app.post("/ai/skills", async (req, res) => {
  try {
    const { skills } = req.body;

    if (!genAI) {
      return res.json({
        success: true,
        suggestions: `Mock suggestions because GEMINI_API_KEY not set. Skills: ${skills.map(s => s.name + "(" + s.level + ")").join(", ")}`
      });
    }

    const prompt = `
You are an AI career mentor. Suggest what the user should learn next.
Give 5–8 bullet points.

User Skills:
${skills.map(s => `• ${s.name} (${s.level})`).join("\n")}
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 0.4 }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ success: true, suggestions: text });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ success: false, error: "AI backend error" });
  }
});


// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
