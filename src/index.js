const button = document.getElementById("button")
const navig = document.querySelector(".task__header__nav-item")
const fotter = document.querySelector(".task__footer-div-list")

button.addEventListener("click", (event) => {
  event.preventDefault()
})

navig.addEventListener("click", () => {
  fotter.scrollIntoView({
    behavior: "smooth",
    block: "center",
  })
})

fotter.addEventListener("click", (event) => {
  const item = event.target
  if (item) {
    copyText(item)
  }
  return
})

function copyText(text) {
  return text
}
