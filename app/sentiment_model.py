from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

MODEL_PATH = "./sentiment_model_itog"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

labels = ["Положительный", "Отрицательный", "Нейтральный"]

def predict_sentiment(text: str) -> str:
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        predicted_class = torch.argmax(outputs.logits, dim=1).item()
        label_map = {
    0: "Нейтральный",
    1: "Положительный",
    2: "Негативный"  # Не "Отрицательный"!
}
    return label_map[predicted_class]
