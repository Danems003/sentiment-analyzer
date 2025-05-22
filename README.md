"# sentiment-analyzer" 

Ссылка на модель: https://huggingface.co/Danems/sentiment-analyzer-model/tree/master

Инструкция по разворачиванию проекта в Docker Desktop:

1. Добавляете все файлы в любую пустую папку на рабочем столе.
2. Создаёте папку sentiment_model_itog в корне проекта и добавляете туда файлы модели, скачанные с Hugging Face.
3. Открываете PostgreSQL и создаете таблицу.
4. В файле Database.py изменяете строку DATABASE_URL = "postgresql://POSTGRES_USERNAME:POSTGRES_PASSWORD@db:5432/POSTGRES_DATABASE" 
Где:
POSTGRES_USERNAME="<username>"
POSTGRES_PASSWORD="<password>"
POSTGRES_DATABASE="<database_name>"
5. Запускаете Docker Desktop
6. Заходите через терминал в корневую папку проекта.
7. Прописываете в терминале команду "docker compose build" и дожидаетесь окончания сборки.
8. После сборки докер контейнера запускаете его с помощью команды "docker compose up".
9. Дожидаетесь запуска, и переходите в Docker Desktop, где открываете фронт в ручную, либо переходите в окне браузера на localhost:3000 
10. Всё. Вы развернули наш проект.

P.S 
После запуска сборки контейнера, может выдать ошибку... Вроде бы нужно будет просто докачать какую-то библиотеку, и снова запустить сборку контейнера. 😊 
