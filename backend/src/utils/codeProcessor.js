const CHUNK_SIZE = 200; // Approximate characters for chunks
const OVERLAP_SIZE = 50; // Character overlap

function chunkCode(codeText, chunkSize = CHUNK_SIZE, overlap = OVERLAP_SIZE) {
  const chunks = [];
  let start = 0;

  while (start < codeText.length) {
    const end = Math.min(start + chunkSize, codeText.length);
    let chunk = codeText.substring(start, end);

    // Try to break at a newline or space if possible to avoid cutting words/lines
    if (end < codeText.length && codeText[end] !== '\n' && codeText[end] !== ' ') {
      let lastNewline = chunk.lastIndexOf('\n');
      let lastSpace = chunk.lastIndexOf(' ');
      let splitPoint = Math.max(lastNewline, lastSpace);

      if (splitPoint > chunkSize * 0.7) { // Only adjust if the split point is within a reasonable range of the end
          chunk = codeText.substring(start, start + splitPoint + 1);
      }
    }
    chunks.push(chunk.trim());
    const step = chunk.length - overlap;

        if (step <= 0) {
        break;
        }

        start += step;
    if (start >= codeText.length) break; // Ensure loop terminates
  }
  return chunks.filter(c => c.length > 0);
}

// Simple language detection based on file extension
function detectLanguage(filename) {
  if (!filename) return 'text';
  const ext = filename.split('.').pop().toLowerCase();
  if (ext === 'py') return 'python';
  if (ext === 'js' || ext === 'jsx' || ext === 'ts' || ext === 'tsx') return 'javascript';
  return 'text'; // Default for unknown extensions or direct text
}


module.exports = { chunkCode, detectLanguage };