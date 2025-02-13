document.addEventListener("DOMContentLoaded", loadRegistrations);

function loadRegistrations() {
    fetch("/api/registrations")
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("registrationsTable");
            tbody.innerHTML = "";  // Clear the table first

            data.forEach((registration, index) => {
                const row = document.createElement("tr");
                let fullName = `${registration.voornaam} ${registration.tussenvoegsel ? registration.tussenvoegsel + ' ' : ''}${registration.achternaam}`;
                row.setAttribute('data-id', registration.ervaringsdeskundige_id);
                row.innerHTML =
                    `<td>${index + 1}</td>
                    <td>${fullName}</td>
                    <td>${registration.email}</td>
                    <td>
                        <button onclick="showPopup(${registration.ervaringsdeskundige_id})">View</button>
                    </td>`;
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
                row.remove();
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

