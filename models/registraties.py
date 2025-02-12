from flask import jsonify
from models.database_connect import Database
from database.database_connection import DatabaseConnection
from database.database_queries import DatabaseQueries


class Registraties:
    @staticmethod
    def getRegistraties():
        query = """ 
        SELECT ervaringsdeskundige_id, voornaam, tussenvoegsel, achternaam, email 
        FROM ervaringsdeskundigen;
        """
        # Gebruik om data op te halen
        return DatabaseQueries.run_query(query, ())
