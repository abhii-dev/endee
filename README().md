# 🚀 AI Code Search & Explanation System

An AI-powered system that enables users to upload code files, perform semantic search, and receive intelligent explanations using Large Language Models (LLMs).

---

## 🔥 Features

- 📂 Upload code files (JavaScript, Python, etc.)
- ✂️ Automatic code chunking
- 🧠 Embedding generation using Mistral AI
- 🔍 Semantic code search (RAG)
- 💬 AI-generated explanations
- 🎯 Project-based filtering
- 🎨 Clean, modern UI (ChatGPT-inspired UX)
- 📎 Multi-file upload support

---

## 🧠 How It Works

1. User uploads a code file  
2. Code is split into smaller chunks  
3. Each chunk is converted into vector embeddings  
4. Embeddings are stored in a vector database  
5. On search:
   - Query is embedded
   - Relevant code chunks are retrieved
   - LLM generates a contextual explanation

---

## 🏗️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mistral AI (Embeddings + LLM)

### Frontend
- React.js
- Tailwind CSS

### Vector Database
- Endee (primary design)
- Qdrant (fallback for stable execution)

---

## 📁 Project Structure


backend/
├── controllers/
├── services/
├── models/
├── routes/

frontend/
├── src/



---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO


2️⃣ Install Dependencies
Backend

cd backend
npm install

Frontend

cd frontend
npm install

3️⃣ Environment Variables

MONGODB_URI=your_mongodb_connection_string
MISTRAL_API_KEY=your_mistral_api_key
ENDEE_URL=http://localhost:8080

4️⃣ Start Backend

npx nodemon server.js

4️⃣ Start Backend

npm run dev