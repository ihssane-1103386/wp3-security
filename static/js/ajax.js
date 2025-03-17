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
        confirmButtonAriaLabel: "Ok",
        didOpen: () => {
            document.querySelector('.swal2-popup').setAttribute('role', 'alert');
            
            const icon = document.querySelector('.swal2-icon.swal2-info');
            if (icon) {
                icon.setAttribute('aria-label', 'Informatie Icoontje');
            }
        }
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

                if (document.getElementById("inschrijvingen-list")) {
                    Swal.close();
                } else {
                    Swal.fire({
                        title: "Geen inschrijvingen",
                        text: err.error || "Er zijn nog geen inschrijvingen voor dit onderzoek.",
                        icon: "error",
                        showCloseButton: true,
                        didOpen: () => {
                            document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                            const icon = document.querySelector('.swal2-icon.swal2-error');
                            if (icon) {
                                icon.setAttribute('aria-label', 'Error icoontje');
                            }
                        }
                    });
                }
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
                showCloseButton: true,
                didOpen: () => {
                    document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                    
                    const icon = document.querySelector('.swal2-icon.swal2-error');
                    if (icon) {
                        icon.setAttribute('aria-label', 'Error Icoontje');
                    }
                }
            });
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            Swal.close();
            return;
        }

        let listHtml = "<ul id='inschrijvingen-list'>";
        data.forEach(element => {
            let naam = `${element[1]} ${element[2] ? element[2] + " " : ""}${element[3]}`;
            listHtml += `<li>Naam: ${naam} 
                <button onclick='aanmeldingAccepteren(${element[6]}, ${element[7]})' class='accept'>Accepteren</button>
                <button onclick='aanmeldingAfwijzen(${element[6]}, ${element[7]})' class='decline'>Weigeren</button>
            </li>`;
        });
        listHtml += "</ul>";

        let existingList = document.getElementById("inschrijvingen-list");
        if (existingList) {
            existingList.innerHTML = listHtml;
        } else {
            Swal.fire({
                title: `Inschrijvingen ${data[0][0]}`,
                icon: "info",
                html: listHtml,
                showCloseButton: true,
                width: "70%",
                didOpen: () => {
                    document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                    
                    const icon = document.querySelector('.swal2-icon.swal2-info');
                    if (icon) {
                        icon.setAttribute('aria-label', 'Informatie icoontje');
                    }
                }
            });
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);

        if (error !== "404 - No data found") {
            Swal.fire({
                title: "Error",
                text: "Failed to fetch inschrijvingen",
                icon: "error",
                showCloseButton: true,
                didOpen: () => {
                    document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                    
                    const icon = document.querySelector('.swal2-icon.swal2-error');
                    if (icon) {
                        icon.setAttribute('aria-label', 'Error icoontje');
                    }
                }
            });
        }
    });
}


