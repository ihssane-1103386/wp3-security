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
        WHERE ervaringsdeskundige_id = ?;
        """
        return DatabaseQueries.run_query(query, (id,))



    @staticmethod
    def updateRegistrationStatus(id, status):
        query = """ 
        UPDATE ervaringsdeskundigen
        SET status = ?
        WHERE ervaringsdeskundige_id = ?;
        """
        return DatabaseQueries.run_query(query, (status, id))



