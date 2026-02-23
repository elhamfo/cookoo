## cookoo – Personalized RAG-Powered Recipe Advisor Chatbot

A modern, full-stack **personalized recipe advisor** chatbot that helps users discover, adapt, or create recipes based on ingredients they have, dietary preferences, time constraints, servings, and cooking style.

Powered by **Retrieval-Augmented Generation (RAG)** with local embeddings and LLM inference — built as a portfolio project to showcase applied AI engineering, RAG pipelines, and clean full-stack development.

https://github.com/elhamfo/cookoo

### Features

- **Semantic Recipe Search**  
  Uses sentence-transformers embeddings + FAISS for intelligent, context-aware retrieval over thousands of recipes

- **Retrieval-Augmented Generation (RAG)**  
  Combines retrieved recipes with user preferences to generate personalized, practical recipe suggestions

- **Conversational Chat Interface**  
  Message bubbles, loading states, auto-scroll, and natural back-and-forth interaction

- **Dietary & Constraint Filters**  
  Vegan, gluten-free, low-carb, quick meals, servings count, ingredient exclusions, etc.

- **Fully Local Inference Option**  
  No API keys required when using Ollama (Llama 3.2) — privacy-focused and offline-capable (dev only)

- **Clean, Responsive UI**  
  Modern design with Tailwind CSS v4, lucide-react icons, and smooth interactions

- **API Documentation**  
  Interactive Swagger/OpenAPI docs for the backend endpoints

### Tech Stack

**Backend**  
- Python 3.11+  
- FastAPI (API framework)  
- LangChain + langchain-ollama / langchain-openai  
- sentence-transformers (embeddings)  
- FAISS (vector store)  
- Ollama (local LLM – Llama 3.2 3B / 1B)

**Frontend**  
- React 18+ (Vite)  
- Tailwind CSS v4  
- lucide-react (icons)  
- Axios (API communication)

**Data**  
- Public recipe dataset (~13k recipes): https://github.com/josephrmartinez/recipe-dataset

**LLM Options**  
- Local: Ollama (Llama 3.2) – dev only  
- Cloud fallback: OpenRouter free tier (auto-routes to available open models)

### Quick Start (Local Development)

#### Prerequisites

- Python 3.11+  
- Node.js 18+  
- Ollama installed & running (for local LLM: download from ollama.com, run `ollama pull llama3.2`)

#### 1. Clone repo

bash
git clone https://github.com/elhamfo/cookoo.git
cd cookoo

#### 2. Backend setup
python -m venv venv
source venv/bin/activate    # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

#### 3. Prepare recipe data & vector index (run once)
python prepare_data.py

#### 4. Start backend
python app.py
#### → http://localhost:8000/docs (Swagger UI)

#### 5. In another terminal → Frontend
cd frontend
npm install
npm run dev
#### → http://localhost:5173

**Test the app locally:**  
- Open http://localhost:5173 in your browser  
- Ask for recipes based on ingredients, preferences, or constraints  
- Try dietary filters and local Ollama mode (if Ollama is running)  

### Why This Project?

As an AI engineer, I created this project to demonstrate:

- **RAG Pipeline**  
End-to-end retrieval + generation using local embeddings and FAISS

- **Local LLM Integration**  
Ollama for privacy-focused, offline-capable inference

- **Conversational AI UX**  
Clean chat interface with filters, state management, and responsive design

- **Full-Stack Production Skills**  
FastAPI API design, React/Vite frontend

- **Security & Best Practices**  
Input validation, no hardcoded secrets, proper CORS, free-tier cloud deployment

### Improvements in Progress

- Multi-turn memory & conversation history  
- Recipe image generation/visualization  
- User profiles & saved favorites  
-  Advanced personalization & ranking

### Contact

**Elham Fo**  
📧 elham.fo@gmail.com  

Open to collaborations, feedback, and discussions on applied AI engineering, RAG systems, conversational AI, and full-stack ML applications!
