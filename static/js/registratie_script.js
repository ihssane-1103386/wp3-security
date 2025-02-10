document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const submitButton = document.querySelector(".btn-register");
    const cancelButton = document.querySelector(".btn-cancel");

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        let valid = true;
        const inputs = form.querySelectorAll("input, select, textarea");

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.border = "2px solid #C62828";
                valid = false;
            } else {
                input.style.border = "1px solid #ccc";
            }
        });

        if (valid) {
            alert("Registratie succesvol ingediend!");
            form.reset();
        } else {
            alert("Vul alle velden correct in.");
        }
    });

    cancelButton.addEventListener("click", function() {
        form.reset();
        const inputs = form.querySelectorAll("input, select, textarea");
        inputs.forEach(input => input.style.border = "1px solid #ccc");
    });
});

function fetchSuggestions() {
    let input = document.getElementById("beperkingen").value;

    if (input.length < 2) {
        document.getElementById("suggestions").innerHTML = "";
        return;
    }

    fetch(`/api/beperkingen?query=${input}`)
        .then(response => response.json())
        .then(data => {
            let suggestionsList = document.getElementById("suggestions");
            suggestionsList.innerHTML = "";

            data.forEach(item => {
                let listItem = document.createElement("li");
                listItem.textContent = item;
                listItem.onclick = function() {
                    document.getElementById("beperkingen").value = item;
                    suggestionsList.innerHTML = "";
                };
                suggestionsList.appendChild(listItem);
            });
        })
        .catch(error => console.error("Error fetching suggestions:", error));
}
