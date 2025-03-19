from database.database_connection import DatabaseConnection
from models.database_connect import RawDatabase
from flask import jsonify, session
from flask_session import Session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import secrets


class DatabaseQueries:

    @staticmethod
    def authenticate_user(email, wachtwoord):
        sql_query = """
                SELECT ervaringsdeskundige_id, wachtwoord FROM ervaringsdeskundigen WHERE email = ?
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
                    session["user_id"] = user["ervaringsdeskundige_id"]
                    return True
                return False
        except sqlite3.Error as e:
            print(f"Database error: {e}")
            return None

    @staticmethod
    def run_query(query, params=(), fetch_one=False, fetch_all=False):
        conn = DatabaseConnection.get_connection()
        if conn is None:
            return jsonify({"error": "Database niet bereikbaar"}), 500

        try:
            cursor = conn.cursor()
            cursor.execute(query, params)

            if fetch_one:
                result = cursor.fetchone()
                conn.close()
                return result
            elif fetch_all:
                result = cursor.fetchall()
                conn.close()
                return result
            else:
                conn.commit()
                conn.close()
                return None

        except sqlite3.Error as e:
            print(f"SQLite error: {e}")
            return jsonify({"error": "Databasefout"}), 500

    @staticmethod
    def get_disability(query):
        sql_query = "SELECT beperking FROM beperkingen WHERE beperking LIKE ?"
        resultaten = DatabaseQueries.run_query(sql_query, ('%' + query + '%',), fetch_all=True)

        if resultaten is None:
            return jsonify({"error": "Geen beperkingen gevonden"}), 404

        beperkingen = [rij[0] for rij in resultaten]

        return jsonify(beperkingen)

    @staticmethod
    def add_expert(voornaam, tussenvoegsel, achternaam, geboortedatum, email, geslacht, telefoonnummer, wachtwoord):
        conn = DatabaseConnection.get_connection()
        if conn is None:
            return None

        try:
            with conn:
                cursor = conn.cursor()

                cursor.execute("SELECT 1 FROM ervaringsdeskundigen WHERE email = ?", (email,))
                if cursor.fetchone():
                    print(f"FOUT: E-mailadres {email} bestaat al in de database.")  # Debugging
                    return None

                hashed_password = generate_password_hash(wachtwoord)

                sql_query = """
                    INSERT INTO ervaringsdeskundigen 
                    (voornaam, tussenvoegsel, achternaam, geboortedatum, email, geslacht, telefoonnummer, wachtwoord)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """
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
        except sqlite3.Error:
            return False

    @staticmethod
    def authenticate_worker(email, wachtwoord):
        query = """
            SELECT medewerkers.id, medewerkers.wachtwoord_hash, rollen.naam AS rol 
            FROM medewerkers 
            JOIN rollen ON medewerkers.rol_id = rollen.id
            WHERE medewerkers.email = ?;
        """
        medewerker = DatabaseQueries.run_query(query, (email,), fetch_one=True)

        if not medewerker:
            return None
        
        session["user_id"] = medewerker["id"]
        wachtwoord_hash = medewerker["wachtwoord_hash"]
        if check_password_hash(wachtwoord_hash, wachtwoord):
            return {"id": medewerker["id"], "rol": medewerker["rol"]}
        return None

    @staticmethod
    def add_worker(voornaam, achternaam, email, wachtwoord, rol_naam):
        rol_query = "SELECT id FROM rollen WHERE naam = ?;"
        rol_result = DatabaseQueries.run_query(rol_query, (rol_naam,), fetch_one=True)

        if not rol_result:
            return None

        rol_id = rol_result["id"]
        wachtwoord_hash = generate_password_hash(wachtwoord)

        query = """
            INSERT INTO medewerkers (voornaam, achternaam, email, wachtwoord_hash, rol_id)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id;
        """
        return DatabaseQueries.run_query(query, (voornaam, achternaam, email, wachtwoord_hash, rol_id), fetch_one=True)

    @staticmethod
    def get_user_role(email):
        query = """
            SELECT r.naam AS rol
            FROM medewerkers m
            JOIN rollen r ON m.rol_id = r.id
            WHERE m.email = ?;
            """
        result = DatabaseQueries.run_query(query, (email,), fetch_one=True)

        return result["rol"] if result else None


    @staticmethod
    def register_organisatie(data):
        try:
            conn = DatabaseConnection.get_connection()
            if conn is None:
                raise Exception("Kan geen verbinding maken met de database")

            cursor = conn.cursor()

            api_key = secrets.token_urlsafe(32)

            query = """
            INSERT INTO organisaties (naam, email, telefoonnummer, contactpersoon, beschrijving, website, adres, api_key)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """

            cursor.execute(query, (
                data['naam'],
                data['email'],
                data['telefoonnummer'],
                data['contactpersoon'],
                data['beschrijving'],
                data['website'],
                data['adres'],
                api_key
            ))

            conn.commit()
            cursor.close()
            conn.close()

            return api_key

        except sqlite3.Error as e:
            print(f"SQLite fout: {e}")
            raise Exception(f"Database fout: {e}")

    @staticmethod
    def get_organisaties_zonder_api_key():
        query = """
                SELECT organisatie_id
                FROM organisaties
                WHERE api_key IS NULL OR api_key = ''
            """
        return DatabaseQueries.run_query(query, fetch_all=True)

    @staticmethod
    def update_onderzoek(organisatie_id, onderzoek_id, update_data):
        fields_to_update = []
        params = []

        # Mapping van toegestane velden
        allowed_fields = [
            "beschrijving", "plaats", "max_deelnemers", "datum", "datum_tot",
            "beloning", "min_leeftijd", "max_leeftijd", "begeleider"
        ]

        for field in allowed_fields:
            if field in update_data:
                fields_to_update.append(f"{field} = ?")
                params.append(update_data[field])

        if not fields_to_update:
            return False  # Niks te updaten

        query = f"""
            UPDATE onderzoeken
            SET {", ".join(fields_to_update)}
            WHERE organisatie_id = ? AND onderzoek_id = ?
        """

        params.extend([organisatie_id, onderzoek_id])

        return DatabaseQueries.run_query(query, tuple(params))

    @staticmethod
    def get_organisatie_id_by_api_key(api_key):
        query = """
            SELECT organisatie_id FROM organisaties WHERE api_key = ?
        """
        return DatabaseQueries.run_query(query, (api_key,), fetch_one=True)

    def get_expert_id_by_email(email):
        query = ("""SELECT ervaringsdeskundige_id
                 FROM ervaringsdeskundigen 
                 WHERE email = ?""")
        result = RawDatabase.runRawQuery(query, (email,))
        row = next(iter(result), None)
        return row["ervaringsdeskundige_id"] if row else None
    
    @staticmethod
    def get_user_beperkingen(user):
        query = """
            SELECT beperkingen.beperkingen_id,
                    beperkingen.beperking
                FROM ervaringsdeskundigen
                    LEFT JOIN beperkingen_ervaringsdeskundigen ON beperkingen_ervaringsdeskundigen.ervaringsdeskundige_id = ervaringsdeskundigen.ervaringsdeskundige_id
                    LEFT JOIN beperkingen ON beperkingen.beperkingen_id = beperkingen_ervaringsdeskundigen.beperkingen_id
                WHERE ervaringsdeskundigen.email = ?
        """
        results = DatabaseQueries.run_query(query, (user,), fetch_all=True)

        if results:
            results_dict = [dict(row) for row in results]
            return results_dict
        else:
            return []

    @staticmethod
    def get_onderzoeken_by_organisatie(organisatie_id):
        query = """
               SELECT onderzoek_id, 
               organisatie_id, 
               status, beschikbaar, 
               type_onderzoek_id,
               titel, 
               beschrijving, 
               plaats, 
               max_deelnemers, 
               min_leeftijd, 
               max_leeftijd,
               begeleider, 
               datum, 
               datum_tot, 
               beloning, 
               creatie_datum
               FROM onderzoeken
               WHERE organisatie_id = ?
           """
        result = RawDatabase.runRawQuery(query, (organisatie_id,))
        return [dict(row) for row in result]