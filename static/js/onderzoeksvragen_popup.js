document.addEventListener("DOMContentLoaded", function () {
    const onderzoeksvragen = document.querySelectorAll(".clickable");
    const popup = document.getElementById("popup");
    const popupTitel = document.getElementById("popup-titel");
    const popupInfo = document.getElementById("popup-info-text");
    const readMore = document.getElementById("read-more");
    const readLess = document.getElementById("read-less");
    const popupDeelnemers = document.getElementById("popup-max_deelnemers");
    const popupBeschikbaar = document.getElementById("popup-beschikbaar");
    const popupInschrijvingButton = document.getElementById("bekijk-aanvragen");
    const joinButton = document.getElementById("join");
    const cancelButton = document.getElementById("cancel");
    const closeButton = document.querySelector(".close");
    const addButton = document.getElementById("add-button");
    const filterButton = document.getElementById("filter-button");
    const beperkingFilter = document.getElementById("beperking-filter");

    let fullText = '';
    let shortText = '';


    if (addButton) {
        addButton.addEventListener("click", function () {
            window.location.href = "/aanmaken-onderzoeksvraag";
        });
    }


    let selectedOnderzoekID = null;

    onderzoeksvragen.forEach(vraag => {
        vraag.addEventListener("click", function () {
            popupTitel.textContent = this.dataset.title;

            let fullText = this.dataset.info;
            selectedOnderzoekID = this.dataset.id;

            let shortText = fullText.length > 100 ? fullText.substring(0, 100) + "..." : fullText;

            popupInfo.textContent = shortText;
            readMore.style.display = fullText.length > 100 ? "inline" : "none";
            readLess.style.display = "none";

            popupDeelnemers.textContent = this.dataset.deelnemers;
            popupBeschikbaar.textContent = `${this.dataset.beschikbaar}/${this.dataset.deelnemers}`;

            readMore.onclick = function () {
                popupInfo.textContent = fullText;
                readMore.style.display = "none";
                readLess.style.display = "inline";
                readMore.setAttribute("aria-expanded", "true");
                readLess.setAttribute("aria-expanded", "false");

                joinButton.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
            };

            readLess.onclick = function () {
                popupInfo.textContent = shortText;
                readLess.style.display = "none";
                readMore.style.display = "inline";
                readLess.setAttribute("aria-expanded", "false");
                readMore.setAttribute("aria-expanded", "true");

                joinButton.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
            };
            if (joinButton){
                joinButton.setAttribute("data-onderzoek-id", this.dataset.onderzoekId);
            }

            popup.style.display = "block";
            popup.setAttribute("aria-hidden", "false");
            closeButton.focus();
        });
    });

    popup.addEventListener("click", function (event) {
        if (event.target.classList.contains("lees-meer")) {
            popupInfo.textContent = onderzoeksvragen[0].dataset.info;
        } else if (event.target === popup || event.target === closeButton || event.target === cancelButton) {
            popup.style.display = "none";
        }
    });

    closeButton.addEventListener("click", function () {
        popup.style.display = "none";
        popup.setAttribute("aria-hidden", "true");
        document.querySelector(".clickable[data-id='" + selectedOnderzoekID + "']").focus();
    });

    window.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && popup.style.display === "block") {
            popup.style.display = "none";
            popup.setAttribute("aria-hidden", "false");
        document.querySelector(".clickable[data-id='" + selectedOnderzoekID + "']").focus();
        }
    });

    readMore.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.click();
        }
    });

    readMore.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.click();
        }
    });

    popup.addEventListener("keydown", function(event) {
        if (event.key === "Tab") {
            const focusableElements = popup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements - 1];
            if (event.shiftKey && document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    })


    if (cancelButton){
        cancelButton.addEventListener("click", function () {
            popup.style.display = "none";
        });
    }

    if (joinButton) {
        joinButton.addEventListener("click", function () {
            const onderzoekId = joinButton.getAttribute("data-onderzoek-id");
            const formData = new FormData();
            formData.append("onderzoek_id", onderzoekId);


            fetch("/deelnemen", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ervaringsdeskundige_id: 1,
                    onderzoek_id: onderzoekId
                })
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message || data.error);
                })
                .catch(error => console.error('Error:', error));
        });
    }

    if (filterButton) {
        filterButton.addEventListener("click", function () {
            console.log("Filterknop geklikt");
            if (beperkingFilter.style.display === "none" || beperkingFilter.style.display === "") {
                beperkingFilter.style.display = "block";
                console.log("Dropdown getoond");
            } else {
                beperkingFilter.style.display = "block";
                console.log("Dropdown verborgen");
            }
        });
    }

    document.addEventListener("click", function (event) {
        if (event.target !== filterButton && event.target !== beperkingFilter) {
            beperkingFilter.style.display = "none";
        }
    });

    if (beperkingFilter) {
        beperkingFilter.addEventListener("change", function () {
            const geselecteerdeBeperking = this.value.trim().toLowerCase();
            console.log("Geselecteerde beperking:", geselecteerdeBeperking);

            onderzoeksvragen.forEach(vraag => {
                const doelgroep = vraag.querySelector("td:nth-child(2)").textContent.trim().toLowerCase();

                console.log("Doelgroep:", doelgroep);

                if (geselecteerdeBeperking === "" || doelgroep.includes(geselecteerdeBeperking)) {
                    vraag.style.display = "";
                    console.log("Rij getoond:", vraag);
                } else {
                    vraag.style.display = "none";
                    console.log("Rij verborgen:", vraag);
                }
            });
        });
    }
    
    if (popupInschrijvingButton) {
        popupInschrijvingButton.addEventListener("click", function () {
            if (selectedOnderzoekID) {
                bekijkInschrijvingen(selectedOnderzoekID);
            } else {
                console.error("No data-id found on popup");
            }
        });
    }
    window.addEventListener("click", function (event) {
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });
    
});