from flask import jsonify
from models.database_connect import Database
from database.database_connection import DatabaseConnection
from database.database_queries import DatabaseQueries


class Registrations:
    @staticmethod
    def getRegistration():
        query = """ 
        SELECT ervaringsdeskundige_id, voornaam, tussenvoegsel, achternaam, email 
        FROM ervaringsdeskundigen WHERE status = 0;
        """
        # Gebruik om data op te halen
        return DatabaseQueries.run_query(query, ())



    @staticmethod
    def getRegistrationDetails(id):
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
        return DatabaseQueries.run_query(query, (id,))

    @staticmethod
    def updateRegistrationStatus(id, status):
        query = """ 
        UPDATE ervaringsdeskundigen
        SET status = ?
        WHERE ervaringsdeskundige_id = ?;
        """
        connection = DatabaseConnection.get_connection()
        if connection is None:
            return False

        try:
            cursor = connection.cursor()
            cursor.execute(query, (status, id))
            connection.commit()
            return cursor.rowcount > 0
        except Exception as e:
            print("Fout bij het updaten van de status:", e)
            return False
        finally:
            connection.close()
