from flask import jsonify
from models.database_connect import Database

class Registraties:
    @staticmethod
    def getRegistraties():
        try:
            query = """ SELECT ervaringsdeskundige_id, voornaam, tussenvoegsel, achternaam, email FROM ervaringsdeskundigen;"""
            result = Database.runQuery(query, ())

            # Maak een lijst van dictionaries
            registraties = [
                {
                    "id": row[0],
                    "naam": f"{row[1]} {row[2] + ' ' if row[2] else ''}{row[3]}",
                    "email": row[4]
                }
                for row in result
            ]

            return jsonify(result), 200
        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500

