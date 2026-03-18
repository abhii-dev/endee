const express = require('express');
const multer = require('multer');

const codeController = require('../controllers/codeController');
const searchController = require('../controllers/searchController');

const router = express.Router();
const upload = multer(); // No disk storage needed, we'll use buffer

// Code Ingestion Routes
router.post('/code/upload', upload.single('file'), codeController.uploadCode); // For file uploads
router.post('/code/ingest-text', codeController.uploadCode); // For direct text input
router.get('/code', codeController.getCodeSnippets);

// Search Route
router.post('/code/search', searchController.searchCode);

module.exports = router;