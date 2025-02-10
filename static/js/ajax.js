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
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                return xhr.responseText, 200;
            } else if (xhr.status === 404){
                return "Geen data gevonden!", 404
            } else {
                return "Er ging iets mis", 500
            }
        }
    };

    xhr.open('GET', `/onderzoeken/inschrijvingen`);
    xhr.send();
}