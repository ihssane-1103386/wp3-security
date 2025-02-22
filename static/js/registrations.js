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
                if (tableName === "registraties") {
                    let fullName = `${registration.voornaam} ${registration.tussenvoegsel ? registration.tussenvoegsel + ' ' : ''}${registration.achternaam}`;
                    row.setAttribute('data-id', registration.ervaringsdeskundige_id);
                    row.innerHTML =
                        `<td>${index + 1}</td>
                        <td>${fullName}</td>
                        <td>${registration.email}</td>
                        <td>
                            <button onclick="showPopup('registraties', ${registration.ervaringsdeskundige_id})">Details</button>
                        </td>`;
                } else if (tableName === "inschrijvingen") {
                    row.setAttribute('data-id', registration.onderzoek_id);
                    row.innerHTML = `
                        <td>${registration.onderzoek}</td>
                        <td>${registration.ervaringsdeskundige}</td>
                        <td>${registration.datum}</td>
                        <td>
                            <button onclick="showPopup('inschrijvingen','${registration.ervaringsdeskundige_id}-${registration.onderzoek_id}')">Details</button>
                        </td>`;
                } else if (tableName === "onderzoeksaanvragen") {
                    row.setAttribute('data-id', registration.titel);
                    row.innerHTML = `
                        <td>${registration.titel}</td>
                        <td>${registration.organisatie}</td>
                        <td>${registration.creatie_datum}</td>
                        <td>
                            <button onclick="showPopup('onderzoeksaanvragen', ${registration.ervaringsdeskundige_id})">Details</button>
                        </td>`;
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
                    document.getElementById('popupText').textContent = "";
                } else if (tableName === "inschrijvingen"){
                    document.getElementById('popupName').textContent = `${registration.ervaringsdeskundige}`;
                    document.getElementById('popupBirthdate').textContent = `${registration.onderzoek}`;
                    document.getElementById('popupGender').textContent = "";
                    document.getElementById('popupEmail').textContent = "";
                    document.getElementById('popupPhoneNumber').textContent = "";
                    document.getElementById('popupText').textContent = `wil deelnemen aan het volgende onderzoek: `;
                }
                    document.getElementById('popup').style.display = 'block';

                    document.getElementById('acceptButton').onclick = () => processRegistration(id, 1);
                    document.getElementById('rejectButton').onclick = () => processRegistration(id, 2);
                } else {
                    console.error("Geen data ontvangen voor ID:", id);
            }
        })
        .catch(error => console.error("Error:", error));
}

function processRegistration(id, status) {
    fetch("/api/registrations/status", {
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

