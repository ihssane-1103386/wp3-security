import secrets

from database.database_queries import DatabaseQueries
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

    @staticmethod
    def validate_api_key(form_data):
        api_key = form_data.get("api_key")
        if not api_key:
            return None, {'success': False, 'message': 'API key mist.'}, 400
        # Get the row from the database
        row = DatabaseQueries.get_organisatie_id_by_api_key(api_key)
        if not row:
            return None, {'success': False, 'message': 'API key is niet valide.'}, 400
        # Extract the actual organization ID (assuming it's an integer or string)
        org_id = row["organisatie_id"]
        return org_id, None, None
