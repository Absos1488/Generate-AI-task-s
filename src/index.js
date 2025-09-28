const navig = document.querySelector(".task__header__nav-item")
const fotter = document.querySelector(".task__footer-div-list")

navig.addEventListener("click", () => {
  fotter.scrollIntoView({
    behavior: "smooth",
    block: "center",
  })
})

document
  .querySelector(".task__footer-div-list")
  .addEventListener("click", (e) => {
    const item = e.target.closest(".task__footer-div-list")
    if (!item) {
      throw new Error("no")
    }
    navigator.clipboard.writeText(e.target.text)
  })
  .then((mes) => console.log(`you copied ${mes}`))
  .catch((e) => console.error("error:", e))
