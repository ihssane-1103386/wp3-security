import secrets
from models.database_connect import RawDatabase

class ApiKeys:
    @staticmethod
    def get_by_key(api_key):
        query = """
            SELECT * FROM api_keys
            WHERE api_key = ?
        """
        result = RawDatabase.runRawQuery(query, (api_key,))
        return dict(result[0]) if result else None