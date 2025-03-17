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


    @staticmethod
    def get_by_organisatie_id(organisatie_id):
        query = """
                SELECT api_key FROM organisaties
                WHERE organisatie_id = ?
            """
        result = RawDatabase.runRawQuery(query, (organisatie_id,))
        return result[0]["api_key"] if result else None

    @staticmethod
    def get_by_api_key(api_key):
        query = """
                SELECT organisatie_id FROM organisaties
                WHERE api_key = ?
            """
        result = RawDatabase.runRawQuery(query, (api_key,))
        return result[0]["organisatie_id"] if result else None

