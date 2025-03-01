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

    let fullText = '';
    let shortText = '';

    if (addButton) {
        addButton.addEventListener("click", function () {
            window.location.href = "/api/aanmaken-onderzoeksvraag";
        });
    }

    let selectedOnderzoekID = null; // Store the selected ID globally

    onderzoeksvragen.forEach(vraag => {
        vraag.addEventListener("click", function () {
            popupTitel.textContent = this.dataset.title;

            let fullText = this.dataset.info;
            selectedOnderzoekID = this.dataset.id; // Store the selected onderzoek ID

            let shortText = fullText.length > 100 ? fullText.substring(0, 100) + "..." : fullText;

            popupInfo.textContent = shortText;
            readMore.style.display = fullText.length > 100 ? "inline" : "none";
            readLess.style.display = "none";

            readMore.onclick = function () {
                popupInfo.textContent = fullText;
                readMore.style.display = "none";
                readLess.style.display = "inline";

                joinButton.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
            };

            readLess.onclick = function () {
                popupInfo.textContent = shortText;
                readLess.style.display = "none";
                readMore.style.display = "inline";

                joinButton.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
            };
            popup.style.display = "block";
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
    });

    if (cancelButton){
        cancelButton.addEventListener("click", function () {
            popup.style.display = "none";
        });
    }

    if (joinButton){
        joinButton.addEventListener("click", function () {
            window.location.href = "";
        });
    }

    if (popupInschrijvingButton) {
        popupInschrijvingButton.addEventListener("click", function () {
            if (selectedOnderzoekID) {
                bekijkInschrijvingen(selectedOnderzoekID); // Use the stored ID
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