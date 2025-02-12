from flask import jsonify
from models.database_connect import Database

class onderzoeken:
    @staticmethod
    def getOnderzoeken():
        try:
            query = '''SELECT * FROM onderzoeken WHERE status = 0;'''
            return Database.runQuery(query, ()), 200
        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500
