const { getEmbeddings, getCodeExplanation } = require('../services/llmService');
const { queryVectors } = require('../services/vectorService');

const searchCode = async (req, res) => {
  const { query, project } = req.body; // ✅ ADDED

  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Search query cannot be empty.' });
  }

  try {
    const queryEmbedding = (await getEmbeddings(query))[0];

    const matches = await queryVectors(queryEmbedding, 5, project); // ✅ UPDATED

    if (matches.length === 0) {
      return res.status(200).json({
        explanation: "No relevant code found.",
        retrievedSnippets: []
      });
    }

    const relevantSnippets = matches.map(match => {
      const payload = match.payload;

      return {
        codeLanguage: payload.codeLanguage,
        snippetText: payload.snippetText,
        filename: payload.filename,
        score: match.score,
      };
    });

    const explanation = await getCodeExplanation(query, relevantSnippets);

    res.status(200).json({
      explanation,
      retrievedSnippets: relevantSnippets.map(s => ({
        filename: s.filename,
        codeLanguage: s.codeLanguage,
        text_snippet_preview: s.snippetText.substring(0, 150) + '...',
        full_text: s.snippetText,
        score: s.score,
      }))
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during code search.', error: error.message });
  }
};

module.exports = { searchCode };