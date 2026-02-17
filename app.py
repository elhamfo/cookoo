# app.py
import os
from dotenv import load_dotenv
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
#from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from fastapi.middleware.cors import CORSMiddleware
#from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

load_dotenv()
app = FastAPI(title="Recipe Advisor RAG API")

app.add_middleware(
    CORSMiddleware, 
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials= True,
    allow_methods=["*"], #GET, POST, OPTIONs, etc. only for local development 
    allow_headers=["*"]  #never use * with allow_credentials=True
)
# ────────────────────────────────────────────────
# Load vector store & embeddings (done once at startup)
# ────────────────────────────────────────────────
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)

try:
    # FAISS
    vectorstore = FAISS.load_local(
        "faiss_index",
        embeddings,
        allow_dangerous_deserialization=True  # Required – only safe because you created this index
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})  # get top 4 → good balance
except Exception as e:
    raise RuntimeError(f"Failed to load FAISS index: {e}")

# ────────────────────────────────────────────────
# LLM & modern RAG chain
# ────────────────────────────────────────────────
"""
llm = ChatOpenAI(
    model="gpt-3.5-turbo",             
    temperature=0.4,
    max_tokens=800,
    api_key=os.getenv("OPENAI_API_KEY")
)

llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0.4,
    num_ctx=4096, #8192
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("Warning: GROQ_API_KEY not found in environment variables!")

llm = ChatGroq(
    model="llama-3.1-8b-instant", #"llama-3.3-70b-versatile",   # or "llama-3.1-8b-instant" for faster/cheaper
    groq_api_key=GROQ_API_KEY,
    temperature=0.4,
)
"""


llm = ChatOpenAI(
    model="openrouter/free",  # or other free models
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0.4,
    max_tokens=800,
)

# Modern compact prompt (you can make it much more detailed)
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful, precise cooking assistant.
Use only the provided recipe context below.
If nothing relevant is found, say: "Sorry, I don't have a matching recipe for those ingredients — try adding more details!"
Format suggestions nicely:
• Recipe title
• List of ingredients
• Step-by-step instructions (short & clear)
Be friendly and encouraging."""),
    ("human", "{question}\n\nRelevant recipes:\n{context}"),
])

# Modern LCEL chain (replaces RetrievalQA)
rag_chain = (
    {
        "context": retriever | (lambda docs: "\n\n".join(doc.page_content for doc in docs)),
        "question": RunnablePassthrough()
    }
    | prompt
    | llm
    | StrOutputParser()
)

# ────────────────────────────────────────────────
# API Models & Endpoints
# ────────────────────────────────────────────────
class QueryRequest(BaseModel):
    text: str

class QueryResponse(BaseModel):
    response: str
    sources: List[str] = [] 
    retrieved_count: int = 0

"""
@app.post("/query", response_model=QueryResponse)
async def query_recipe(request: QueryRequest) -> Dict[str, Any]:
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        answer = await rag_chain.ainvoke(request.text)
        return {
            "response": answer,
            "sources": [doc.metadata.get("source", "recipe") for doc in retriever.get_relevant_documents(request.text)[:3]]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
"""

@app.post("/query", response_model=QueryResponse)
async def query_recipe(request: QueryRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    try:
        print(f"[DEBUG] Received query: {request.text}")

        # Retrieve documents
        docs = await retriever.ainvoke(request.text)
        print(f"[DEBUG] Retrieved {len(docs)} documents")

        context_str = "\n\n".join(doc.page_content for doc in docs)

        # Run the RAG chain
        print("[DEBUG] Invoking rag_chain...")
        chain_result = await rag_chain.ainvoke(request.text)   # or {"question": request.text, "context": context_str}

        print(f"[DEBUG] Chain result type: {type(chain_result)}")
        print(f"[DEBUG] Chain result preview: {str(chain_result)[:200]}...")

        # Extract the actual answer string safely
        if isinstance(chain_result, str):
            answer = chain_result
        elif isinstance(chain_result, dict):
            # Common keys LangChain might return
            answer = (
                chain_result.get("text")
                or chain_result.get("answer")
                or chain_result.get("output")
                or str(chain_result)
            )
        else:
            answer = str(chain_result)

        # 3. Run the chain
        answer = answer.strip() or "No meaningful response generated."

        # 4. Optional: collect sources (titles, filenames, etc.)
         # Sources
        # sources_list = [
        #     doc.metadata.get("source", "Unknown recipe")
        #     for doc in docs
        # ]

        sources_list = []
        for doc in docs:
            source = doc.metadata.get("source", "Unknown")
            row = doc.metadata.get("row", None)
            title = doc.page_content.split("\n")[0][:60] if doc.page_content else ""  # first line as title preview
            sources_list.append(f"{source} (row {row}) – {title}..." if row else source)

        print("[DEBUG] Returning successful response")

        return QueryResponse(
            response=answer,
            sources=sources_list[:4],          # limit to avoid huge responses
            retrieved_count=len(docs)
        )

    except Exception as e:
        import traceback
        traceback.print_exc()               # prints full error to terminal
        raise HTTPException(
            status_code=500,
            detail=f"Processing error: {str(e)}"
        )
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True,)

