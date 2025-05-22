import json
from kafka import KafkaConsumer, KafkaProducer
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Загрузка токенизатора и модели
model_path = "sentiment_model_itog"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

# Настройка Kafka
consumer = KafkaConsumer(
    'text',
    bootstrap_servers='kafka:9092',
    auto_offset_reset='earliest',
    group_id='ml-group',
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    value_serializer=lambda m: json.dumps(m).encode('utf-8')
)

print("📡 ML-сервис запущен...")

for message in consumer:
    text = message.value.get("text", "")
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class_id = logits.argmax().item()

    # Преобразование индекса в метку
    label = model.config.id2label[predicted_class_id]

    result = {"sentiment": label}
    producer.send("result-topic", result)
    print(f"✅ Обработан текст: {text} → {label}")
