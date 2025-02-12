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