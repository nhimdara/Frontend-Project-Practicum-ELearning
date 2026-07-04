import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { system, messages, max_tokens } = req.body;

    console.log("Sending request to Groq API...");

    // Use currently available Groq models
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.ANTHROPIC_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Current working model
          messages: [{ role: "system", content: system }, ...messages],
          max_tokens: max_tokens || 1000,
          temperature: 0.7,
        }),
      },
    );

    const data = await response.json();
    console.log("Groq API Response Status:", response.status);

    // Check for errors
    if (!response.ok) {
      throw new Error(data.error?.message || `API error: ${response.status}`);
    }

    // Extract the response text safely
    let aiText = "I'm sorry, I couldn't generate a response.";
    if (data.choices && data.choices[0] && data.choices[0].message) {
      aiText = data.choices[0].message.content;
    }

    res.json({
      content: [{ type: "text", text: aiText }],
    });
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({
      content: [{ type: "text", text: `Error: ${err.message}` }],
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} with Groq`),
);
