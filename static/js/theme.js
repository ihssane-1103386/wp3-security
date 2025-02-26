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
        toggleButton.innerText = savedTheme === "dark" ? "Light Mode" : "Dark Mode";
    });

    const header = document.querySelector("header");
    header.appendChild(toggleButton);
});

function setTheme(mode) {
    if (mode === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark")
    }
}
