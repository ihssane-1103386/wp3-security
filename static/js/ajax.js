function onderzoekPopup(id){
    Swal.fire({
        title: "<strong>HTML <u>example</u></strong>",
        icon: "info",
        html: `
          <p>Given text: '${id}'</p>
        `,
        showCloseButton: true,
        focusConfirm: false,
        confirmButtonText: `
            Ok
        `,
        confirmButtonAriaLabel: "Ok"
      });
}

function getOnderzoeken() {

    const response = fetch("api/onderzoeken", {
        method: "GET"
    })
    .then((response) => {
        return response;
    });
}

function bekijkInschrijvingen(id) {
    fetch(`/api/onderzoeken/inschrijvingen/${id}`, {
        method: "GET"
    })
    .then(response => {
        if (response.status === 404) {
            return response.json().then(err => {
                console.log("Response error for 404:", err);
                Swal.fire({
                    title: "Geen inschrijvingen",
                    text: err.error || "Er zijn nog geen inschrijvingen voor dit onderzoek.",
                    icon: "error",
                    showCloseButton: true
                });
                return null;
            });
        }

        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${err.error || 'Unknown error'}`);
            });
        }

        return response.json();
    })
    .then(data => {
        if (data === null) return;

        if (data.error) {
            console.error("Error in response:", data);
            Swal.fire({
                title: "Geen inschrijvingen",
                text: data.error || "Er zijn nog geen inschrijvingen voor dit onderzoek.",
                icon: "error",
                showCloseButton: true
            });
            return;
        }

        if (!Array.isArray(data)) {
            console.error("Unexpected response format:", data);
            return;
        }

        let listHtml = "<ul>";
        data.forEach(element => {
            let naam = `${element[1]} ${element[2] ? element[2] + " " : ""}${element[3]}`;
            listHtml += `<li>Naam: ${naam} <button class='accept'>Accepteren</button><button onclick='aanmeldingAfwijzen(${element[6]}, ${element[7]})' class='decline'>Weigeren</button></li>`;
        });
        listHtml += "</ul>";

        Swal.fire({
            title: `Inschrijvingen ${data[0][0]}`,
            icon: "info",
            html: listHtml,
            showCloseButton: true,
            width: "70%"
        });
    })
    .catch(error => {
        console.error("Error fetching data:", error);

        // Just to prevent it to do both a 404 error and the 500 error
        if (error !== "404 - No data found") {
            Swal.fire({
                title: "Error",
                text: "Failed to fetch inschrijvingen",
                icon: "error",
                showCloseButton: true
            });
        }
    });
}

function aanmeldingAfwijzen(onderzoek_id, user_id){
    fetch(`/api/onderzoeken/inschrijving/afwijzen/${onderzoek_id}/${user_id}`, {
        method: "GET"
    })
    .then(response =>{
        if (response.status === 404) {
            return response.json().then(err => {
                console.log("Response error for 404:", err);
                Swal.fire({
                    title: "Geen inschrijvingen",
                    text: err.error || "Er zijn nog geen inschrijvingen voor dit onderzoek.",
                    icon: "error",
                    showCloseButton: true
                });
                return null;
            });
        }

        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${err.error || 'Unknown error'}`);
            });
        }

        return response.json();
    }).then(data => {
        if (data === null) return;

        if (data.error) {
            console.error("Error in response:", data);
            Swal.fire({
                title: "Er ging iets mis",
                text: data.error || "Er ging iets mis tijdens het afwijzen van deze inschrijving",
                icon: "error",
                showCloseButton: true
            });
            return;
        }

        if (!Array.isArray(data)) {
            console.error("Unexpected response format:", data);
            return;
        }


        Swal.fire({
            title: "Success",
            text: "Inschrijving is afgewezen",
            icon: "success",
            showCloseButton: true
        });
        return;
    })
    .catch(error => {
        console.error("Error fetching data:", error);

        // Just to prevent it to do both a 404 error and the 500 error
        if (error !== "404 - No data found") {
            Swal.fire({
                title: "Error",
                text: "Failed to update status",
                icon: "error",
                showCloseButton: true
            });
        }
    });
}