from pathlib import Path

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from loguru import logger

from app.config import get_settings
from app.rag.embeddings import get_embeddings

settings = get_settings()


class VectorStoreManager:
    def __init__(self) -> None:
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        self.embeddings = get_embeddings()

    def _build_documents(self, text: str, metadata: dict) -> list[Document]:
        chunks = self.splitter.split_text(text)
        return [Document(page_content=chunk, metadata={**metadata, "chunk": i}) for i, chunk in enumerate(chunks)]

    def create_index(self, text: str, index_path: Path, metadata: dict | None = None) -> str:
        metadata = metadata or {}
        docs = self._build_documents(text, metadata)
        if not docs:
            raise ValueError("No content to index")
        vectorstore = FAISS.from_documents(docs, self.embeddings)
        index_path.mkdir(parents=True, exist_ok=True)
        vectorstore.save_local(str(index_path))
        logger.info(f"FAISS index saved to {index_path}")
        return str(index_path)

    def load_index(self, index_path: str | Path) -> FAISS:
        path = Path(index_path)
        if not path.exists():
            raise FileNotFoundError(f"Vector index not found: {index_path}")
        return FAISS.load_local(
            str(path),
            self.embeddings,
            allow_dangerous_deserialization=True,
        )

    def merge_indexes(self, paths: list[str], output_path: Path) -> str:
        stores = [self.load_index(p) for p in paths if Path(p).exists()]
        if not stores:
            raise ValueError("No vector stores to merge")
        merged = stores[0]
        for store in stores[1:]:
            merged.merge_from(store)
        output_path.mkdir(parents=True, exist_ok=True)
        merged.save_local(str(output_path))
        return str(output_path)


vectorstore_manager = VectorStoreManager()
