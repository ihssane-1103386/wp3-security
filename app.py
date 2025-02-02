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

if __name__ == '__main__':
    app.run(debug=True)