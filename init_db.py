from app.database import Base, engine
from app.models import Review

print("🛠️ Создание таблиц в базе данных...")
Base.metadata.create_all(bind=engine)
print("✅ Таблицы успешно созданы.")