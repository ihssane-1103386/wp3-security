document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#login-page");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Vul alle velden in.");
            return;
        }

        fetch("/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email: email, password: password})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem("token", data.token); // Opslaan van token
                    if (data.role === "admin") {
                        window.location.href = "/overzicht";
                    } else {
                        window.location.href = "/onderzoeksvragen";
                    }
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error("Login error:", error);
                alert("Er is een probleem met de server. Probeer het later opnieuw.");
            });
    });
});
