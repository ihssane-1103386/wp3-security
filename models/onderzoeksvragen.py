from flask import jsonify
from models.database_connect import Database


class Onderzoeksvragen:
    @staticmethod
    def add_onderzoeksvraag(form):
        try:
            # placeholders voor nu, omdat de database nog leeg is.
            organisatie_id = 1
            status = 1
            type_onderzoek_id = 1

            titel = form.get("onderzoekstitel")
            omschrijving = form.get("omschrijving")
            plaats = form.get("plaats")
            aantal_deelnemers = form.get("aantal-deelnemers")
            min_leeftijd = form.get("min-leeftijd")
            max_leeftijd = form.get("max-leeftijd")
            beperking_id = form.get("beperking")
            begeleider = form.get("begeleider")
            startdatum = form.get("startdatum")
            einddatum = form.get("einddatum")
            beloning = form.get("beloning")

            query = """
                       INSERT INTO onderzoeken (
                           organisatie_id,
                           status,
                           type_onderzoek_id,
                           titel, 
                           beschrijving, 
                           plaats, 
                           max_deelnemers, 
                           min_leeftijd, 
                           max_leeftijd, 
                           beperking_id,
                           begeleider,
                           datum, 
                           datum_tot, 
                           beloning
                       )
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                   """

            Database.runQuery(query, (
                organisatie_id,
                status,
                type_onderzoek_id,
                titel,
                omschrijving,
                plaats,
                aantal_deelnemers,
                min_leeftijd,
                max_leeftijd,
                beperking_id,
                begeleider,
                startdatum,
                einddatum,
                beloning
            ))

            return jsonify({"message": "Onderzoeksvraag added successfully!"}), 200

        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500