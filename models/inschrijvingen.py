from flask import jsonify
from models.database_connect import Database

class Inschrijvingen:
    @staticmethod
    def getInschrijvingen(id):
        try:
            query = '''SELECT * FROM onderzoeken WHERE onderzoek_id = ?;'''
            return Database.runQuery(query, (id,))
        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500