function aanmeldingAccepteren(onderzoek_id, user_id){
    fetch(`/api/onderzoeken/inschrijving/accepteren/${onderzoek_id}/${user_id}`, {
        method: "PATCH"
    })
    .then(response =>{
        if (response.status === 404) {
            return response.json().then(err => {
                console.log("Response error for 404:", err);
                Swal.fire({
                    title: "Geen inschrijvingen",
                    text: err.error || "Er zijn nog geen inschrijvingen voor dit onderzoek.",
                    icon: "error",
                    showCloseButton: true,
                    didOpen: () => {
                        document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                        
                        const icon = document.querySelector('.swal2-icon.swal2-error');
                        if (icon) {
                            icon.setAttribute('aria-label', 'Error icoontje');
                        }
                    }
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
                showCloseButton: true,
                didOpen: () => {
                    document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                    
                    const icon = document.querySelector('.swal2-icon.swal2-error');
                    if (icon) {
                        icon.setAttribute('aria-label', 'Error icoontje');
                    }
                }
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
            showCloseButton: true,
            didOpen: () => {
                document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                
                const icon = document.querySelector('.swal2-icon.swal2-success');
                if (icon) {
                    icon.setAttribute('aria-label', 'Success icoontje');
                }
            }
        });
        return;
    })
    .catch(error => {
        console.error("Error fetching data:", error);

        // Just to prevent it to do both a 404 error and the 500 error
        if (!error.message.includes("404")) {
            Swal.fire({
                title: "Error",
                text: "Failed to update status",
                icon: "error",
                showCloseButton: true,
                didOpen: () => {
                    document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                    const icon = document.querySelector('.swal2-icon.swal2-error');
                    if (icon) {
                        icon.setAttribute('aria-label', 'Error icoontje');
                    }
                }
            });
        }
    }).finally(() => {
        bekijkInschrijvingen(onderzoek_id);
    });
}

function aanmeldingAfwijzen(onderzoek_id, user_id){
    fetch(`/api/onderzoeken/inschrijving/afwijzen/${onderzoek_id}/${user_id}`, {
        method: "PATCH"
    })
    .then(response =>{
        if (response.status === 404) {
            return response.json().then(err => {
                console.log("Response error for 404:", err);
                Swal.fire({
                    title: "Geen inschrijvingen",
                    text: err.error || "Er zijn nog geen inschrijvingen voor dit onderzoek.",
                    icon: "error",
                    showCloseButton: true,
                    didOpen: () => {
                        document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                        const icon = document.querySelector('.swal2-icon.swal2-error');

                        if (icon) {
                            icon.setAttribute('aria-label', 'Error icoontje');
                        }
                    }
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
                showCloseButton: true,
                didOpen: () => {
                    document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                    const icon = document.querySelector('.swal2-icon.swal2-error');
                    if (icon) {
                        icon.setAttribute('aria-label', 'Error icoontje');
                    }
                }
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
            showCloseButton: true,
            didOpen: () => {
                document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                const icon = document.querySelector('.swal2-icon.swal2-success');
                if (icon) {
                    icon.setAttribute('aria-label', 'Success icoontje');
                }
            }
        });
        return;
    })
    .catch(error => {
        console.error("Error fetching data:", error);

        // Just to prevent it to do both a 404 error and the 500 error
        if (!error.message.includes("404")) {
            Swal.fire({
                title: "Error",
                text: "Failed to update status",
                icon: "error",
                showCloseButton: true,
                didOpen: () => {
                    document.querySelector('.swal2-popup').setAttribute('role', 'alert');
                    const icon = document.querySelector('.swal2-icon.swal2-error');
                    if (icon) {
                        icon.setAttribute('aria-label', 'Error icoontje');
                    }
                }
            });
        }
    }).finally(() =>{
        bekijkInschrijvingen(onderzoek_id);
    });
}

function refreshOnderzoeken(){
    fetch("/api/onderzoeksvragen/userspecific", {
        method: "GET"
    }).then(response => response.json())
    .then(data =>{
        console.log(data)
        var tbody = document.getElementById("onderzoeksvragen")
        if (Array.isArray(data)){
            var html = "";
            var vragen = data;
            vragen.forEach(vraag => {
                html += `<tr class="clickable" data-title="${vraag.titel}" data-info="${vraag.beschrijving }" data-deelnemers="${vraag.max_deelnemers }" data-beschikbaar="${ vraag.beschikbaar }"
                            data-onderzoek-id ="${vraag.onderzoek_id}" data-status="${vraag.status}" data-id="${vraag.onderzoek_id }" tabindex="0" role="button" aria-label="Bekijk details voor ${vraag.titel}">
                                <td>${vraag.titel}</td>
                                <td>${vraag.beperking }</td>
                                <td>${vraag.max_deelnemers}</td>
                            </tr>`
            });
            tbody.innerHTML = html;
            updateButtons()
        } else{
            tbody.innerHTML = ""
        }
    }).catch(error => {
        console.error("Error fetching data:", error);
        tbody.innerHTML = ""; // Optionally handle error case
    });
}