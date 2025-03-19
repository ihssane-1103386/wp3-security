from flask import jsonify, request, session
from models.database_connect import RawDatabase
from models.api_keys import ApiKeys
import flask.globals as globals
import datetime
import database.database_queries as DatabaseQueries


class Onderzoeksvragen:
    @staticmethod
    def add_onderzoeksvraag(form, organisatie_id):
        try:
            # Print de ontvangen formulierdata
            print(f"Received form data: {form}")

            status = 0  # 0=nieuw, 1=goedgekeurd, 2=afgekeurd, 3=gesloten
            beschikbaar = 1  # 0=niet beschikbaar, 1=beschikbaar
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
                        SELECT onderzoeken.onderzoek_id, onderzoeken.onderzoek_id, onderzoeken.titel, onderzoeken.beschrijving, onderzoeken.max_deelnemers, onderzoeken.status, onderzoeken.beschikbaar, beperkingen.beperking AS beperking
                        FROM onderzoeken
                        LEFT JOIN beperkingen_onderzoek ON onderzoeken.onderzoek_id = beperkingen_onderzoek.onderzoek_id
                        LEFT JOIN beperkingen ON beperkingen_onderzoek.beperkingen_id = beperkingen.beperkingen_id
                        WHERE beperkingen_onderzoek.beperkingen_id IN ({placeholders})
                    """
                    results = RawDatabase.runRawQuery(query, tuple(beperking_ids))
                    
                    if not results:
                        return jsonify({"error": "No results found"}), 404
                else:
                    return jsonify({"Error": "Geen beperkingen gevonden in deze sessie"}), 400
            else:
                query = """
                    SELECT onderzoeken.onderzoek_id, onderzoeken.onderzoek_id, onderzoeken.titel, onderzoeken.beschrijving, onderzoeken.max_deelnemers, onderzoeken.status, onderzoeken.beschikbaar, beperkingen.beperking AS beperking FROM onderzoeken
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
                        'beschikbaar': row["beschikbaar"],
                        'status': row["status"]
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
            check_query = """
                SELECT COUNT(*) FROM inschrijvingen WHERE onderzoek_id = ?
            """
            current_deelnemers = len(RawDatabase.runRawQuery(check_query, (onderzoek_id,))) or 0
            # current_deelnemers = RawDatabase.runSelectQuery(check_query, (onderzoek_id,))
            max_query = """
                SELECT max_deelnemers FROM onderzoeken WHERE onderzoek_id = ?
            """
            
            result = RawDatabase.runRawQuery(max_query, (onderzoek_id,))

            if result:
                max_deelnemers = result[0]["max_deelnemers"]
            else:
                max_deelnemers = 0

            print(f"current_deelnemers = {current_deelnemers} max_deelnemers = {max_deelnemers}")

            if current_deelnemers >= max_deelnemers:
                return jsonify({"error": "Maximaal aantal deelnemers bereikt."}), 400
            query = """ 
                INSERT INTO inschrijvingen (ervaringsdeskundige_id, onderzoek_id, datum, status)
                VALUES(?, ?, ?, ?)
            """
            print('inserted')
            RawDatabase.runRawQuery(query, (ervaringsdeskundige_id, onderzoek_id, datetime.datetime.now().replace(microsecond=0), 0))
            update_query = """
                UPDATE onderzoeken 
                SET beschikbaar = beschikbaar - 1
                WHERE onderzoek_id = ?
            """
            RawDatabase.runInsertQuery(update_query, (onderzoek_id,))

            return jsonify({"message": "Deelname geregistreerd!"}), 200
        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Er is iets mis gegaan, probeer het later opnieuw."}), 500

    @staticmethod
    def update_onderzoek_route(onderzoek_id):
        try:
            api_key = request.headers.get('API-Key')
            if not api_key:
                return jsonify({"error": "API key is missing"}), 400

            organisatie_id = ApiKeys.get_by_api_key(api_key)
            if not organisatie_id:
                return jsonify({"error": "Invalid API key"}), 403

            form = request.json
            if not form:
                return jsonify({"error": "JSON payload mist"}), 404

            aanpasbare_gegevens = [
                "titel", "beschrijving", "plaats", "max_deelnemers",
                "min_leeftijd", "max_leeftijd", "beloning", "datum",
                "datum_tot", "begeleider", "beschikbaar"
            ]

            updates = []
            waardes = []

            for gegevens in aanpasbare_gegevens:
                if gegevens in form:
                    updates.append(f"{gegevens} = ?")
                    waardes.append(form[gegevens])

            if not updates:
                return jsonify({"error": "No updates found"}), 404

            waardes.extend([onderzoek_id, organisatie_id])
            query = f"""
                    UPDATE onderzoeken
                    SET {', '.join(updates)}
                    WHERE onderzoek_id = ? AND organisatie_id = ?
                """
            RawDatabase.runInsertQuery(query, tuple(waardes))
            return jsonify({"message": "Onderzoeksvraag updated successfully!"}), 200

        except Exception as errormsg:
            print(f"Error: {errormsg}")
            return jsonify({"error": "Something went wrong"}), 500

    @staticmethod
    def get_mijn_onderzoeken(ervaringsdeskundige_id):
        query = """
               SELECT 
                   onderzoeken.onderzoek_id,
                   onderzoeken.titel,
                   inschrijvingen.status
               FROM inschrijvingen
               JOIN onderzoeken ON inschrijvingen.onderzoek_id = onderzoeken.onderzoek_id
               WHERE inschrijvingen.ervaringsdeskundige_id = ?
           """
        results = RawDatabase.runRawQuery(query, (ervaringsdeskundige_id,))
        status_definition = {
            0: "In afwachting",
            1: "Goedgekeurd",
            2: "Afgekeurd",
        }

        data = []
        for row in results:
            status_dict = dict(row)
            status_num = status_dict.get("status")
            status_dict["status"] = status_definition.get(status_num, "Onbekend")
            data.append(status_dict)
        return data


    @staticmethod
    def get_onderzoek_vraag(onderzoek_id):
        query = """ 
            SELECT onderzoeken.onderzoek_id, onderzoeken.titel, onderzoeken.beschrijving, onderzoeken.max_deelnemers, onderzoeken.beschikbaar, 
            beperkingen.beperking AS beperking, onderzoeken.datum, onderzoeken.datum_tot, 
            onderzoeken.beloning, onderzoeken.plaats, onderzoeken.min_leeftijd, onderzoeken.max_leeftijd, 
            onderzoeken.begeleider
            FROM onderzoeken
            LEFT JOIN beperkingen_onderzoek ON onderzoeken.onderzoek_id = beperkingen_onderzoek.onderzoek_id
            LEFT JOIN beperkingen ON beperkingen_onderzoek.beperkingen_id = beperkingen.beperkingen_id
            WHERE onderzoeken.onderzoek_id = ?
        """
        result = RawDatabase.runRawQuery(query, (onderzoek_id,))

        from datetime import datetime

        if result:
            row = dict(result[0])

            onderzoek_vraag = {
                'onderzoek_id': row["onderzoek_id"],
                'titel': row["titel"],
                'beschrijving': row["beschrijving"],
                'beperking': row.get("beperking", "Geen beperking"),
                'max_deelnemers': row["max_deelnemers"],
                'status': "Open" if row["beschikbaar"] == 1 else "Gesloten",
                'datum': datetime.strptime(row["datum"], '%Y-%m-%d') if row["datum"] else None,
                'datum_tot': datetime.strptime(row["datum_tot"], '%Y-%m-%d') if row["datum_tot"] else None,
                'beloning': row["beloning"],
                'plaats': row["plaats"],
                'min_leeftijd': row["min_leeftijd"],
                'max_leeftijd': row["max_leeftijd"],
                'begeleider': row["begeleider"]
            }
            return onderzoek_vraag
        else:
            return None



    @staticmethod
    def api_add_onderzoek():
        try:
            api_key = request.headers.get('API-Key')
            if not api_key:
                return jsonify({"error": "API key ontbreekt"}), 400

            organisatie_id = ApiKeys.get_by_api_key(api_key)
            if not organisatie_id:
                return jsonify({"error": "Ongeldige API key"}), 403

            data = request.json
            print(f"Ontvangen data via API: {data}")

            status = 0
            beschikbaar = 1
            type_onderzoek_id = int(data.get("type_onderzoek_id"))
            titel = data.get("titel")
            omschrijving = data.get("omschrijving")
            plaats = data.get("plaats")
            aantal_deelnemers = int(data.get("max_deelnemers"))
            min_leeftijd = int(data.get("min_leeftijd"))
            max_leeftijd = int(data.get("max_leeftijd"))
            beperkingen_id = int(data.get("beperkingen_id"))
            begeleiders = data.get("begeleider")
            startdatum = data.get("datum")
            einddatum = data.get("datum_tot")
            beloning = data.get("beloning")

            query = """
                INSERT INTO onderzoeken (
                    organisatie_id, status, beschikbaar, type_onderzoek_id, titel, beschrijving,
                    plaats, max_deelnemers, min_leeftijd, max_leeftijd, begeleider,
                    datum, datum_tot, beloning, creatie_datum
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """

            new_onderzoek_id = RawDatabase.runInsertQuery(query, (
                organisatie_id, status, beschikbaar, type_onderzoek_id, titel, omschrijving,
                plaats, aantal_deelnemers, min_leeftijd, max_leeftijd, begeleiders,
                startdatum, einddatum, beloning
            ))

            if beperkingen_id:
                intersect_query = """
                    INSERT INTO beperkingen_onderzoek (onderzoek_id, beperkingen_id)
                    VALUES (?, ?)
                """
                RawDatabase.runInsertQuery(intersect_query, (new_onderzoek_id, beperkingen_id))

            return jsonify({"message": "Onderzoek succesvol toegevoegd via API!"}), 201

        except Exception as e:
            print(f"API Error: {e}")
            return jsonify({"error": "Er is iets mis gegaan bij het verwerken van de aanvraag."}), 500