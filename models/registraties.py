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
        SELECT ervaringsdeskundige_id, voornaam, tussenvoegsel, achternaam, geboortedatum, geslacht, email, telefoonnummer 
        FROM ervaringsdeskundigen 
        WHERE ervaringsdeskundige_id = %s;
        """
        return DatabaseQueries.run_query(query, (id,))

    @staticmethod
    def updateRegistrationStatus(data):
        registration_id = data.get("id")
        status = data.get("status")

        query = """
        UPDATE ervaringsdeskundigen 
        SET status = %s 
        WHERE ervaringsdeskundige_id = %s;
        """
        return DatabaseQueries.run_query(query, (status, registration_id))
