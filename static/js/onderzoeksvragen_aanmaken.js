const form = document.getElementById('aanvraag-form');
form.addEventListener('submit', function (event) {
    event.preventDefault();

    let formData = new FormData(form);
    // stuurt de form data naar de server
    fetch(form.action, {
        method: form.method,
        body: formData
    })
        .then(function (response) {
            return response.json();
        })
        .then(function () {
            Swal.fire({
                title: "Voltooid!",
                text: "Uw onderzoeksvraag is aangemaakt!",
                icon: "success"
            });
        })
});
