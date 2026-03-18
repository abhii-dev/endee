const CodeSnippet = require('../models/CodeSnippet');
const { chunkCode, detectLanguage } = require('../utils/codeProcessor');
const { getEmbeddings } = require('../services/llmService');
const { upsertVectors } = require('../services/vectorService');

// 🔥 helper: batch embeddings safely
const getEmbeddingsInBatches = async (chunks, batchSize = 2) => {
  const allEmbeddings = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    console.log(`🔥 Processing batch ${i / batchSize + 1}`);

    const batchEmbeddings = await getEmbeddings(batch);

    allEmbeddings.push(...batchEmbeddings);

    await new Promise(res => setTimeout(res, 500));
  }

  return allEmbeddings;
};

const uploadCode = async (req, res) => {
  const { codeText, fileName, codeLanguage: specifiedLanguage, project } = req.body; // ✅ ADDED

  let fileBuffer = req.file
    ? req.file.buffer.toString('utf8')
    : codeText;

  let originalName = req.file
    ? req.file.originalname
    : (fileName || 'direct_input');

  let language = specifiedLanguage || detectLanguage(originalName);

  if (!fileBuffer || fileBuffer.trim() === '') {
    return res.status(400).json({ message: 'No code content provided.' });
  }

  try {
    let chunks = chunkCode(fileBuffer);

    if (chunks.length > 10) {
      chunks = chunks.slice(0, 10);
    }

    if (chunks.length === 0) {
      return res.status(400).json({ message: 'Could not chunk code content.' });
    }

    console.log("🔥 Total chunks:", chunks.length);

    const embeddings = await getEmbeddingsInBatches(chunks);

    console.log("🔥 Embedding length:", embeddings[0].length);

    const savedSnippets = [];
    const vectorsData = [];

    for (let i = 0; i < chunks.length; i++) {
      const uniqueVectorId = `${originalName}_chunk_${Date.now()}_${i}`;

      const newSnippet = new CodeSnippet({
        filename: req.file ? originalName : undefined,
        originalName: originalName,
        codeLanguage: language,
        snippetText: chunks[i],
        endeeVectorId: uniqueVectorId,
        project: project || "default", // ✅ ADDED
      });

      await newSnippet.save();
      savedSnippets.push(newSnippet);

      vectorsData.push({
        id: uniqueVectorId,
        values: embeddings[i],
        metadata: {
          mongo_id: newSnippet._id.toString(),
          filename: originalName,
          codeLanguage: language,
          snippetText: chunks[i],
          chunk_index: i,
          project: project || "default" // ✅ ADDED
        }
      });
    }

    console.log("🔥 Sending to Qdrant:", vectorsData.length);

    await upsertVectors(vectorsData);

    res.status(200).json({
      message: `${savedSnippets.length} code snippets from "${originalName}" stored.`,
      snippets: savedSnippets.map(s => s._id),
      chunkCount: savedSnippets.length
    });

  } catch (error) {
    console.error('Error during code upload and processing:', error);

    res.status(500).json({
      message: 'Server error during code processing.',
      error: error.message
    });
  }
};

const getCodeSnippets = async (req, res) => {
  try {
    const snippets = await CodeSnippet.find().sort({ uploadDate: -1 });
    res.status(200).json(snippets);
  } catch (error) {
    console.error('Error fetching code snippets:', error);

    res.status(500).json({
      message: 'Server error fetching code snippets.',
      error: error.message
    });
  }
};

module.exports = { uploadCode, getCodeSnippets };