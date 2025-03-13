import secrets
from models.database_connect import RawDatabase

class ApiKeys:
    @staticmethod
    def create_key(organisatie_id):
        try:
            key = secrets.token_urlsafe(32)
            print(f"Generated API key: {key}")  # Debug print

            # Voeg de API-sleutel toe aan de 'organisaties' tabel
            query = """
                UPDATE organisaties 
                SET api_key = ?
                WHERE organisatie_id = ?
            """
            RawDatabase.runInsertQuery(query, (key, organisatie_id))

            return key
        except Exception as e:
            print(f"Error creating API key: {e}")  # Foutmelding als er iets misgaat
            return None
