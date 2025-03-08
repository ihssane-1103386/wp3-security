import requests
import json

# URL van je API endpoint
url = "http://localhost:5000/api/update-onderzoeksvraag"

# Gegevens die je wilt bijwerken
data = {
    "onderzoek_id": 3,
    "titel": "Test",
    "beschrijving": "Test Test",
    "max_deelnemers": 50
}

# Headers instellen voor content-type JSON
headers = {
    "Content-Type": "application/json"
}

# Verstuur de PATCH-request
response = requests.patch(url, data=json.dumps(data), headers=headers)

# Bekijk de status en het antwoord van de server
if response.status_code == 200:
    print("Success:", response.json())
else:
    print("Fout:", response.status_code, response.text)
