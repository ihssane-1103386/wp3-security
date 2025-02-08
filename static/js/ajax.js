function onderzoekPopup(id) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                Swal.fire({
                    title: "<strong>Inschrijvingen</strong>",
                    icon: "info",
                    html: `
                        <p>Received data: ${xhr.responseText}</p>  <!-- Display response -->
                    `,
                    showCloseButton: true,
                    focusConfirm: false,
                    confirmButtonText: "Ok",
                    confirmButtonAriaLabel: "Ok"
                });
            } else if (xhr.status === 404){
                Swal.fire({
                    title: "Error",
                    icon: "error",
                    text: "Data niet gevonden",
                    confirmButtonText: "Ok"
                });
            } else {
                Swal.fire({
                    title: "Error",
                    icon: "error",
                    text: "Er ging iets mis, probeer het later opnieuw.",
                    confirmButtonText: "Ok"
                });
            }
        }
    };

    xhr.open('GET', `/onderzoeken/inschrijvingen/${id}`);
    xhr.send();
}
