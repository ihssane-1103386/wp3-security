from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def homepagina():
    return render_template("homepagina.html")

@app.route("/onderzoeksvragen")
def onderzoeksvragen():
    return render_template("onderzoeksvragen.html")

app.run()