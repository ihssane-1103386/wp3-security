document.addEventListener("DOMContentLoaded", function () {
    const onderzoeksvragen = document.querySelectorAll("");
    const popup = document.getElementById("");
    const popupTitel = document.getElementById("");
    const popupInfo = document.getElementById("");
    const popupDeelnemers = document.getElementById("");
    const Join = document.getElementById("");
    const cancel = document.getElementById("");
    const close = document.querySelectorAll(".close");
    const button = document.getElementById("");

    onderzoeksvragen.forEach(vraag => {
        vraag.addEventListener("click", function () {
            const popupTitel = this.dataset.title;
            const popupInfo = this.dataset.info;
            const popupDeelnemers = this.dataset.deelnemers;

            document.getElementById("popup-titel").textContent = title;
            document.getElementById("popup-info").textContent = info;
            document.getElementById("popup-deelnemers").textContent = deelnemers;

            popup.style.display = "block";
        })
    });

    close.addEventListener("click", function () {
        popup.style.display = "none";
    });

    cancel.addEventListener("click", function() {
        popup.style.display="none";
    });

    join.addEventListener("click", function (){
        window.location.href = "";
    });

    window.addEventListener("click", function(event){
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });
