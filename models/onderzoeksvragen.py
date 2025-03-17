from flask import jsonify
from models.database_connect import RawDatabase
from models.api_keys import ApiKeys
import flask.globals as globals
import database.database_queries as DatabaseQueries


class Onderzoeksvragen:
    @staticmethod
    def add_onderzoeksvraag(form):
        try:
            # Print de ontvangen formulierdata
            print(f"Received form data: {form}")

            # Placeholder
            organisatie_id = 1

            status = 0  # 0 = nieuw
            beschikbaar = 1  # 1 = beschikbaar
            type_onderzoek_id = int(form.get("type-onderzoek"))
            titel = form.get("onderzoekstitel")
            omschrijving = form.get("omschrijving")
            plaats = form.get("plaats")
            aantal_deelnemers = int(form.get("aantal-deelnemers"))
            min_leeftijd = int(form.get("min-leeftijd"))
            max_leeftijd = int(form.get("max-leeftijd"))

            # Hier moet de wijziging plaatsvinden voor de 'beperking' waarde:
            beperkingen_id_str = form.get("beperking")
            if beperkingen_id_str == 'undefined' or not beperkingen_id_str:
                beperkingen_id = None  # of een andere standaardwaarde
            else:
                beperkingen_id = int(beperkingen_id_str)

            begeleiders = form.get("begeleiders")
            startdatum = form.get("startdatum")
            einddatum = form.get("einddatum")
            beloning = form.get("beloning")

            query = """
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

            # Genereer een API-sleutel
            api_key = ApiKeys.create_key(organisatie_id, new_onderzoek_id)
            if api_key:
                print(f"API Key created: {api_key}")
            else:
                print("Error creating API key")

            # Voeg beperking toe als die bestaat
            if beperkingen_id:
                query_intersect = """
                    INSERT INTO beperkingen_onderzoek (onderzoek_id, beperkingen_id)
                    VALUES (?, ?)
                """
                RawDatabase.runInsertQuery(query_intersect, (new_onderzoek_id, beperkingen_id))

            # Return onderzoek_id, api_key, organisatie_id in de response
            return jsonify({
                "message": "Onderzoeksvraag added successfully!",
                "onderzoek_id": new_onderzoek_id,
                "api_key": api_key,
                "organisatie_id": organisatie_id
            }), 200

        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500

    @staticmethod
    def getbeperkingen():
        beperkingen = RawDatabase.runRawQuery("SELECT * FROM beperkingen")
        return [{"beperking": row[1]} for row in beperkingen]

    @staticmethod
    def get_vragen():
        if "user" in globals.session:
            email = globals.session["user"]
            if ("role" in globals.session):
                role = globals.session["role"] or "ervaringsdeskundige"
            else:
                role = "ervaringsdeskundige"
            
            results = None

            if role == "ervaringsdeskundige":
                if "beperkingen" in globals.session:
                    beperkingen = globals.session["beperkingen"]
                    beperking_ids = [beperking["id"] for beperking in beperkingen]
                    
                    placeholders = ', '.join('?' for _ in tuple(beperking_ids))
                    
                    query = f"""
                        SELECT onderzoeken.onderzoek_id, onderzoeken.onderzoek_id, onderzoeken.titel, onderzoeken.beschrijving, onderzoeken.max_deelnemers, onderzoeken.beschikbaar, beperkingen.beperking AS beperking
                        FROM onderzoeken
                        JOIN beperkingen_onderzoek ON onderzoeken.onderzoek_id = beperkingen_onderzoek.onderzoek_id
                        JOIN beperkingen ON beperkingen_onderzoek.beperkingen_id = beperkingen.beperkingen_id
                        WHERE beperkingen_onderzoek.beperkingen_id IN ({placeholders})
                    """
                    results = RawDatabase.runRawQuery(query, tuple(beperking_ids))
                    
                    if not results:
                        return jsonify({"error": "No results found"}), 404
                else:
                    return jsonify({"Error": "Geen beperkingen gevonden in deze sessie"}), 400
            else:
                query = """
                    SELECT onderzoeken.onderzoek_id, onderzoeken.onderzoek_id, onderzoeken.titel, onderzoeken.beschrijving, onderzoeken.max_deelnemers, onderzoeken.beschikbaar, beperkingen.beperking AS beperking FROM onderzoeken
                    JOIN beperkingen_onderzoek ON onderzoeken.onderzoek_id = beperkingen_onderzoek.onderzoek_id
                    JOIN beperkingen ON beperkingen_onderzoek.beperkingen_id = beperkingen.beperkingen_id
                """
                results = RawDatabase.runRawQuery(query)

            if results is not None:
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
                return vragen, 200
            else:
                return jsonify({"Error": "No results found"}), 404
        else:
            return jsonify({"Error": "Geen toegang"}), 403


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



    @staticmethod
    def update_onderzoeksvraag(onderzoek_id, data):
        try:
            # Alleen velden updaten die zijn meegegeven in de aanvraag
            velden = []
            waarden = []

            if "titel" in data:
                velden.append("titel = ?")
                waarden.append(data["titel"])

            if "beschrijving" in data:
                velden.append("beschrijving = ?")
                waarden.append(data["beschrijving"])

            if "max_deelnemers" in data:
                velden.append("max_deelnemers = ?")
                waarden.append(data["max_deelnemers"])

            if "beperking_id" in data:
                velden.append("beperking_id = ?")
                waarden.append(data["beperking_id"])

            if not velden:
                return False  # Geen wijzigingen doorgegeven

            waarden.append(onderzoek_id)

            query = f"""
                UPDATE onderzoeken
                SET {', '.join(velden)}
                WHERE onderzoek_id = ?
            """

            RawDatabase.runInsertQuery(query, tuple(waarden))
            return True

        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return False


