# Recipe Advisor – Personalized RAG-powered Recipe Chatbot

A modern, full-stack **personalized recipe advisor** chatbot that helps users find or adapt recipes based on ingredients they have, dietary preferences, time constraints, and number of servings.

Built with **FastAPI** (backend) + **React + Tailwind CSS** (frontend) and powered by a **Retrieval-Augmented Generation (RAG)** pipeline using local embeddings and LLM inference.

https://github.com/elhamfo/cookoo

## ✨ Features

Semantic search over a recipe dataset using **sentence-transformers** embeddings + **FAISS**
Retrieval-Augmented Generation with **Llama 3.2** (via Ollama) model
Chat interface with message bubbles, loading state, and auto-scroll
Dietary filters & servings input (vegan, gluten-free, quick meals, etc.)
Fully local inference option (no API keys needed when using Ollama)
Clean, responsive UI with Tailwind CSS v4
Swagger/OpenAPI docs for the backend API

## 🏗️ Architecture
User → React Frontend (Vite) ↓ FastAPI Backend (localhost:8000) ↓ Query → HuggingFace Embeddings → FAISS Vector Store ↓ Top-k relevant recipes retrieved ↓ Augmented prompt → Llama 3.2 / OpenAI → Generated personalized recipe ↓ Response + sources → displayed in chat

## 🚀 Tech Stack

**Backend**
Python 3.11+
FastAPI
LangChain + langchain-ollama / langchain-openai
sentence-transformers (embeddings)
FAISS (vector store)
Ollama (local LLM – Llama 3.2 3B / 1B)

**Frontend**
React 18 (Vite)
Tailwind CSS v4
lucide-react (icons)

**Data**
Public recipe CSV dataset (https://github.com/josephrmartinez/recipe-dataset/blob/main/13k-recipes.csv)

## 📋 Quick Start (Local Development)

### Prerequisites

Python 3.11+ 
Node.js 18+
Ollama installed & running (for local LLM)
bash

# 1. Clone repo
git clone https://github.com/elhamfo/cookoo.git
cd recipe-advisor

# 2. Backend setup
python -m venv venv
source venv/bin/activate    # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# 3. Prepare recipe data & vector index (run once)
python prepare_data.py

# 4. Start backend
python app.py
# → http://localhost:8000/docs (Swagger UI)

# 5. In another terminal → Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173
