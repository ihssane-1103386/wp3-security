from flask import Flask, render_template

app = Flask(__name__)

# Default Route
@app.route("/")
def homepagina():
    return render_template("homepagina.html")

@app.errorhandler(404)
def notFound(e):
    return render_template("pagina-niet-gevonden.html")

# Route setup for onderzoeksvragen page
@app.route("/onderzoeksvragen")
def onderzoeksvragen():
    return render_template("onderzoeksvragen.html")

@app.route("/aanmaken-onderzoeksvraag")
def aanmaken_onderzoeksvraag():
    return render_template("onderzoeksvraag_aanmaken.html")

@app.route("/registraties")
def registraties():
    return render_template("registraties.html")

@app.route("/rd")
def registratie_deskundige():
    return render_template("registratie_pagina.html")

app.run(debug=True)