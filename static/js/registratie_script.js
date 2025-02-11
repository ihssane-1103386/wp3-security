document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const submitButton = document.querySelector(".btn-register");
    const cancelButton = document.querySelector(".btn-cancel");
    const beperkingenInput = document.getElementById("beperkingen");
    const suggestionsList = document.getElementById("suggestions");
    const selectedBeperkingenContainer = document.getElementById("selected-beperkingen");

    let selectedBeperkingen = [];

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        let valid = true;
        const inputs = form.querySelectorAll("input, select, textarea");

        inputs.forEach(input => {
            if (!input.value.trim() && input.id !== "beperkingen") {
                input.style.border = "2px solid #C62828";
                valid = false;
            } else {
                input.style.border = "1px solid #ccc";
            }
        });

        if (selectedBeperkingen.length === 0) {
            beperkingenInput.style.border = "2px solid #C62828";
            valid = false;
        } else {
            beperkingenInput.style.border = "1px solid #ccc";
        }

        if (valid) {
            alert("Registratie succesvol ingediend!");
            form.reset();
            suggestionsList.innerHTML = "";
            selectedBeperkingenContainer.innerHTML = "";
            selectedBeperkingen = [];
        } else {
            alert("Vul alle velden correct in.");
        }
    });


    cancelButton.addEventListener("click", function() {
        form.reset();
        suggestionsList.innerHTML = "";
        selectedBeperkingenContainer.innerHTML = "";
        selectedBeperkingen = [];
        const inputs = form.querySelectorAll("input, select, textarea");
        inputs.forEach(input => input.style.border = "1px solid #ccc");
    });


    beperkingenInput.addEventListener("input", fetchSuggestions);

    function fetchSuggestions() {
        let query = beperkingenInput.value.trim();

        if (query.length < 2) {
            suggestionsList.innerHTML = "";
            return;
        }

        suggestionsList.style.width = beperkingenInput.offsetWidth + "px";

        fetch(`/api/beperkingen?query=${query}`)
            .then(response => response.json())
            .then(data => {
                suggestionsList.innerHTML = "";

                data.forEach(item => {
                    let beperking = item.beperking || item.naam || "";

                    if (!beperking) return;

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
            .catch(error => console.error("Error fetching suggestions:", error));
    }

    function addBeperking(beperking) {
        if (!selectedBeperkingen.includes(beperking)) {
            selectedBeperkingen.push(beperking);
            updateSelectedBeperkingen();
        }
    }

    function removeBeperking(beperking) {
        selectedBeperkingen = selectedBeperkingen.filter(b => b !== beperking);
        updateSelectedBeperkingen();
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
                removeBeperking(beperking);
            };

            tag.appendChild(removeBtn);
            selectedBeperkingenContainer.appendChild(tag);
        });
    }
});
