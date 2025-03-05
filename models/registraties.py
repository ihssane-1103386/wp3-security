from flask import jsonify
from models.database_connect import RawDatabase
from database.database_connection import DatabaseConnection


class Registrations:
    @staticmethod
    def getRegistration(table_name):
        if table_name == "registraties":
            query = """ 
            SELECT ervaringsdeskundige_id, voornaam, tussenvoegsel, achternaam, email 
            FROM ervaringsdeskundigen WHERE status = 0;
            """
        elif table_name == "inschrijvingen":
            query = """
            SELECT  onderzoeken.titel AS onderzoek, 
                    (ervaringsdeskundigen.voornaam || ' ' || 
                    COALESCE(ervaringsdeskundigen.tussenvoegsel, '') || ' ' || 
                    ervaringsdeskundigen.achternaam) AS ervaringsdeskundige, 
                    inschrijvingen.datum, inschrijvingen.ervaringsdeskundige_id, inschrijvingen.onderzoek_id
            FROM inschrijvingen 
            INNER JOIN ervaringsdeskundigen ON inschrijvingen.ervaringsdeskundige_id = ervaringsdeskundigen.ervaringsdeskundige_id
            INNER JOIN onderzoeken ON inschrijvingen.onderzoek_id = onderzoeken.onderzoek_id
            WHERE inschrijvingen.status = 0;
            """
        elif table_name == "onderzoeksaanvragen":
            query = """
            SELECT onderzoek_id, titel, organisaties.naam AS organisatie, creatie_datum 
            FROM onderzoeken 
            INNER JOIN organisaties ON onderzoeken.organisatie_id = organisaties.organisatie_id
            WHERE onderzoeken.status = 0;"""
        # Gebruik om data op te halen
        else:
            return jsonify({"error": "Onbekende tabel"}), 400
        result =  RawDatabase.runRawQuery(query, ())
        if result:
            data = [dict(row) for row in result]
            return jsonify(data)
        else:
            return jsonify([])

    @staticmethod
    def getRegistrationDetails(table_name, id):
        if table_name == "registraties":
            query = """
            SELECT e.ervaringsdeskundige_id, e.voornaam, e.tussenvoegsel, e.achternaam, 
            e.geboortedatum, e.geslacht, e.email, e.telefoonnummer, 
            COALESCE(GROUP_CONCAT(b.beperking, ', '), 'Geen beperkingen') AS beperkingen 
            FROM ervaringsdeskundigen e
            LEFT JOIN beperkingen_ervaringsdeskundigen be ON e.ervaringsdeskundige_id = be.ervaringsdeskundige_id
            LEFT JOIN beperkingen b ON be.beperkingen_id = b.beperkingen_id
            WHERE e.ervaringsdeskundige_id = ?
            GROUP BY e.ervaringsdeskundige_id;
            """
            params=(id,)
        elif table_name == "inschrijvingen":
            try:
                ervaringsdeskundige_id, onderzoek_id = id.split('-')
            except Exception as e:
                return jsonify({"error": str(e)}), 400
            query = """
            SELECT  onderzoeken.titel AS onderzoek, 
                    (ervaringsdeskundigen.voornaam || ' ' ||
                    COALESCE(ervaringsdeskundigen.tussenvoegsel, '') || ' ' ||
                    ervaringsdeskundigen.achternaam) AS ervaringsdeskundige,
                    inschrijvingen.ervaringsdeskundige_id, inschrijvingen.onderzoek_id
            FROM inschrijvingen 
            INNER JOIN ervaringsdeskundigen ON inschrijvingen.ervaringsdeskundige_id = ervaringsdeskundigen.ervaringsdeskundige_id
            INNER JOIN onderzoeken ON inschrijvingen.onderzoek_id = onderzoeken.onderzoek_id
            WHERE inschrijvingen.onderzoek_id = ? AND inschrijvingen.ervaringsdeskundige_id = ?;"""
            params = (onderzoek_id, ervaringsdeskundige_id)
        elif table_name == "onderzoeksaanvragen":
            query = """
            SELECT titel, 
            onderzoeken.beschrijving, 
            organisaties.naam AS organisatie, 
            plaats, 
            max_deelnemers, 
            type_onderzoek, 
            datum, 
            datum_tot, 
            beloning,
            min_leeftijd,
            max_leeftijd,
            begeleider
            FROM onderzoeken 
            INNER JOIN organisaties ON onderzoeken.organisatie_id = organisaties.organisatie_id
            INNER JOIN onderzoek_type ON onderzoeken.type_onderzoek_id = onderzoek_type.onderzoek_type_id 
            WHERE onderzoek_id = ?;"""
            params = (id,)
        else:
            return jsonify({"error": "Onbekende tabel"}), 400
        result =  RawDatabase.runRawQuery(query, params)
        if result:
            data = [dict(row) for row in result]
            return jsonify(data)
        else:
            return jsonify({})

    @staticmethod
    def updateRegistrationStatus(table_name, id, status):
        if table_name == "registraties":
            query = """ 
            UPDATE ervaringsdeskundigen
            SET status = ?
            WHERE ervaringsdeskundige_id = ?;
            """
            params = (status, id)
        elif table_name == "inschrijvingen":
            try:
                ervaringdeskundige_id, onderzoek_id = id.split('-')
            except Exception as e:
                return jsonify({"error": str(e)}), 400
            query = """
            UPDATE inschrijvingen
            SET status = ?
            WHERE onderzoek_id = ? AND ervaringsdeskundige_id = ?;"""
            params = (status, onderzoek_id, ervaringdeskundige_id)
        elif table_name == "onderzoeksaanvragen":
            query = """
            UPDATE onderzoeken
            SET status = ?
            WHERE onderzoek_id = ?;"""
            params = (status, id)
        else:
            return jsonify({"error": "Onbekende tabel"}), 400

        connection = DatabaseConnection.get_connection()
        if connection is None:
            return False
        try:
            cursor = connection.cursor()
            cursor.execute(query, params)
            connection.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print("Fout bij het updaten van de status:", e)
            return False
        finally:
            connection.close()
