import sqlite3
import os

class DatabaseConnection:

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_PATH = os.path.join(BASE_DIR, "database_v2.db")

    @staticmethod
    def get_connection():

        try:
            conn = sqlite3.connect(DatabaseConnection.DB_PATH, check_same_thread=False)
            conn.row_factory = sqlite3.Row
            return conn
        except sqlite3.Error as e:
            print(f"SQLite fout: {e}")
            return None
