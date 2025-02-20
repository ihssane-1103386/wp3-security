document.addEventListener("DOMContentLoaded", loadRegistrations);

function loadRegistrations(tableName) {
    fetch(`/api/registrations/${tableName}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("registrationsTable");
            tbody.innerHTML = "";

            data.forEach((registration, index) => {
                const row = document.createElement("tr");
                if (tableName === "registraties"){
                   let fullName = `${registration.voornaam} ${registration.tussenvoegsel ? registration.tussenvoegsel + ' ' : ''}${registration.achternaam}`;
                    row.setAttribute('data-id', registration.ervaringsdeskundige_id);
                    row.innerHTML =
                        `<td>${index + 1}</td>
                        <td>${fullName}</td>
                        <td>${registration.email}</td>
                        <td>
                            <button onclick="showPopup(${registration.ervaringsdeskundige_id})">Details</button>
                        </td>`;
                }
                else if (tableName === "inschrijvingen") {
                    row.setAttribute('data-id', registration.onderzoek_id);
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${registration.onderzoek_id}</td>
                        <td>${registration.datum}</td>`;
                } else if (tableName === "onderzoeksaanvragen") {
                    row.setAttribute('data-id', registration.titel);
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${registration.titel}</td>
                        <td>${registration.creatie_datum}</td>`;
                }
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error("Error:", error));
}

function showPopup(id) {
    fetch(`/api/registrations/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const registration = data[0];

                document.getElementById('popupName').textContent = `${registration.voornaam} ${registration.tussenvoegsel ? registration.tussenvoegsel + ' ' : ''}${registration.achternaam}`;
                document.getElementById('popupBirthdate').textContent = `Geboortedatum: ${registration.geboortedatum}`;
                document.getElementById('popupGender').textContent = `Geslacht: ${registration.geslacht}`;
                document.getElementById('popupEmail').textContent = `Email: ${registration.email}`;
                document.getElementById('popupPhoneNumber').textContent = `Telefoonnummer: ${registration.telefoonnummer}`;
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
        body: JSON.stringify({ id: id, status: status })
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
                    loadRegistrations();
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

