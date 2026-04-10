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
import pool from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Prevent aggressive browser caching on dynamic API routes
app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
});

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


// --- DB API ROUTES ---

// Login
app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2 AND role = $3', [email, password, role]);
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials or role" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// Get user profile data (skills, clubs)
app.get("/api/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const userRes = await pool.query('SELECT id, name, year, department, title, email, role, linkedin_connected, github_connected FROM users WHERE id = $1', [userId]);
    const skillsRes = await pool.query('SELECT * FROM skills WHERE user_id = $1', [userId]);
    const clubsRes = await pool.query('SELECT c.* FROM clubs c JOIN club_members cm ON c.id = cm.club_id WHERE cm.user_id = $1', [userId]);
    
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.json({
      user: userRes.rows[0],
      skills: skillsRes.rows,
      clubs: clubsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Network / Users list with basic skills
app.get("/api/network", async (req, res) => {
  try {
    const userId = req.query.userId;
    let query = `
      SELECT u.id, u.name, u.title, u.department, u.year, u.role, 
      (SELECT string_agg(s.name, ',') FROM skills s WHERE s.user_id = u.id) as skills
      FROM users u
    `;
    const params = [];
    
    if (userId) {
      query += `
        WHERE u.id != $1
        AND u.id NOT IN (
          SELECT receiver_id FROM connections WHERE sender_id = $1
          UNION
          SELECT sender_id FROM connections WHERE receiver_id = $1
        )
      `;
      params.push(userId);
    }
    
    query += ` LIMIT 100`;
    
    const { rows: users } = await pool.query(query, params);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// All clubs
app.get("/api/clubs", async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clubs');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Join Club
app.post("/api/user/:id/clubs", async (req, res) => {
  const userId = req.params.id;
  const { clubId } = req.body;
  try {
    await pool.query('INSERT INTO club_members (user_id, club_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, clubId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Join Club
app.post("/api/user/:id/clubs", async (req, res) => {
  const userId = req.params.id;
  const { clubName } = req.body;
  try {
    const clubRes = await pool.query('SELECT id FROM clubs WHERE name = $1', [clubName]);
    if (clubRes.rows.length === 0) return res.status(404).json({ error: "Club not found" });
    const clubId = clubRes.rows[0].id;
    await pool.query('INSERT INTO club_members (user_id, club_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, clubId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Leave Club
app.delete("/api/user/:id/clubs/:clubName", async (req, res) => {
  const { id, clubName } = req.params;
  try {
    const clubRes = await pool.query('SELECT id FROM clubs WHERE name = $1', [clubName]);
    if (clubRes.rows.length > 0) {
       await pool.query('DELETE FROM club_members WHERE user_id = $1 AND club_id = $2', [id, clubRes.rows[0].id]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM events');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Register for an event
app.post("/api/events/:eventId/register", async (req, res) => {
  const { userId } = req.body;
  try {
    await pool.query('INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.params.eventId, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Request to join project
app.post("/api/projects/:id/requests", async (req, res) => {
  const projectId = req.params.id;
  const { userId, role, comment } = req.body;
  try {
    await pool.query('INSERT INTO project_requests (project_id, user_id, role, comment) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [projectId, userId, role, comment]);
    res.json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Accept request
app.post("/api/projects/:id/requests/:requestId/accept", async (req, res) => {
  const { id, requestId } = req.params;
  try {
     await pool.query('UPDATE project_requests SET status = $1 WHERE id = $2 AND project_id = $3', ['accepted', requestId, id]);
     res.json({ success: true });
  } catch(err) {
      res.status(500).json({});
  }
});


// Add Skill
app.post("/api/user/:id/skills", async (req, res) => {
  const userId = req.params.id;
  const { name, level, category } = req.body;
  try {
    // Capitalize the level to match check constraints (Beginner, Intermediate, Advanced)
    const formattedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase() : 'Beginner';
    await pool.query('INSERT INTO skills (user_id, name, level, category) VALUES ($1, $2, $3, $4)', [userId, name, formattedLevel, category]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete Skill
app.delete("/api/user/:id/skills/:skillName", async (req, res) => {
  const userId = req.params.id;
  const skillName = req.params.skillName;
  try {
    await pool.query('DELETE FROM skills WHERE user_id = $1 AND name = $2', [userId, skillName]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update Profile
app.put("/api/user/:id/profile", async (req, res) => {
  const userId = req.params.id;
  const { name, title } = req.body;
  try {
    await pool.query('UPDATE users SET name = $1, title = $2 WHERE id = $3', [name, title, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update Socials
app.put("/api/user/:id/socials", async (req, res) => {
  const userId = req.params.id;
  const { platform, connected } = req.body; // platform: 'github' or 'linkedin'
  try {
    if (platform === 'github') {
      await pool.query('UPDATE users SET github_connected = $1 WHERE id = $2', [connected, userId]);
    } else if (platform === 'linkedin') {
      await pool.query('UPDATE users SET linkedin_connected = $1 WHERE id = $2', [connected, userId]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add Project
app.post("/api/projects", async (req, res) => {
  const { owner_id, title, description, tags, github_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO projects (title, description, skills, user_id, github_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [title, description, tags, owner_id, github_url || null]
    );
    res.json({ success: true, projectId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get Projects
app.get("/api/projects", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, (SELECT name FROM users WHERE id = p.user_id) as owner_name 
      FROM projects p
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all project requests
app.get("/api/projects/all-requests", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT pr.id, pr.project_id, pr.github_link as github, pr.contribution as comment, pr.skills, u.name as applicant_name
      FROM project_requests pr
      JOIN users u ON pr.applicant_id = u.id
      WHERE pr.status = 'pending'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});


// Skill enhancement endpoint
app.post("/ai/skills", async (req, res) => {
  try {
    const { skills } = req.body;

    if (!genAI || !skills || skills.length === 0) {
      return res.json({
        success: true,
        suggestions: `Mock suggestions because GEMINI_API_KEY not set or skills empty. Skills: ${(skills || []).map(s => s.name + "(" + s.level + ")").join(", ")}`
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
    // Fallback to mock on fetch failure to prevent breaking UI
    const { skills } = req.body;
    res.json({ 
      success: true, 
      suggestions: `Fetch failed, providing fallback mock suggestions. Explore advancing your core coding skills! Skills provided: ${(skills || []).map(s => s.name).join(", ")}` 
    });
  }
});

// Network API Endpoints

// Get Connection Requests
app.get("/api/network/requests/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // Incoming requests (where this user is the receiver)
    const incomingRes = await pool.query(`
      SELECT c.id as connection_id, u.id as user_id, u.name, u.department, u.role, u.year, c.status
      FROM connections c
      JOIN users u ON c.sender_id = u.id
      WHERE c.receiver_id = $1 AND c.status = 'pending'
    `, [userId]);

    // Sent requests (where this user is the sender)
    const sentRes = await pool.query(`
      SELECT c.id as connection_id, u.id as user_id, u.name, u.department, u.role, u.year, c.status
      FROM connections c
      JOIN users u ON c.receiver_id = u.id
      WHERE c.sender_id = $1 AND c.status = 'pending'
    `, [userId]);

    res.json({ success: true, incoming: incomingRes.rows, sent: sentRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Send Mentorship Request
app.post("/api/network/mentorship-request", async (req, res) => {
  const { student_id, mentor_id } = req.body;
  try {
    if (student_id === mentor_id) return res.status(400).json({ error: "Cannot mentor yourself" });
    const existing = await pool.query('SELECT * FROM mentorship_requests WHERE student_id = $1 AND mentor_id = $2', [student_id, mentor_id]);
    if (existing.rows.length === 0) {
      await pool.query('INSERT INTO mentorship_requests (student_id, mentor_id, status) VALUES ($1, $2, $3)', [student_id, mentor_id, 'pending']);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Fetch Available Mentors
app.get("/api/network/mentors", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.title, u.department, 
      (SELECT string_agg(s.name, ',') FROM skills s WHERE s.user_id = u.id) as skills
      FROM users u
      WHERE u.role = 'faculty'
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Send Connection Request
app.post("/api/network/connect", async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  try {
    if (sender_id === receiver_id) {
       return res.status(400).json({ error: "Cannot connect to yourself" });
    }
    await pool.query(
      'INSERT INTO connections (sender_id, receiver_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [sender_id, receiver_id, 'pending']
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Accept/Reject Connection Request
app.put("/api/network/requests/:connectionId", async (req, res) => {
  const connectionId = req.params.connectionId;
  const { action } = req.body; // 'accepted' or 'rejected'
  try {
    if (action !== 'accepted' && action !== 'rejected') return res.status(400).json({});
    await pool.query('UPDATE connections SET status = $1 WHERE id = $2', [action, connectionId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get Trending Skills across network
app.get("/api/network/trending-skills", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT LOWER(name) as skill_name, COUNT(*) as count
      FROM skills
      GROUP BY LOWER(name)
      ORDER BY count DESC
      LIMIT 10
    `);
    res.json({ success: true, trending: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


// Get Network Dropdowns
app.get("/api/network/departments", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT DISTINCT department FROM users WHERE department IS NOT NULL AND department != '' ORDER BY department");
    res.json(rows.map(r => r.department));
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/network/skills", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT DISTINCT name FROM skills WHERE name IS NOT NULL AND name != '' ORDER BY name");
    res.json(rows.map(r => r.name));
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/clubs", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM clubs ORDER BY name");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get Event Stats
app.get("/api/events/stats", async (req, res) => {
  try {
    const totalEvents = await pool.query("SELECT COUNT(*) FROM events");
    const upcomingEvents = await pool.query("SELECT COUNT(*) FROM events WHERE event_date >= CURRENT_DATE");
    const totalRegs = await pool.query("SELECT COUNT(*) FROM event_registrations");
    
    // Calculate a dynamic attendance stat (avg regs per event)
    let avg = 0;
    if (parseInt(totalEvents.rows[0].count) > 0) {
      avg = Math.round((parseInt(totalRegs.rows[0].count) / parseInt(totalEvents.rows[0].count)) * 100);
      avg = avg > 100 ? 100 : avg; // cap at 100% theoretically
    }
    
    res.json({
        total: totalEvents.rows[0].count,
        upcoming: upcomingEvents.rows[0].count,
        attendance: avg > 0 ? avg + '%' : 'N/A'
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Get Events
app.get("/api/events", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM events");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- FACULTY SPECIFIC ENDPOINTS ---

app.get("/api/faculty/:id/projects", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.title, p.description, p.skills, u.name as owner_name, u.department 
      FROM projects p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.id DESC LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/faculty/:id/requests", async (req, res) => {
  const mentorId = req.params.id;
  try {
    const { rows: mentorships } = await pool.query(`
      SELECT m.id as request_id, 'mentorship' as type, u.name, u.department, u.year, m.message, m.status, m.student_id as sender_id
      FROM mentorship_requests m
      JOIN users u ON m.student_id = u.id
      WHERE m.mentor_id = $1 AND m.status = 'pending'
    `, [mentorId]);
    
    const { rows: connections } = await pool.query(`
        SELECT c.id as request_id, 'connection' as type, u.name, u.department, u.year, 'Wants to connect' as message, c.status, c.sender_id
        FROM connections c
        JOIN users u ON c.sender_id = u.id
        WHERE c.receiver_id = $1 AND c.status = 'pending'
    `, [mentorId]);

    res.json([...mentorships, ...connections]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/faculty/requests/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  const { action } = req.body;
  try {
    if (type === 'mentorship') {
        await pool.query('UPDATE mentorship_requests SET status = $1 WHERE id = $2', [action, id]);
    } else if (type === 'connection') {
        await pool.query('UPDATE connections SET status = $1 WHERE id = $2', [action, id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/suggestions", async (req, res) => {
  const role = req.query.role || 'student';
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.name, u.title, u.role, u.department, 
      (SELECT string_agg(s.name, ',') FROM skills s WHERE s.user_id = u.id) as skills
      FROM users u
      WHERE u.role = $1
      ORDER BY RANDOM() LIMIT 2
    `, [role]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
