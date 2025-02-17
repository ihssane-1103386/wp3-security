from flask import jsonify
from models.database_connect import RawDatabase

class Onderzoeksvragen:
    @staticmethod
    def add_onderzoeksvraag(form):
        try:
            # Placeholder
            organisatie_id = 1

            status = 0          # 0 = nieuw
            beschikbaar = 1     # 1 = beschikbaar
            type_onderzoek_id = int(form.get("type-onderzoek"))
            titel = form.get("onderzoekstitel")
            omschrijving = form.get("omschrijving")
            plaats = form.get("plaats")
            aantal_deelnemers = int(form.get("aantal-deelnemers"))
            min_leeftijd = int(form.get("min-leeftijd"))
            max_leeftijd = int(form.get("max-leeftijd"))
            beperkingen_id = int(form.get("beperking"))
            begeleiders = form.get("begeleiders")
            startdatum = form.get("startdatum")
            einddatum = form.get("einddatum")
            beloning = form.get("beloning")

            query= """
                INSERT INTO onderzoeken (
                    organisatie_id,
                    status,
                    beschikbaar,
                    type_onderzoek_id,
                    titel, 
                    beschrijving, 
                    plaats, 
                    max_deelnemers, 
                    min_leeftijd, 
                    max_leeftijd, 
                    begeleider,
                    datum, 
                    datum_tot, 
                    beloning,
                    creatie_datum
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """
            new_onderzoek_id = RawDatabase.runInsertQuery(query, (
                organisatie_id,
                status,
                beschikbaar,
                type_onderzoek_id,
                titel,
                omschrijving,
                plaats,
                aantal_deelnemers,
                min_leeftijd,
                max_leeftijd,
                begeleiders,
                startdatum,
                einddatum,
                beloning
            ))

            if beperkingen_id:
                query_intersect = """
                    INSERT INTO beperkingen_onderzoek (onderzoek_id, beperkingen_id)
                    VALUES (?, ?)
                """
                RawDatabase.runInsertQuery(query_intersect, (new_onderzoek_id, beperkingen_id))

            return jsonify({"message": "Onderzoeksvraag added successfully!"}), 200

        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500

    @staticmethod
    def getbeperkingen():
        beperkingen = RawDatabase.runRawQuery("SELECT * FROM beperkingen")
        return [{"beperkingen_id": row[0], "beperking": row[1]} for row in beperkingen]

    @staticmethod
    def get_vragen():
        query = """ 
            SELECT onderzoeken.onderzoek_id, onderzoeken.titel, onderzoeken.beschrijving, onderzoeken.max_deelnemers, onderzoeken.beschikbaar, beperkingen.beperking AS beperking FROM onderzoeken
            JOIN beperkingen_onderzoek ON onderzoeken.onderzoek_id = beperkingen_onderzoek.onderzoek_id
            JOIN beperkingen ON beperkingen_onderzoek.beperkingen_id = beperkingen.beperkingen_id
        """

        results = RawDatabase.runRawQuery(query)
        vragen = []
        for row in results:
            row = dict(row)
            record = {
                'onderzoek_id': row["onderzoek_id"],
                'titel': row["titel"],
                'beschrijving': row["beschrijving"],
                'beperking': row["beperking"],
                'max_deelnemers': row["max_deelnemers"],
                'beschikbaar': row["beschikbaar"]
            }
            vragen.append(record)
        return vragen


    @staticmethod
    def add_deelname(ervaringsdeskundige_id, onderzoek_id):
        try:
            query = """ 
                INSERT INTO inschrijvingen (ervaringsdeskundige_id, onderzoek_id)
                VALUES(?, ?)
            """
            RawDatabase.runInsertQuery(query, (ervaringsdeskundige_id, onderzoek_id))

            update_query = """
                UPDATE onderzoeken 
                SET beschikbaar = 0
                WHERE onderzoek_id = ?
            """
            RawDatabase.runInsertQuery(update_query, (onderzoek_id,))

            return jsonify({"message": "Deelname geregistreerd!"}), 200

        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Er is iets mis gegaan, probeer het later opnieuw."}), 500

