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
        const joinButtonPopup = document.getElementById("join");
        const deelnemenButtonDetail = document.getElementById("deelnemenButton");
        const cancelButton = document.getElementById("cancel");
        const closeButton = popup.querySelector(".close");
        const addButton = document.getElementById("add-button");
        const filterButton = document.getElementById("filter-button");
        const beperkingFilter = document.getElementById("beperking-filter");
        const researchButton = document.getElementById("research-button");
        const researchPopup = document.getElementById("research-popup");
        const moreInfoLink = document.getElementById("more-info-link");

        let fullText = '';
        let shortText = '';

        onderzoeksvragen.forEach(vraag => {
            if (vraag.dataset.beschikbaar !== "1" || vraag.dataset.status !== "1") {
                vraag.style.display = "none";
            }
        });

        if (addButton) {
            addButton.addEventListener("click", function () {
                window.location.href = "/aanmaken-onderzoeksvraag";
            });
        }

        let selectedOnderzoekID = null;

        onderzoeksvragen.forEach(vraag => {
            vraag.addEventListener("click", function (event) {
                event.stopPropagation();
                const onderzoekId = this.dataset.onderzoekId;
                console.log("Selected onderzoek ID:", onderzoekId);

                const moreInfoLink = document.getElementById("more-info-link");
                moreInfoLink.href = `/onderzoeksvragen_detail/${onderzoekId}`;

                popupTitel.textContent = this.dataset.title;

                let fullText = this.dataset.info;
                selectedOnderzoekID = this.dataset.id;

                let shortText = fullText.length > 100 ? fullText.substring(0, 100) + "..." : fullText;

                popupInfo.textContent = shortText;
                readMore.style.display = fullText.length > 100 ? "inline" : "none";
                readLess.style.display = "none";

                popupDeelnemers.textContent = this.dataset.deelnemers;
                popupBeschikbaar.textContent = `${this.dataset.beschikbaar}/${this.dataset.deelnemers}`;

                moreInfoLink.href = `/onderzoeksvragen_detail/${selectedOnderzoekID}`;

                popup.style.display = "block";
                popup.setAttribute("aria-hidden", "false");

                readMore.onclick = function () {
                    popupInfo.textContent = fullText;
                    readMore.style.display = "none";
                    readLess.style.display = "inline";
                    readMore.setAttribute("aria-expanded", "true");
                    readLess.setAttribute("aria-expanded", "false");
                    readLess.focus();

                    joinButtonPopup.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
                };

                readLess.onclick = function () {
                    popupInfo.textContent = shortText;
                    readLess.style.display = "none";
                    readMore.style.display = "inline";
                    readLess.setAttribute("aria-expanded", "false");
                    readMore.setAttribute("aria-expanded", "true");
                    readMore.focus();

                    joinButtonPopup.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
                };

                if (joinButtonPopup) {
                    joinButtonPopup.setAttribute("data-onderzoek-id", this.dataset.onderzoekId);
                }

                popup.style.display = "block";
                popup.setAttribute("aria-hidden", "false");
                closeButton.focus();
            });
        });

        popup.addEventListener("click", function (event) {
            if (event.target === popup || event.target === closeButton || event.target === cancelButton) {
                popup.style.display = "none";
            }
        });

        closeButton.addEventListener("click", function () {
            popup.style.display = "none";
            popup.setAttribute("aria-hidden", "true");
            document.querySelector(".clickable[data-id='" + selectedOnderzoekID + "']").focus();
        });

        window.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && popup.style.display === "block") {
                popup.style.display = "none";
                popup.setAttribute("aria-hidden", "false");
                document.querySelector(".clickable[data-id='" + selectedOnderzoekID + "']").focus();
            }
        });

        readMore.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                this.click();
                readLess.focus();
            }
        });

        readLess.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                this.click();
                readMore.focus();
            }
        });

        popup.addEventListener("keydown", function (event) {
            if (event.key === "Tab") {
                const focusableElements = popup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                if (event.shiftKey && document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        });

        if (cancelButton) {
            cancelButton.addEventListener("click", function () {
                popup.style.display = "none";
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
                    if (vraag.dataset.beschikbaar !== "1" || vraag.dataset.status !== "1") {
                        vraag.style.display = "none";
                    } else {
                        const doelgroep = vraag.querySelector("td:nth-child(2)").textContent.trim().toLowerCase();
                        console.log("Doelgroep:", doelgroep);

                        if (geselecteerdeBeperking === "" || doelgroep.includes(geselecteerdeBeperking)) {
                            vraag.style.display = "";
                            console.log("Rij getoond:", vraag);
                        } else {
                            vraag.style.display = "none";
                            console.log("Rij verborgen:", vraag);
                        }
                    }
                });
            });
        }

        if (deelnemenButtonDetail) {
            deelnemenButtonDetail.addEventListener("click", function () {
                const onderzoekId = this.getAttribute("data-onderzoek-id");
                const ervaringsdeskundigeId = localStorage.getItem('ervaringsdeskundigeId');


                if (!ervaringsdeskundigeId) {
                    Swal.fire({
                        title: "Fout",
                        text: "Je moet ingelogd zijn om deel te nemen.",
                        icon: "error",
                        showCloseButton: true,
                    });
                    return;
                }

                fetch("/deelnemen", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ervaringsdeskundige_id: ervaringsdeskundigeId,
                        onderzoek_id: onderzoekId
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message) {
                            Swal.fire({
                                title: "Succesvol deelgenomen",
                                text: data.message,
                                icon: "success",
                                showCloseButton: true,
                            });
                        } else if (data.error) {
                            Swal.fire({
                                title: "Fout",
                                text: data.error,
                                icon: "error",
                                showCloseButton: true,
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({
                            title: "Fout",
                            text: "Er is een fout opgetreden bij het deelnemen aan het onderzoek.",
                            icon: "error",
                            showCloseButton: true,
                        });
                    });
            });
        }

        if (joinButtonPopup) {
            joinButtonPopup.addEventListener("click", function () {
                const onderzoekId = this.getAttribute("data-onderzoek-id");
                const ervaringsdeskundigeId = localStorage.getItem('ervaringsdeskundigeId');

                if (!ervaringsdeskundigeId) {
                    Swal.fire({
                        title: "Fout",
                        text: "Je moet ingelogd zijn om deel te nemen.",
                        icon: "error",
                        showCloseButton: true,
                    });
                    return;
                }

                fetch("/deelnemen", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ervaringsdeskundige_id: ervaringsdeskundigeId,
                        onderzoek_id: onderzoekId
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message) {
                            Swal.fire({
                                title: "Succesvol deelgenomen",
                                text: data.message,
                                icon: "success",
                                showCloseButton: true,
                            });
                        } else if (data.error) {
                            Swal.fire({
                                title: "Fout",
                                text: data.error,
                                icon: "error",
                                showCloseButton: true,
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({
                            title: "Fout",
                            text: "Er is een fout opgetreden bij het deelnemen aan het onderzoek.",
                            icon: "error",
                            showCloseButton: true,
                        });
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
            if (event.target === researchPopup) {
                researchPopup.style.display = "none";
            }
        });

        /* Hieronder is de code voor de pop-up voor "Mijn onderzoeken" */

        if (researchButton && researchPopup) {
            researchButton.addEventListener("click", function () {
                researchPopup.style.display = "block";
                researchPopup.setAttribute("aria-hidden", "false");
                researchPopup.querySelector(".close").focus();
                loadMijnOnderzoeken();
            });

            researchPopup.addEventListener("click", function (event) {
                if (event.target.classList.contains("close") || event.target === researchPopup) {
                    researchPopup.style.display = "none";
                    researchPopup.setAttribute("aria-hidden", "true");
                }
            });

            window.addEventListener("keydown", function (event) {
                if (event.key === "Escape" && researchPopup.style.display === "block") {
                    researchPopup.style.display = "none";
                    researchPopup.setAttribute("aria-hidden", "true");
                    researchButton.focus();
                }
            });
        }

        function loadMijnOnderzoeken() {
            fetch("/api/mijn-onderzoeken")
                .then(response => response.json())
                .then(data => {
                    const researchTable = document.querySelector("#research-status-table tbody");
                    researchTable.innerHTML = "";


                    if (data.length === 0) {
                        const row = document.createElement("tr");
                        const cell = document.createElement("td");
                        cell.colSpan = "2";
                        cell.style.textAlign = "center";
                        cell.textContent = "Je hebt je nog niet ingeschreven voor onderzoeken";
                        row.appendChild(cell);
                        researchTable.appendChild(row);
                    } else {
                        data.forEach(item => {
                            const row = document.createElement("tr");
                            const onderzoekCell = document.createElement("td");
                            onderzoekCell.textContent = item.titel;
                            const statusCell = document.createElement("td");
                            statusCell.textContent = item.status;
                            row.appendChild(onderzoekCell);
                            row.appendChild(statusCell);
                            researchTable.appendChild(row);
                        });
                    }
                })
                .catch(error => console.error("Error fetching mijn onderzoeken:", error));
        }

    }
)
;