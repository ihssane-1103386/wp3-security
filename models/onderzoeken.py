from flask import jsonify
from models.database_connect import Database

class onderzoeken:
    @staticmethod
    def getInschrijvingen():
        try:
            query = '''SELECT * FROM onderzoeken WHERE status = 1;'''
            return Database.runQuery(query, ())
        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500
