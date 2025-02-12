import sqlite3
from flask import jsonify


class Database:
    @staticmethod
    def runQuery(query, params=()):
        try:
            with sqlite3.connect('database/database_v2.db') as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                result = cursor.fetchall()

                if result:
                    return jsonify(result)
                else:
                    return jsonify({"error": "No data found"})
        except sqlite3.Error as e:
            print("SQLite error:", e)
            return jsonify({"error": "Something went wrong"}), 500


class RawDatabase(Database):
    @staticmethod
    def runRawQuery(query, params=()):
        try:
            with sqlite3.connect('database/database_v2.db') as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(query, params)
                result = cursor.fetchall()
                if result:
                    return result
                else:
                    return None
        except sqlite3.Error as e:
            print("SQLite error:", e)
            return None

    @staticmethod
    def runInsertQuery(query, params=()):
        try:
            with sqlite3.connect('database/database_v2.db') as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                conn.commit()
                return cursor.lastrowid
        except sqlite3.Error as e:
            print("SQLite error:", e)
            return None
            return jsonify({"error": "Something went wrong"})
