const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function aiReply(text) {
  const chat = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: text }],
  });
  return chat.choices[0].message.content;
}

module.exports = { aiReply }
// Owner: 03259635286 - AJ bot
