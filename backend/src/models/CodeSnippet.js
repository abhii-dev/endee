const mongoose = require('mongoose');

const CodeSnippetSchema = new mongoose.Schema({
  filename: { // For uploaded files
    type: String,
    required: false, // Not required if direct text input
  },
  originalName: { // For uploaded files
    type: String,
    required: false,
  },
  codeLanguage: {
    type: String,
    required: true,
    enum: ['python', 'javascript', 'text'] // Define supported languages or 'text'
  },
  snippetText: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  endeeVectorId: { // Link to the vector in Endee
    type: String,
    required: true,
    unique: true,
  }
});

module.exports = mongoose.model('CodeSnippet', CodeSnippetSchema);