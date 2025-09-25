const button = document.getElementById("button");

button.addEventListener("click", (event) => {
    event.preventDefault();
    return event.target;
});