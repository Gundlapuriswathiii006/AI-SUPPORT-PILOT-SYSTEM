from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import classify, suggest, summarize, health

app = FastAPI(
    title="SupportPilot AI Service",
    description="AI micro-service for ticket classification, KB suggestion, and summarization",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(classify.router, prefix="/classify", tags=["Classify"])
app.include_router(suggest.router, prefix="/suggest", tags=["Suggest"])
app.include_router(summarize.router, prefix="/summarize", tags=["Summarize"])


@app.get("/")
def root():
    return {"service": "SupportPilot AI", "version": "1.0.0", "status": "running"}
