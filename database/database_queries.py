from database.database_connection import DatabaseConnection
from flask import jsonify

class DatabaseQueries:

    @staticmethod
    def run_query(query, params=()):
        conn = DatabaseConnection.get_connection()
        if conn is None:
            return jsonify({"error": "Database niet bereikbaar"}), 500

        try:
            cursor = conn.cursor()
            cursor.execute(query, params)
            result = cursor.fetchall()
            conn.close()

            if result:
                return jsonify([dict(row) for row in result]), 200
            else:
                return jsonify([]), 200

        except sqlite3.Error as e:
            print(f"SQLite error: {e}")
            return jsonify({"error": "Databasefout"}), 500

    @staticmethod
    def get_beperkingen(query):
        sql_query = "SELECT beperking FROM beperkingen WHERE beperking LIKE ?"
        return DatabaseQueries.run_query(sql_query, ('%' + query + '%',))
