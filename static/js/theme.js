document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    const toggleButton = document.createElement("button");
    toggleButton.innerText = savedTheme === "dark" ? "Light Mode" : "Dark Mode";
    toggleButton.id = "themeToggle";
    document.body.appendChild(toggleButton);

    toggleButton.addEventListener("click", function() {
        const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        toggleButton.innerText = newTheme === "dark" ? "Light Mode" : "Dark Mode";
        updateLogo(newTheme);
    });

    const header = document.querySelector("header");
    header.appendChild(toggleButton);

    updateLogo(savedTheme);
});

// cookies
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
}

function setTheme(mode) {
    if (mode === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark")
    }
}

function updateLogo(theme) {
    const logo = document.querySelector("header img");
    if (theme === "dark") {
        logo.src = logo.dataset.logoDark;
    } else {
        logo.src = logo.dataset.logoLight;
    }
}

