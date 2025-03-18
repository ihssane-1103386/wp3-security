from flask import Flask, jsonify, url_for, render_template, request, redirect, session
from flask_session import Session
from models.inschrijvingen import Inschrijvingen
from models.onderzoeksvragen import Onderzoeksvragen
from models.onderzoeken import onderzoeken
from database.database_queries import DatabaseQueries
from models.registraties import Registrations
from functools import wraps

from models.api_keys import ApiKeys


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
    return dict(user=session.get("user"), role=session.get("role"))

@app.route("/api/get_user_role", methods=["GET"])
def get_user_role():
    if "user" in session:
        email = session["user"]
        role = DatabaseQueries.get_user_role(email)
        return jsonify({"role": role or "ervaringsdeskundige"})
    return jsonify({"role": "guest"})

@app.route("/api/userbeperkingen/<string:email>")
def getUserBeperkingen(email):
    return DatabaseQueries.get_user_beperkingen(email)

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
            beperkingen_result = DatabaseQueries.get_user_beperkingen(email)
            beperkingen_array = []
            if isinstance(beperkingen_result, list):
                beperkingen_array = []
                for item in beperkingen_result:
                    if isinstance(item, dict):
                        beperkingen_array.append({
                            "id": item["beperkingen_id"],
                            "beperking": item["beperking"]
                        })
                session["beperkingen"] = beperkingen_array
            else:
                session["beperkingen"] = []

            return jsonify({"success": True, "message": "Inloggen geslaagd!"})
        else:
            return jsonify({"success": False, "message": "Ongeldig e-mailadres of wachtwoord."})

    return render_template("login.html.jinja")


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("user"):
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("role"):
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

@app.route("/logout")
def logout():
    session.pop("user", None)
    session.pop("role", None)
    return redirect("/login")


@app.route("/rd", methods=["GET", "POST"])
def registration_expert():
    return render_template("registratie_pagina.html.jinja")

# Route setup for onderzoeksvragen page

@app.route("/api/onderzoeksvragen/userspecific")
@login_required
def getOnderzoeksvragen_userSpecific():
    vragen, status_code = Onderzoeksvragen.get_vragen()
    if status_code == 200:
        return vragen, 200
    else:
        return jsonify({"Error": "Geen data"}), status_code

@app.route("/onderzoeksvragen")
@login_required
def onderzoeksvragen():
    vragen, status_code = getOnderzoeksvragen_userSpecific()
    if status_code == 200:
        beperkingen = Onderzoeksvragen.getbeperkingen()
        beperkingen_lijst = [beperking["beperking"] for beperking in beperkingen]
        # return jsonify(vragen), 200
        return render_template("onderzoeksvragen.html.jinja", vragen=vragen, beperkingen=beperkingen_lijst, goedkeuren="0")
    else:
        return render_template("onderzoeksvragen.html.jinja", vragen=[], beperkingen=[], goedkeuren="0")

@app.route("/inschrijvingen/goedkeuren")
@admin_required
def inschrijvingen_goedkeuren():
    vragen = Onderzoeksvragen.get_vragen()
    return render_template("onderzoeksvragen.html.jinja", vragen=vragen, goedkeuren="1")



@app.route('/onderzoeksvragen_detail/<int:onderzoek_id>')
def onderzoeksvragen_detail(onderzoek_id):
    onderzoek = Onderzoeksvragen.get_onderzoek_vraag(onderzoek_id)
    if onderzoek:
        return render_template('onderzoeksvragen_detail.html.jinja', onderzoek=onderzoek)
    else:
        return "Onderzoeksvraag niet gevonden", 404

@app.route('/deelnemen', methods=['POST'])
def deelnemen():
    data = request.get_json()
    ervaringsdeskundige_id = data.get('ervaringsdeskundige_id')
    onderzoek_id = data.get('onderzoek_id')

    if not ervaringsdeskundige_id or not onderzoek_id:
        return jsonify({"error": "Verplichte velden ontbreken."}), 400
    response = Onderzoeksvragen.add_deelname(ervaringsdeskundige_id, onderzoek_id)
    return response

@app.route("/aanmaken-onderzoeksvraag", methods=["GET", "POST"])
#@login_required? Nog even kijken of het überhaupt nodig is met API-keys
@admin_required
def aanmaken_onderzoeksvraag():
    if request.method == "POST":
        return Onderzoeksvragen.add_onderzoeksvraag(request.form)

        # Genereer een API-sleutel voor het nieuwe onderzoek
        organisatie_id = 1
        new_api_key = ApiKeys.create_key(organisatie_id, new_onderzoek_id)

        # Geef de API-sleutel terug aan de gebruiker samen met het onderzoek_id
        return jsonify({
            "message": "Onderzoek succesvol aangemaakt",
            "api_key": new_api_key,
            "organisatie_id": organisatie_id,
            "onderzoek_id": new_onderzoek_id
        }), 201
    return render_template("onderzoeksvraag_aanmaken.html.jinja")

@app.route("/api/get-beperkingen")
def get_beperkingen():
    beperking = Onderzoeksvragen.getbeperkingen()
    return jsonify(beperking)

