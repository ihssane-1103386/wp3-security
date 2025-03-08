document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const beperkingenInput = document.getElementById("beperkingen");
    const suggestionsList = document.getElementById("suggestions");
    const selectedBeperkingenContainer = document.getElementById("selected-beperkingen");
    const errorMessageContainer = document.getElementById("error-message");
    const successMessageContainer = document.getElementById("success-message");
    let selectedBeperkingen = [];
    let selectedIndex = -1;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearMessages();

        const wachtwoord = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        if (wachtwoord !== confirmPassword) {
            showErrorMessage("Wachtwoorden komen niet overeen.", document.getElementById("password"));
            return;
        }

        const formData = {
            voornaam: getValue("voornaam"),
            tussenvoegsel: getValue("tussenvoegsel"),
            achternaam: getValue("achternaam"),
            geboortedatum: getValue("geboortedatum"),
            email: getValue("email"),
            geslacht: getValue("geslacht"),
            telefoonnummer: getValue("mobiel"),
            adres: getValue("adres"),
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
                if (data.ervaringsdeskundige_id) {
                    showSuccessMessage("Registratie succesvol!");
                    resetForm();
                } else {
                    showErrorMessage(data.error || "Er is een fout opgetreden bij de registratie.");
                }
            })
            .catch(error => {
                console.error("Fout bij verzenden:", error);
                showErrorMessage("Kan geen verbinding maken met de server.");
            });
    });

    beperkingenInput.addEventListener("input", function () {
        let query = beperkingenInput.value.trim();
        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        fetch(`/api/beperkingen?query=${query}`)
            .then(response => response.json())
            .then(data => {
                suggestionsList.innerHTML = "";
                suggestionsList.style.display = "block";
                beperkingenInput.setAttribute("aria-expanded", "true");

                if (data.length === 0) {
                    addListItem("Geen resultaten gevonden", true);
                } else {
                    data.forEach((item, index) => {
                        addListItem(item.beperking || item, false, index);
                    });
                }

                selectedIndex = -1;
            })
            .catch(error => {
                console.error("Fout bij ophalen beperkingen:", error);
                showErrorMessage("Kan geen beperkingen ophalen.");
            });
    });

    function addListItem(text, isDisabled, index) {
        let listItem = document.createElement("li");
        listItem.textContent = text;
        listItem.setAttribute("role", "option");
        listItem.setAttribute("tabindex", "0");

        if (isDisabled) {
            listItem.setAttribute("aria-disabled", "true");
            listItem.style.color = "#B71C1C";
        } else {
            listItem.onclick = () => selectSuggestion(text);
            listItem.onkeydown = (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    selectSuggestion(text);
                }
            };
        }

        listItem.dataset.index = index;
        suggestionsList.appendChild(listItem);
    }

    function selectSuggestion(beperking) {
        if (!selectedBeperkingen.includes(beperking)) {
            selectedBeperkingen.push(beperking);
            updateSelectedBeperkingen();
        }
        beperkingenInput.value = "";
        hideSuggestions();
    }

    function updateSelectedBeperkingen() {
        selectedBeperkingenContainer.innerHTML = "";
        selectedBeperkingen.forEach(beperking => createBeperkingTag(beperking));
    }

    function createBeperkingTag(beperking) {
        let tag = document.createElement("span");
        tag.classList.add("beperking-tag");
        tag.textContent = beperking;

        let removeBtn = document.createElement("button");
        removeBtn.textContent = "✖";
        removeBtn.classList.add("remove-beperking");
        removeBtn.setAttribute("aria-label", `Verwijder beperking ${beperking}`);

        removeBtn.onclick = function () {
            selectedBeperkingen = selectedBeperkingen.filter(b => b !== beperking);
            updateSelectedBeperkingen();
        };

        tag.appendChild(removeBtn);
        selectedBeperkingenContainer.appendChild(tag);
    }

    function hideSuggestions() {
        suggestionsList.style.display = "none";
        beperkingenInput.setAttribute("aria-expanded", "false");
    }

    beperkingenInput.addEventListener("keydown", function (event) {
        let items = suggestionsList.querySelectorAll("li:not([aria-disabled='true'])");

        if (event.key === "ArrowDown") {
            event.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateActiveItem(items);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateActiveItem(items);
        } else if (event.key === "Enter" && selectedIndex >= 0) {
            event.preventDefault();
            selectSuggestion(items[selectedIndex].textContent);
        } else if (event.key === "Escape") {
            hideSuggestions();
        }
    });

    function updateActiveItem(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add("active");
                item.setAttribute("aria-selected", "true");
                item.scrollIntoView({ block: "nearest" });
            } else {
                item.classList.remove("active");
                item.setAttribute("aria-selected", "false");
            }
        });
    }

    function showErrorMessage(message, focusElement = null) {
        errorMessageContainer.textContent = message;
        errorMessageContainer.style.display = "block";
        errorMessageContainer.setAttribute("role", "alert");
        errorMessageContainer.setAttribute("aria-live", "assertive");

        if (focusElement) {
            focusElement.focus();
        }
    }

    function showSuccessMessage(message) {
        successMessageContainer.textContent = message;
        successMessageContainer.style.display = "block";
        successMessageContainer.setAttribute("role", "status");
        successMessageContainer.setAttribute("aria-live", "polite");

        successMessageContainer.focus();
    }

    function resetForm() {
        form.reset();
        selectedBeperkingen = [];
        updateSelectedBeperkingen();
        document.getElementById("voornaam").focus();
    }

    document.querySelector(".btn-cancel").addEventListener("click", function (event) {
        event.preventDefault();  // Voorkomt standaard reset-gedrag
        resetForm();
    });



    function getValue(id) {
        return document.getElementById(id)?.value.trim() || "";
    }

    document.addEventListener("click", function (event) {
        if (!beperkingenInput.contains(event.target) && !suggestionsList.contains(event.target)) {
            hideSuggestions();
        }
    });
});
