from flask import Flask, send_from_directory
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

# Load settings from the .env file
load_dotenv()

app = Flask(__name__)


app.config["MONGO_URI"] = os.environ.get("DB_CONNECTION_STRING")

# Initialize MongoDB
mongo = PyMongo(app)

# Import routes after the Flask app is created
from . import routes
