const { Mistral } = require("@mistralai/mistralai");

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

// models
const EMBED_MODEL = "mistral-embed";
const CHAT_MODEL = "mistral-large-latest";


async function getEmbeddings(texts) {
  if (!Array.isArray(texts)) {
    texts = [texts];
  }

  try {
    console.log("🔥 BEFORE MISTRAL CALL");

    const response = await client.embeddings.create({
      model: "mistral-embed",
      inputs: texts,
    });

    console.log("🔥 AFTER MISTRAL CALL");

    return response.data.map(e => e.embedding);
  } catch (error) {
    console.error("❌ Mistral error:", error.response?.data || error.message);
    throw new Error("Failed to get embeddings");
  }
}

async function getCodeExplanation(query, codeSnippets) {
  const context = codeSnippets
    .map((s, i) => `Snippet ${i + 1}:\n${s.snippetText}`)
    .join("\n\n");

  const prompt = `
Answer the question based on code:

${context}

Question: ${query}
`;

  try {
    const response = await client.chat.complete({
      model: CHAT_MODEL,
      messages: [
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Mistral chat error:", error.response?.data || error.message);
    throw new Error("Failed to get LLM response");
  }
}

module.exports = { getEmbeddings, getCodeExplanation };