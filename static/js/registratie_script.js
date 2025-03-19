document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const beperkingenInput = document.getElementById("beperkingen");
    const suggestionsList = document.getElementById("suggestions");
    const selectedBeperkingenContainer = document.getElementById("selected-beperkingen");
    const errorMessageContainer = document.getElementById("error-message");
    const successMessageContainer = document.getElementById("success-message");
    const adminToggle = document.getElementById("admin-toggle");
    const adminSwitch = document.getElementById("admin-checkbox");
    const geboortedatumInput = document.getElementById("geboortedatum");
    let isSubmitting = false;
    let selectedBeperkingen = [];
    let selectedIndex = -1;

    if (window.formEventListenerAdded) {
        return;
    }
    window.formEventListenerAdded = true;

    createParentSection();

    function createParentSection() {
        if (document.getElementById("ouder-section")) {
            return;
        }

        const ouderSection = document.createElement("div");
        ouderSection.id = "ouder-section";
        ouderSection.className = "ouder-section";
        ouderSection.style.display = "none";

        ouderSection.innerHTML = `
            <h3>Ouder/Voogd Informatie</h3>
            <div class="form-group">
                <label for="ouder-naam">Naam Ouder/Voogd</label>
                <input type="text" id="ouder-naam" name="ouder-naam" placeholder="Volledige naam" aria-required="false" aria-describedby="ouder-naam-help">
                <span id="ouder-naam-help" class="sr-only">Vul de volledige naam van uw ouder of voogd in.</span>
            </div>
            
            <div class="form-group">
                <label for="ouder-email">E-mail Ouder/Voogd</label>
                <input type="email" id="ouder-email" name="ouder-email" placeholder="voorbeeld@email.com" aria-required="false" aria-describedby="ouder-email-help">
                <span id="ouder-email-help" class="sr-only">Vul het e-mailadres van uw ouder of voogd in.</span>
            </div>
            
            <div class="form-group">
                <label for="ouder-telefoon">Telefoon Ouder/Voogd</label>
                <input type="tel" id="ouder-telefoon" name="ouder-telefoon" placeholder="06-12345678" aria-required="false" aria-describedby="ouder-telefoon-help">
                <span id="ouder-telefoon-help" class="sr-only">Vul het telefoonnummer van uw ouder of voogd in.</span>
            </div>
        `;
    }

    function checkAge() {
        if (!geboortedatumInput.value) return;

        const birthdate = new Date(geboortedatumInput.value);
        const today = new Date();

        let age = today.getFullYear() - birthdate.getFullYear();
        const monthDiff = today.getMonth() - birthdate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }

        const ouderSection = document.getElementById("ouder-section");
        const ouderNaam = document.getElementById("ouder-naam");
        const ouderEmail = document.getElementById("ouder-email");
        const ouderTelefoon = document.getElementById("ouder-telefoon");

        if (age < 18) {
            ouderSection.style.display = "block";

            ouderNaam.setAttribute("required", "");
            ouderNaam.setAttribute("aria-required", "true");
            ouderEmail.setAttribute("required", "");
            ouderEmail.setAttribute("aria-required", "true");
            ouderTelefoon.setAttribute("required", "");
            ouderTelefoon.setAttribute("aria-required", "true");
        } else {
            ouderSection.style.display = "none";

            ouderNaam.removeAttribute("required");
            ouderNaam.setAttribute("aria-required", "false");
            ouderEmail.removeAttribute("required");
            ouderEmail.setAttribute("aria-required", "false");
            ouderTelefoon.removeAttribute("required");
            ouderTelefoon.setAttribute("aria-required", "false");
        }
    }

    if (geboortedatumInput) {
        geboortedatumInput.addEventListener("change", checkAge);

        if (geboortedatumInput.value) {
            checkAge();
        }
    }

    fetch("/api/get_user_role")
        .then(response => response.json())
        .then(data => {
            if (data.role === "admin" && adminToggle) {
                adminToggle.style.display = "block";
            }
        })
        .catch(error => console.error("Fout bij ophalen gebruikersrol:", error));

    function clearMessages() {
        const errorMessageContainer = document.getElementById("error-message");
        const successMessageContainer = document.getElementById("success-message");

        if (errorMessageContainer) {
            errorMessageContainer.textContent = "";
            errorMessageContainer.style.display = "none";
        }

        if (successMessageContainer) {
            successMessageContainer.textContent = "";
            successMessageContainer.style.display = "none";
        }
    }

    function getValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    }

    function resetForm() {
        document.querySelector("form").reset();
        selectedBeperkingen = [];
        updateSelectedBeperkingen();

        const ouderSection = document.getElementById("ouder-section");
        if (ouderSection) {
            ouderSection.style.display = "none";
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (isSubmitting) return;
        isSubmitting = true;

        clearMessages();

        const wachtwoord = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        if (wachtwoord !== confirmPassword) {
            showErrorMessage("Wachtwoorden komen niet overeen.", document.getElementById("password"));
            isSubmitting = false;
            return;
        }

        const formData = {
            voornaam: getValue("voornaam"),
            tussenvoegsel: getValue("tussenvoegsel"),
            achternaam: getValue("achternaam"),
            geboortedatum: getValue("geboortedatum"),
            email: getValue("email"),
            geslacht: getValue("geslacht"),
            telefoonnummer: getValue("mobiel") || getValue("telefoonnummer"),
            adres: getValue("adres"),
            beperkingen: selectedBeperkingen.length ? selectedBeperkingen : [],
            wachtwoord: wachtwoord,
            isAdmin: adminSwitch ? adminSwitch.checked : false
        };

        const ouderSection = document.getElementById("ouder-section");
        if (ouderSection && ouderSection.style.display !== "none") {
            formData.ouder_naam = getValue("ouder-naam");
            formData.ouder_email = getValue("ouder-email");
            formData.ouder_telefoon = getValue("ouder-telefoon");
        }

       fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            isSubmitting = false;
            if (data.ervaringsdeskundige_id) {
                showSuccessMessage("Registratie succesvol!");
                resetForm();
            } else {
                showErrorMessage(data.error || "Er is een fout opgetreden bij de registratie.");
            }
        })
        .catch(error => {
            isSubmitting = false;
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


    if (adminSwitch) {
        adminSwitch.addEventListener("click", function () {
            this.classList.toggle("active");
        });
    }
});