@app.route("/api/register", methods=["POST"])
def register_expert():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"error": "Ongeldige JSON"}), 400

    required_fields = ["voornaam", "achternaam", "email", "geslacht", "telefoonnummer", "wachtwoord"]

    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Veld '{field}' ontbreekt of is leeg"}), 400

    if "beperkingen" not in data or not isinstance(data["beperkingen"], list):
        data["beperkingen"] = []

    try:
        ervaringsdeskundige_id = DatabaseQueries.add_expert(
            data["voornaam"], data.get("tussenvoegsel", ""), data["achternaam"],
            data.get("geboortedatum", ""), data["email"], data["geslacht"],
            data["telefoonnummer"], data["wachtwoord"]
        )

        if not ervaringsdeskundige_id:
            return jsonify({"error": "Kon ervaringsdeskundige niet opslaan"}), 500

        if data["beperkingen"]:
            for beperking in data["beperkingen"]:
                DatabaseQueries.link_disability_to_expert(ervaringsdeskundige_id, beperking)

        return jsonify({"message": "Registratie succesvol", "ervaringsdeskundige_id": ervaringsdeskundige_id}), 201

    except Exception as e:
        return jsonify({"error": "Interne serverfout"}), 500

@app.route("/api/beperkingen")
def disability():
    query = request.args.get("query", "")

    if not query:
        return jsonify([]), 400

    return DatabaseQueries.get_disability(query)

@app.route("/overzicht")
@admin_required
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


@app.route("/api/onderzoeken/inschrijving/afwijzen/<int:onderzoek_id>/<int:user_id>", methods=["PATCH"])
@admin_required
def aanmeldingAfwijzen(onderzoek_id, user_id):
    return Inschrijvingen.inschrijvingAfwijzen(onderzoek_id, user_id)

@app.route("/api/onderzoeken/inschrijving/accepteren/<int:onderzoek_id>/<int:user_id>", methods=["PATCH"])
@admin_required
def aanmeldingAccepteren(onderzoek_id, user_id):
    return Inschrijvingen.inschrijvingAccepteren(onderzoek_id, user_id)

@app.route("/api/update-onderzoeksvraag", methods=["PATCH"])

def update_onderzoeksvraag():
    data = request.json

@app.route("/api/mijn-onderzoeken", methods=["GET"])
@login_required
def mijn_onderzoeken():
    email = session.get("user")
    expert_id = DatabaseQueries.get_expert_id_by_email(email)
    data = Onderzoeksvragen.get_mijn_onderzoeken(expert_id)
    return jsonify(data)

@app.route("/api/onderzoeken/inschrijvingen/<int:id>", methods=["GET"])
def getPendingInschrijvingen(id):
    return Inschrijvingen.getInschrijvingen(0, id)

@app.route("/api/onderzoeken/inschrijvingen/<int:id>/<int:status>", methods=["GET"])
def getInschrijvingenFiltered(id, status):
    return Inschrijvingen.getInschrijvingen(status, id)


@app.route('/api/register_organisatie', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # Controleer of alle vereiste velden aanwezig zijn
        required_fields = ['naam', 'email', 'telefoonnummer', 'contactpersoon', 'beschrijving', 'website', 'adres']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        api_key = DatabaseQueries.register_organisatie(data)

        return jsonify({
            'message': 'Organisatie succesvol geregistreerd!',
            'api_key': api_key,
            'note': 'Bewaar deze API key goed, je hebt deze nodig voor toekomstige API-aanvragen.'
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route("/generate-missing-api-keys", methods=["POST"])
def generate_missing_api_keys():
    from models.api_keys import ApiKeys

    organisaties_zonder_key = DatabaseQueries.get_organisaties_zonder_api_key()

    for organisatie in organisaties_zonder_key:
        organisatie_id = organisatie["organisatie_id"]
        ApiKeys.create_key(organisatie_id)

    return jsonify({
        "message": f"{len(organisaties_zonder_key)} API keys gegenereerd"
    })

@app.route("/api/aanvraag-api-key", methods=["POST"])
def aanvraag_api_key():
    data = request.get_json()

    if "organisatie_id" not in data:
        return jsonify({"error": "Organisatie_id is vereist"}), 400

    organisatie_id = data["organisatie_id"]

    # Controleer of er al een API-sleutel bestaat voor deze organisatie
    api_key = ApiKeys.get_by_organisatie_id(organisatie_id)
    if api_key:
        return jsonify({"message": "API sleutel bestaat al", "api_key": api_key}), 200

    # Genereer een nieuwe API-sleutel voor deze organisatie
    new_api_key = ApiKeys.create_key(organisatie_id)

    return jsonify({
        "message": "Nieuwe API sleutel gegenereerd",
        "api_key": new_api_key,
        "organisatie_id": organisatie_id
    }), 201



@app.route('/update_onderzoeksvraag/<int:onderzoek_id>', methods=['PATCH'])
def update_onderzoek_route(onderzoek_id):
    return Onderzoeksvragen.update_onderzoek_route(onderzoek_id)


if __name__ == "__main__":
    app.run(debug=True)