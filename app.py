import json
from flask import Flask, jsonify, render_template, request
from models.inschrijvingen import Inschrijvingen
from models.onderzoeksvragen import Onderzoeksvragen

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
    return render_template("onderzoeksvragen.html")

@app.route("/api/aanmaken-onderzoeksvraag", methods=["GET", "POST"])
def aanmaken_onderzoeksvraag():
    if request.method == "POST":
        return Onderzoeksvragen.add_onderzoeksvraag(request.form)
    return render_template("onderzoeksvraag_aanmaken.html")

@app.route("/registraties")
def registraties():
    return render_template("registraties.html")

@app.route("/rd")
def registratie_deskundige():
    return render_template("registratie_pagina.html")


# Api Routes
@app.route("/onderzoeken/inschrijvingen/<int:id>", methods=["GET"])
def getInschrijvingen(id):
    return Inschrijvingen.getInschrijvingen(id)

app.run(debug=True)