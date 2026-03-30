import os
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
print("DEBUG MONGO_URI:", MONGO_URI)

if not MONGO_URI:
    raise ValueError("MONGODB_URI not found in environment variables")

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000
)

db = client["selfheal_iot"]
event_logs_collection = db["event_logs"]

users_collection = db["users"]
event_logs_collection = db["event_logs"]

users_collection.create_index("email", unique=True)
event_logs_collection.create_index("user_id")