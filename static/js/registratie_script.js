document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const beperkingenInput = document.getElementById("beperkingen");
    const suggestionsList = document.getElementById("suggestions");
    const selectedBeperkingenContainer = document.getElementById("selected-beperkingen");
    let selectedBeperkingen = [];

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const wachtwoord = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        if (wachtwoord !== confirmPassword) {
            alert("Wachtwoorden komen niet overeen. Probeer opnieuw.");
            return;
        }

        const formData = {
            voornaam: document.getElementById("voornaam").value.trim(),
            tussenvoegsel: document.getElementById("tussenvoegsel").value.trim(),
            achternaam: document.getElementById("achternaam").value.trim(),
            geboortedatum: document.getElementById("geboortedatum").value.trim(),
            email: document.getElementById("email").value.trim(),
            geslacht: document.getElementById("geslacht").value,
            telefoonnummer: document.getElementById("mobiel").value.trim(),
            adres: document.getElementById("adres").value.trim(),
            beperkingen: selectedBeperkingen,
            wachtwoord: wachtwoord
        };

        fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);

            if (data?.ervaringsdeskundige_id) {
                alert("Registratie succesvol!");
                form.reset();
                selectedBeperkingen = [];
                selectedBeperkingenContainer.innerHTML = "";
            } else {
                alert("Er is een fout opgetreden bij de registratie.");
            }
        })
        .catch(error => console.error("Fout bij verzenden:", error));
    });
    beperkingenInput.addEventListener("input", function() {
        let query = beperkingenInput.value.trim();
        if (query.length < 2) {
            suggestionsList.innerHTML = "";
            return;
        }

        fetch(`/api/beperkingen?query=${query}`)
            .then(response => response.json())
            .then(data => {
                suggestionsList.innerHTML = "";
                data.forEach(item => {
                    let beperking = item.beperking;
                    let listItem = document.createElement("li");
                    listItem.textContent = beperking;
                    listItem.onclick = function() {
                        addBeperking(beperking);
                        beperkingenInput.value = "";
                        suggestionsList.innerHTML = "";
                    };
                    suggestionsList.appendChild(listItem);
                });

                if (data.length === 0) {
                    let listItem = document.createElement("li");
                    listItem.textContent = "Geen resultaten gevonden";
                    listItem.style.color = "#C62828";
                    suggestionsList.appendChild(listItem);
                }
            })
            .catch(error => console.error("Fout bij ophalen van beperkingen:", error));
    });

    function addBeperking(beperking) {
        if (!selectedBeperkingen.includes(beperking)) {
            selectedBeperkingen.push(beperking);
            updateSelectedBeperkingen();
        }
    }

    function updateSelectedBeperkingen() {
        selectedBeperkingenContainer.innerHTML = "";
        selectedBeperkingen.forEach(beperking => {
            let tag = document.createElement("span");
            tag.classList.add("beperking-tag");
            tag.textContent = beperking;

            let removeBtn = document.createElement("button");
            removeBtn.textContent = "✖";
            removeBtn.classList.add("remove-beperking");
            removeBtn.onclick = function() {
                selectedBeperkingen = selectedBeperkingen.filter(b => b !== beperking);
                updateSelectedBeperkingen();
            };

            tag.appendChild(removeBtn);
            selectedBeperkingenContainer.appendChild(tag);
        });
    }
});
