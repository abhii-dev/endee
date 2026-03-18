const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({
  url: "http://localhost:6333",
});

const COLLECTION_NAME = "code_index";

async function ensureCollection() {
  try {
    await client.getCollection(COLLECTION_NAME);
  } catch {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 1024,
        distance: "Cosine",
      },
    });
  }
}

async function upsertVectors(vectorsData) {
  try {
    await ensureCollection();

    const points = vectorsData.map((v, i) => ({
      id: i + 1,
      vector: v.values.map(Number),
      payload: {
        mongo_id: v.metadata.mongo_id,
        filename: v.metadata.filename,
        codeLanguage: v.metadata.codeLanguage,
        snippetText: v.metadata.snippetText,
        chunk_index: v.metadata.chunk_index,
        project: v.metadata.project // ✅ ADDED
      },
    }));

    console.log("🔥 Sending points:", points[0]);

    await client.upsert(COLLECTION_NAME, {
      points,
    });

    console.log("🔥 Stored in Qdrant");
  } catch (error) {
    console.error("❌ FULL ERROR:", error.response?.data || error.message);
    throw new Error("Failed to upsert vectors");
  }
}

// ✅ UPDATED ONLY THIS FUNCTION
async function queryVectors(queryVector, topK = 5, project = null) {
  const result = await client.search(COLLECTION_NAME, {
    vector: queryVector,
    limit: topK,
    ...(project && {
      filter: {
        must: [
          {
            key: "project",
            match: { value: project }
          }
        ]
      }
    })
  });

  return result;
}

module.exports = { upsertVectors, queryVectors };