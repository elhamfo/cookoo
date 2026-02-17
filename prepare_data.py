# prepare_data.py
import os
from pathlib import Path

from langchain_community.document_loaders import CSVLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


DATA_PATH = Path("data/recipes.csv")   
INDEX_PATH = Path("faiss_index")

def main():
    if not DATA_PATH.is_file():
        print(f"Data file not found: {DATA_PATH}")
        return

    print("Loading documents...")
    loader = CSVLoader(file_path=str(DATA_PATH))
    raw_documents = loader.load()

    print("Splitting documents...")
    text_splitter = CharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separator="\n\n",          # better for recipes
        add_start_index=True
    )
    documents = text_splitter.split_documents(raw_documents)

    print(f"Created {len(documents)} chunks.")

    print("Creating embeddings...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"}  # change to "cuda" if you have GPU
    )

    print("Building FAISS index (this may take a minute)...")
    vectorstore = FAISS.from_documents(documents, embeddings) 

    print("Chroma index created and persisted")
    #print(f"Saving index to {INDEX_PATH}...")
    vectorstore.save_local(str(INDEX_PATH))

    print("Data preparation complete!")

if __name__ == "__main__":
    main()

