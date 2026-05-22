import redis

redis_client = redis.Redis(
    host="localhost",
    port=6479,
    decode_responses=True
)
