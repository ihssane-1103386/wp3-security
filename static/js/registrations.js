document.addEventListener("DOMContentLoaded", function () {
    loadRegistrations('registraties');
});


function updateTableHeader(tableName) {
    const thead = document.getElementById("tableHeader");
    if (tableName === "registraties") {
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Naam</th>
                <th>Email</th>
                <th> </th>
            </tr>`;
    } else if (tableName === "inschrijvingen") {
        thead.innerHTML = `
            <tr>
                <th>Onderzoek</th>
                <th>Ervaringsdeskundige</th>
                <th>Datum</th>
                <th> </th>
            </tr>`;
    } else if (tableName === "onderzoeksaanvragen") {
        thead.innerHTML = `
            <tr>
                <th>Onderzoekstitel</th>
                <th>Organisatie</th>
                <th>Datum</th>
                <th> </th>
            </tr>`;
    }
}


function loadRegistrations(tableName) {
    updateTableHeader(tableName);
    fetch(`/api/registrations/${tableName}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("registrationsTable");
            tbody.innerHTML = "";

            data.forEach((registration, index) => {
                const row = document.createElement("tr");
                switch(tableName) {
                    case "registraties": {
                        let fullName = `${registration.voornaam} ${registration.tussenvoegsel ? registration.tussenvoegsel + ' ' : ''}${registration.achternaam}`;
                        row.setAttribute('data-id', registration.ervaringsdeskundige_id);
                        row.innerHTML =
                            `<td>${index + 1}</td>
                            <td>${fullName}</td>
                            <td>${registration.email}</td>
                            <td>
                                <button onclick="showPopup('registraties', ${registration.ervaringsdeskundige_id})">Details</button>
                            </td>`;
                        break;
                    }
                    case "inschrijvingen": {
                        row.setAttribute('data-id', `${registration.ervaringsdeskundige_id}-${registration.onderzoek_id}`);
                        row.innerHTML = `
                            <td>${registration.onderzoek}</td>
                            <td>${registration.ervaringsdeskundige}</td>
                            <td>${registration.datum}</td>
                            <td>
                                <button onclick="showPopup('inschrijvingen','${registration.ervaringsdeskundige_id}-${registration.onderzoek_id}')">Details</button>
                            </td>`;
                        break;
                    }
                    case "onderzoeksaanvragen": {
                        row.setAttribute('data-id', registration.onderzoek_id);
                        row.innerHTML = `
                            <td>${registration.titel}</td>
                            <td>${registration.organisatie}</td>
                            <td>${registration.creatie_datum}</td>
                            <td>
                                <button onclick="showPopup('onderzoeksaanvragen', ${registration.onderzoek_id})">Details</button>
                            </td>`;
                        break;
                    }
                    default: {
                        console.error("Unknown table name:", tableName);
                    }
                }
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error("Error:", error));
}

function showPopup(tableName, id) {
    fetch(`/api/registrations/${tableName}/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const registration = data[0];
                if (tableName === "registraties") {
                    document.getElementById('popupName').textContent = `${registration.voornaam} ${registration.tussenvoegsel ? registration.tussenvoegsel + ' ' : ''}${registration.achternaam}`;
                    document.getElementById('popupBirthdate').textContent = `Geboortedatum: ${registration.geboortedatum}`;
                    document.getElementById('popupGender').textContent = `Geslacht: ${registration.geslacht}`;
                    document.getElementById('popupEmail').textContent = `Email: ${registration.email}`;
                    document.getElementById('popupPhoneNumber').textContent = `Telefoonnummer: ${registration.telefoonnummer}`;
                    document.getElementById('popupDisabilities').textContent = `Beperkingen: ${registration.beperkingen || "Geen beperkingen"}`;
                    document.getElementById('popupText').textContent = "";
                } else if (tableName === "inschrijvingen"){
                    document.getElementById('popupName').textContent = `${registration.ervaringsdeskundige}`;
                    document.getElementById('popupBirthdate').textContent = `${registration.onderzoek}`;
                    document.getElementById('popupGender').textContent = "";
                    document.getElementById('popupEmail').textContent = "";
                    document.getElementById('popupPhoneNumber').textContent = "";
                    document.getElementById('popupDisabilities').textContent = "";
                    document.getElementById('popupText').textContent = `wil deelnemen aan het volgende onderzoek: `;
                } else if (tableName === "onderzoeksaanvragen"){
                    document.getElementById('popupName').textContent = registration.titel;
                    document.getElementById('popupBirthdate').textContent = `${registration.beschrijving}`;
                    document.getElementById('popupGender').textContent = `Datum: ${registration.datum} tot ${registration.datum_tot}`;
                    document.getElementById('popupEmail').textContent = "";
                    document.getElementById('popupDisabilities').textContent = "";
                    document.getElementById('popupPhoneNumber').textContent = `Max deelnemers: ${registration.max_deelnemers}`;
                    let begeleiderStatus;
                    if (registration.begeleider == 1) {
                      begeleiderStatus = "Ja";
                    } else {
                      begeleiderStatus = "Nee";
                    }
                    document.getElementById('popupText').textContent = `Type onderzoek: ${registration.type_onderzoek} | Plaats: ${registration.plaats} 
                    | Beloning: ${registration.beloning} | Leeftijd: ${registration.min_leeftijd} - ${registration.max_leeftijd} | Begeleider: ${begeleiderStatus}`;
                }
                    document.getElementById('popup').style.display = 'block';

                    document.getElementById('acceptButton').onclick = () => processRegistration(tableName, id, 1);
                    document.getElementById('rejectButton').onclick = () => processRegistration(tableName, id, 2);
                } else {
                    console.error("Geen data ontvangen voor ID:", id);
            }
        })
        .catch(error => console.error("Error:", error));
}

function processRegistration(tableName, id, status) {
    fetch(`/api/registrations/${tableName}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id: id, status: status})
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Status updated successfully") {
                const row = document.querySelector(`tr[data-id='${id}']`);
                if (row) {
                    row.style.transition = "opacity 0.5s";
                    row.style.opacity = "0";
                    setTimeout(() => {
                        row.remove();
                        loadRegistrations(tableName);
                    }, 500);
                }
                closePopup('popup');
            } else {
                console.error("Failed to update status");
            }
        })
        .catch(error => console.error("Error:", error));
}


function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

