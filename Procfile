web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
postgres: docker run --rm -e POSTGRES_DB=ads_stat -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
redis: docker run --rm -p 6379:6379 redis:7-alpine 