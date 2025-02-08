import sqlite3
from flask import jsonify

class Database:
    @staticmethod
    def runQuery(query):
        try:
            # Open connection to Database
            with sqlite3.connect('/database/database_v2.db') as conn:
                cursor = conn.cursor()
                cursor.execute(query)
                result = cursor.fetchall()

                # Return empty list with 404 status if no data is found
                return jsonify(result), 200 if result else jsonify([]), 404
        except sqlite3.Error as e:
            print("SQLite error:", e)
            return jsonify({"error": "Something went wrong"}), 500
