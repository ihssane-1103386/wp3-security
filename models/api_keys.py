import secrets
from models.database_connect import RawDatabase

class ApiKeys:
    @staticmethod
    def get_by_onderzoek_id(onderzoek_id):
        query = """
                SELECT * FROM api_keys
                WHERE onderzoek_id = ?
            """
        result = RawDatabase.runRawQuery(query, (onderzoek_id,))
        return dict(result[0]) if result else None

    @staticmethod
    def get_by_key(api_key):
        query = """
            SELECT * FROM api_keys
            WHERE api_key = ?
        """
        result = RawDatabase.runRawQuery(query, (api_key,))
        return dict(result[0]) if result else None

    @staticmethod
    def create_key(organisatie_id, onderzoek_id):
        try:
            key = secrets.token_urlsafe(32)
            print(f"Generated API key: {key}")  # Debug print
            query = """
                           INSERT INTO api_keys (organisatie_id, onderzoek_id, api_key)
                           VALUES (?, ?, ?)
                       """
            RawDatabase.runInsertQuery(query, (organisatie_id, onderzoek_id, key))
            return key
        except Exception as e:
            print(f"Error creating API key: {e}")  # Foutmelding als er iets misgaat
            return None