from flask import jsonify
from models.database_connect import Database

class Registraties:
    @staticmethod
    def getRegistraties():
        try:
            query = """ SELECT ervaringsdeskundige_id, voornaam, tussenvoegsel, achternaam, email FROM ervaringsdeskundigen;"""
            result = Database.runQuery(query, ())

            return jsonify(result), 200
        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500
