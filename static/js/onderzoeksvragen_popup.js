document.addEventListener("DOMContentLoaded", function () {
    const onderzoeksvragen = document.querySelectorAll(".clickable");
    const popup = document.getElementById("popup");
    const popupTitel = document.getElementById("popup-titel");
    const popupInfo = document.getElementById("popup-info");
    const popupDeelnemers = document.getElementById("popup-deelnemers");
    const joinButton = document.getElementById("join");
    const cancelButton = document.getElementById("cancel");
    const closeButton = document.querySelector(".close");

    onderzoeksvragen.forEach(vraag => {
        vraag.addEventListener("click", function () {
            popupTitel.textContent = this.dataset.title;
            popupInfo.textContent = this.dataset.info;
            popupDeelnemers.textContent = this.dataset.deelnemers;
            popup.style.display = "flex";
        });
    });

    closeButton.addEventListener("click", function () {
        popup.style.display = "none";
    });

    cancelButton.addEventListener("click", function () {
        popup.style.display = "none";
    });

    joinButton.addEventListener("click", function () {
        window.location.href = "";
    });

    window.addEventListener("click", function (event) {
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });
});