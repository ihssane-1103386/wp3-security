import json
from flask import Flask, jsonify, render_template, request
from models.inschrijvingen import Inschrijvingen
from models.onderzoeksvragen import Onderzoeksvragen
from models.onderzoeken import onderzoeken
from database.database_queries import DatabaseQueries
from models.registraties import Registrations



app = Flask(__name__)

# Default Route
@app.route("/")
def homepagina():
    return render_template("homepagina.html")

@app.errorhandler(404)
def notFound(e):
    return render_template("pagina-niet-gevonden.html"), 404

# Route setup for onderzoeksvragen page
@app.route("/onderzoeksvragen")
def onderzoeksvragen():
    vragen = Onderzoeksvragen.get_vragen()
    beperkingen = Onderzoeksvragen.getbeperkingen()
    beperkingen_lijst = [beperking["beperking"] for beperking in beperkingen]
    # return jsonify(vragen), 200
    return render_template("onderzoeksvragen.html", vragen=vragen, beperkingen=beperkingen_lijst, goedkeuren="0")

@app.route("/inschrijvingen/goedkeuren")
def inschrijvingen_goedkeuren():
    vragen = Onderzoeksvragen.get_vragen()
    return render_template("onderzoeksvragen.html", vragen=vragen, goedkeuren="1")


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
    return render_template("onderzoeksvraag_aanmaken.html")

@app.route("/api/get-beperkingen")
def get_beperkingen():
    beperking = Onderzoeksvragen.getbeperkingen()
    return jsonify(beperking)

@app.route("/api/beperkingen")
def beperkingen():
    query = request.args.get("query", "")

    if not query:
        return jsonify([]), 400

    return DatabaseQueries.get_beperkingen(query)

@app.route("/registrations")
def registraties():
    return render_template("registraties.html")


@app.route("/api/registrations", methods=["GET"])
def getRegistration():
    return Registrations.getRegistration()


@app.route("/api/registrations/<int:id>", methods=["GET"])
def getRegistrationDetails(id):
    return Registrations.getRegistrationDetails(id)


@app.route("/api/registrations/status", methods=["PATCH"])
def updateRegistrationStatus():
    data = request.get_json()
    registration_id = data.get('id')
    status = data.get('status')

    if status not in [1, 2]:
        return jsonify({"message": "Invalid status"}), 400

    updated = Registrations.updateRegistrationStatus(registration_id, status)
    if updated:
        return jsonify({"message": "Status updated successfully"}), 200
    else:
        return jsonify({"message": "Error updating status"}), 400


@app.route("/rd")
def \
        registratie_deskundige():
    return render_template("registratie_pagina_ervaringsdeskundige.html")


# Api Routes
@app.route("/api/onderzoeken", methods=["GET"])
def getOnderzoeken():
    return onderzoeken.getOnderzoeken()


@app.route("/api/onderzoeken/inschrijving/afwijzen/<int:onderzoek_id>/<int:user_id>", methods=["PATCH"])
def aanmeldingAfwijzen(onderzoek_id, user_id):
    return Inschrijvingen.getInschrijvingen(onderzoek_id, user_id)

@app.route("/api/onderzoeken/inschrijvingen/<int:id>", methods=["GET"])
def getInschrijvingen(id):
    return Inschrijvingen.getInschrijvingen(id)

app.run(debug=True)