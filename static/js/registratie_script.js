document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const submitButton = document.querySelector(".btn-register");
    const cancelButton = document.querySelector(".btn-cancel");

    // Form validation
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

    // Cancel button clears the form
    cancelButton.addEventListener("click", function() {
        form.reset();
        const inputs = form.querySelectorAll("input, select, textarea");
        inputs.forEach(input => input.style.border = "1px solid #ccc");
    });
});
