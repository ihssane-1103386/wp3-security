document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('aanvraag-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        let formData = new FormData(form);
        // stuurt de form data naar de server
        fetch(form.action, {
            method: 'POST',
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
                form.reset();
            })
    });

      fetch('/api/get-beperkingen', {
          method: 'GET'
      })
        .then(response => response.json())
        .then(data => {
          const select = document.getElementById('beperking');
          data.forEach(beperking => {
            const option = document.createElement('option');
            option.value = beperking.beperkingen_id;
            option.textContent = beperking.beperking;
            select.appendChild(option);
          });
        })
        .catch(error => console.error('Error fetching beperkingen:', error));
    });