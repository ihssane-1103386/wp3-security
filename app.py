import json
from flask import Flask, jsonify, render_template, request, redirect, session, flash
from flask_session import Session
from models.inschrijvingen import Inschrijvingen
from models.onderzoeksvragen import Onderzoeksvragen
from models.onderzoeken import onderzoeken
from database.database_queries import DatabaseQueries
from models.registraties import Registrations

app = Flask(__name__)
app.secret_key = "acces"
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Default Route
@app.route("/")
def homepagina():
    return render_template("login.html.jinja")

@app.errorhandler(404)
def notFound(e):
    return render_template("pagina-niet-gevonden.html"), 404

@app.context_processor
def inject_user():
    return dict(user=session.get("user"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if request.content_type != "application/json":
            return jsonify({"success": False, "message": "Invalid request format. Use JSON."}), 415

        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Invalid JSON request."}), 400

        email = data.get("email")
        wachtwoord = data.get("password")

        medewerker = DatabaseQueries.authenticate_worker(email, wachtwoord)
        if medewerker:
            session["user"] = email
            session["role"] = medewerker["rol"]
            return jsonify({"success": True, "message": "Inloggen als medewerker gelukt!", "role": medewerker["rol"]})

        if DatabaseQueries.authenticate_user(email, wachtwoord):
            session["user"] = email
            return jsonify({"success": True, "message": "Inloggen geslaagd!"})
        else:
            return jsonify({"success": False, "message": "Ongeldig e-mailadres of wachtwoord."})

    return render_template("login.html.jinja")

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect("/login")


@app.route("/rd", methods=["GET", "POST"])
def registration_expert():
    return render_template("registratie_pagina.html.jinja")

# Route setup for onderzoeksvragen page
@app.route("/onderzoeksvragen")
def onderzoeksvragen():
    vragen = Onderzoeksvragen.get_vragen()
    beperkingen = Onderzoeksvragen.getbeperkingen()
    beperkingen_lijst = [beperking["beperking"] for beperking in beperkingen]
    # return jsonify(vragen), 200
    return render_template("onderzoeksvragen.html.jinja", vragen=vragen, beperkingen=beperkingen_lijst, goedkeuren="0")

@app.route("/inschrijvingen/goedkeuren")
def inschrijvingen_goedkeuren():
    vragen = Onderzoeksvragen.get_vragen()
    return render_template("onderzoeksvragen.html.jinja", vragen=vragen, goedkeuren="1")


@app.route("/deelnemen", methods=["POST"])
def deelnemen():
    ervaringsdeskundige_id = request.form.get("ervaringsdeskundige_id")
    onderzoek_id = request.form.get("onderzoek_id")

    if not ervaringsdeskundige_id or not onderzoek_id:
        return jsonify({"error": "Ontbrekende gegevens"}), 400
    return Onderzoeksvragen.add_deelname(ervaringsdeskundige_id, onderzoek_id)


@app.route("/aanmaken-onderzoeksvraag", methods=["GET", "POST"])
def aanmaken_onderzoeksvraag():
    if request.method == "POST":
        return Onderzoeksvragen.add_onderzoeksvraag(request.form)
    return render_template("onderzoeksvraag_aanmaken.html.jinja")

@app.route("/api/get-beperkingen")
def get_beperkingen():
    beperking = Onderzoeksvragen.getbeperkingen()
    return jsonify(beperking)

@app.route("/api/register", methods=["POST"])
def register_expert():
    data = request.json

    required_fields = ["voornaam", "achternaam", "email", "geslacht", "telefoonnummer", "wachtwoord", "beperkingen"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Veld '{field}' ontbreekt of is leeg"}), 400

    ervaringsdeskundige_id = DatabaseQueries.add_expert(
        data["voornaam"], data.get("tussenvoegsel", ""), data["achternaam"],
        data.get("geboortedatum", ""), data["email"], data["geslacht"],
        data["telefoonnummer"], data["wachtwoord"]
    )

    if not ervaringsdeskundige_id:
        return jsonify({"error": "Kon ervaringsdeskundige niet opslaan"}), 500

    for beperking in data["beperkingen"]:
        DatabaseQueries.link_disability_to_expert(ervaringsdeskundige_id, beperking)

    return jsonify({"message": "Registratie succesvol", "ervaringsdeskundige_id": ervaringsdeskundige_id}), 201


@app.route("/api/beperkingen")
def disability():
    query = request.args.get("query", "")

    if not query:
        return jsonify([]), 400

    return DatabaseQueries.get_disability(query)

@app.route("/registrations")
def registraties():
    return render_template("beheerder_pagina.jinja")


@app.route("/api/registrations/<table_name>", methods=["GET"])
def getRegistration(table_name):
    return Registrations.getRegistration(table_name)


@app.route("/api/registrations/<table_name>/<id>", methods=["GET"])
def getRegistrationDetails(table_name, id):
    return Registrations.getRegistrationDetails(table_name, id)


@app.route("/api/registrations/<table_name>/status", methods=["PATCH"])
def updateRegistrationStatus(table_name):
    data = request.get_json()
    registration_id = data.get('id')
    status = data.get('status')

    if status not in [1, 2]:
        return jsonify({"message": "Invalid status"}), 400

    updated = Registrations.updateRegistrationStatus(table_name, registration_id, status)
    if updated:
        return jsonify({"message": "Status updated successfully"}), 200
    else:
        return jsonify({"message": "Error updating status"}), 400

# Api Routes
@app.route("/api/onderzoeken", methods=["GET"])
def getOnderzoeken():
    return onderzoeken.getOnderzoeken()


@app.route("/api/update-onderzoeksvraag", methods=["PATCH"])
def update_onderzoeksvraag():
    data = request.json
    onderzoek_id = data.get("onderzoek_id")

    if not onderzoek_id:
        return jsonify({"error": "onderzoek_id is vereist"}), 400

    update_result = Onderzoeksvragen.update_onderzoeksvraag(onderzoek_id, data)

    if update_result:
        return jsonify({"message": "Onderzoeksvraag succesvol bijgewerkt"}), 200
    else:
        return jsonify({"error": "Fout bij updaten van onderzoeksvraag"}), 500


@app.route("/api/onderzoeken/inschrijvingen/<int:id>", methods=["GET"])
def getInschrijvingen(id):
    return Inschrijvingen.getInschrijvingen(id)

app.run(debug=True)