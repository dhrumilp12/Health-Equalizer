from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv

import os

# Load settings from the .env file
load_dotenv()

app = Flask(__name__)
app.config["MONGO_URI"] = os.environ.get("DB_CONNECTION_STRING")

mongo = PyMongo(app)

from app import routes