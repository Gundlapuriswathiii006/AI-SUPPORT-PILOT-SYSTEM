import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", 8000))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model.pkl")
VECTORIZER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vectorizer.pkl")
