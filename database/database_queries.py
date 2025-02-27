import sqlite3

from database.database_connection import DatabaseConnection
from flask import jsonify
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash


class DatabaseQueries:

    @staticmethod
    def authenticate_user(email, wachtwoord):
        sql_query = """
                SELECT wachtwoord FROM ervaringsdeskundigen WHERE email = ?
            """
        conn = DatabaseConnection.get_connection()
        if conn is None:
            return None

        try:
            with conn:
                cursor = conn.cursor()
                cursor.execute(sql_query, (email,))
                user = cursor.fetchone()

                if user and check_password_hash(user["wachtwoord"], wachtwoord):
                    return True
                return False
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return None

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

    @staticmethod
    def add_expert(voornaam, tussenvoegsel, achternaam, geboortedatum, email, geslacht, telefoonnummer,
                                wachtwoord):
        hashed_password = generate_password_hash(wachtwoord)

        sql_query = """
                INSERT INTO ervaringsdeskundigen 
                (voornaam, tussenvoegsel, achternaam, geboortedatum, email, geslacht, telefoonnummer, wachtwoord)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """
        conn = DatabaseConnection.get_connection()
        if conn is None:
            return None

        try:
            with conn:
                cursor = conn.cursor()
                cursor.execute(sql_query, (
                voornaam, tussenvoegsel, achternaam, geboortedatum, email, geslacht, telefoonnummer, hashed_password))
                ervaringsdeskundige_id = cursor.lastrowid
                return ervaringsdeskundige_id
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return None

    @staticmethod
    def link_disability_to_expert(ervaringsdeskundige_id, beperking):
        conn = DatabaseConnection.get_connection()
        if conn is None:
            return False

        try:
            with conn:
                cursor = conn.cursor()

                cursor.execute("SELECT beperkingen_id FROM beperkingen WHERE beperking = ?", (beperking,))
                beperking_row = cursor.fetchone()

                if beperking_row:
                    beperking_id = beperking_row[0]
                else:
                    cursor.execute("INSERT INTO beperkingen (beperking) VALUES (?)", (beperking,))
                    beperking_id = cursor.lastrowid

                cursor.execute("""
                        SELECT * FROM beperkingen_ervaringsdeskundigen 
                        WHERE beperkingen_id = ? AND ervaringsdeskundige_id = ?
                    """, (beperking_id, ervaringsdeskundige_id))

                if cursor.fetchone() is None:
                    cursor.execute("""
                            INSERT INTO beperkingen_ervaringsdeskundigen (beperkingen_id, ervaringsdeskundige_id)
                            VALUES (?, ?)
                        """, (beperking_id, ervaringsdeskundige_id))

            return True
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return False
