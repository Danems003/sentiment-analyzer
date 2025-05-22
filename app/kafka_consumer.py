from kafka import KafkaConsumer
import json
from sentiment_model import predict_sentiment


consumer = KafkaConsumer(
    "text",
    bootstrap_servers="kafka:9092",
    auto_offset_reset="earliest",
    group_id="sentiment-group",
    value_deserializer=lambda x: json.loads(x.decode("utf-8"))
)

def start_consumer():
    print("👂 Kafka consumer слушает...")
    for msg in consumer:
        text = msg.value.get("text")
        sentiment = predict_sentiment(text)
        print(f"📩 Текст: {text}")
        print(f"🎯 Предсказание: {sentiment}")