from flask import jsonify
from models.database_connect import Database

class Inschrijvingen:
    @staticmethod
    def getInschrijvingen(id):
        try:
            query = '''SELECT onderzoeken.titel AS titel,
                              ervaringsdeskundigen.voornaam AS voornaam,
                              ervaringsdeskundigen.tussenvoegsel AS tussenvoegsel,
                              ervaringsdeskundigen.achternaam AS achternaam,
                              ervaringsdeskundigen.geslacht AS geslacht,
                              onderzoeken.onderzoek_id || '_' || ervaringsdeskundigen.ervaringsdeskundige_id AS samengesteld_ID,
                              onderzoeken.onderzoek_id AS onderzoek_id,
                              ervaringsdeskundigen.ervaringsdeskundige_id AS user_id
                       FROM onderzoeken
                       INNER JOIN inschrijvingen ON inschrijvingen.onderzoek_id = onderzoeken.onderzoek_id
                       INNER JOIN ervaringsdeskundigen ON ervaringsdeskundigen.ervaringsdeskundige_id = inschrijvingen.ervaringsdeskundige_id
                       WHERE onderzoeken.onderzoek_id = ?;'''
            
            response = Database.runQuery(query, (id,))
            data = response.get_json()
            
            if isinstance(data, list) and not data:
                return jsonify({"error": "No data found"}), 404
            
            return jsonify(data), 200
            
        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500
        
    def inschrijvingAfwijzen(onderzoek_id, user_id):
        try:
            query = '''UPDATE inschrijvingen
                            SET status = 3
                        WHERE onderzoek_id = ?
                            AND ervaringsdeskundige_id = ?
                            AND EXISTS (
                                SELECT 1 FROM onderzoeken
                                    WHERE onderzoeken.onderzoek_id = inschrijvingen.onderzoek_id
                            )
                            AND EXISTS (
                                SELECT 1 FROM ervaringsdeskundigen
                                    WHERE ervaringsdeskundigen.ervaringsdeskundige_id = inschrijvingen.ervaringsdeskundige_id
                            );
            '''
            
            response = Database.runQuery(query, (onderzoek_id, user_id))

            if response == 0:
                return jsonify({"error": "No data found"}), 404

            return jsonify({"success": "Status updated"}), 200
        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500
        
    def inschrijvingAccepteren(onderzoek_id, user_id):
        try:
            query = '''UPDATE inschrijvingen
                            SET status = 2
                        WHERE onderzoek_id = ?
                            AND ervaringsdeskundige_id = ?
                            AND EXISTS (
                                SELECT 1 FROM onderzoeken
                                    WHERE onderzoeken.onderzoek_id = inschrijvingen.onderzoek_id
                            )
                            AND EXISTS (
                                SELECT 1 FROM ervaringsdeskundigen
                                    WHERE ervaringsdeskundigen.ervaringsdeskundige_id = inschrijvingen.ervaringsdeskundige_id
                            );
            '''
            
            response = Database.runQuery(query, (onderzoek_id, user_id))

            if response == 0:
                return jsonify({"error": "No data found"}), 404

            return jsonify({"success": "Status updated"}), 200
        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500