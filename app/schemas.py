from pydantic import BaseModel

class ReviewRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str
