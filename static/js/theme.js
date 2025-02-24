document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    const toggleButton = document.createElement()
    toggleButton.innerText = savedTheme === "dark" ? "Light Mode" : "Dark Mode";
    toggleButton.id = "themeToggle";
    document.body.appendChild(toggleButton);
})