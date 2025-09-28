const navig = document.querySelector(".task__header__nav-item")
const fotter = document.querySelector(".task__footer-div-list")
const form1 = document.getElementById("task__menager-form")
const form2 = document.getElementById("task__article-form")
const harder = document.getElementById("harder")

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

form1.addEventListener("click", (e) => {
  sendRequest(e)
})

form2.addEventListener("click", (e) => {
  sendRequest(e)
})

async function sendRequest(event) {
  event.preventDefault()
  const formData = new FormData(form1)
  const formData2 = new FormData(form2)
  const inputText = formData.get("input1")
  const inputText2 = formData2.get("input2")
  const harders = harder.value

  if (inputText.length > 1000) {
    form1.textContent = "Запрос слишком длинный"
    return
  }
  if (!inputText && !inputText2) {
    form1.textContent = "Please, write prompt"
    form2.textContent = "Write your solution"
    return
  }

  form1.textContent = "Loading..."

  try {
    const response = await fetch("/api/neural/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input1: inputText,
        input2: inputText2,
        hard: harders,
      }),
    })

    const data = await response.json()
    const [result1, result2] = data

    if (response.ok) {
      form1.textContent = result1
      form2.textContent = result2
    }
    form1.textContent = `Error: ${data.message || "Error"}`
    form2.textContent = `Error: ${data.message || "Error"}`
  } catch (err) {
    form1.textContent = `Error: ${err.message}`
    form2.textContent = `Error: ${err.message}`
  }
}
