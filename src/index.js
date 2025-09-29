const navig = document.querySelector(".task__header__nav-item")
const fotter = document.querySelector(".task__footer-div-list")
const form1 = document.getElementById("task__menager-form")
const form2 = document.getElementById("task__article-form")
const harder = document.getElementById("harder")
const textarea1 = document.getElementById("menager-input")
const textarea2 = document.getElementById("task-input")
const select = document.getElementById("select")

navig.addEventListener("click", () => {
  fotter.scrollIntoView({
    behavior: "smooth",
    block: "center",
  })
})

const editor = CodeMirror.fromTextArea(document.getElementById("task-input"), {
  mode: "javascript",
  theme: "monokai",
  lineNumbers: true,
  autoCloseBrackets: true,
})

function changeLanguage(language) {
  const modeMap = {
    javascript: "javascript",
    python: "python",
    htmlmixed: "htmlmixed",
    css: "css",
    php: "php",
    java: "text/x-java",
    cpp: "text/x-c++",
    sql: "sql",
    ruby: "ruby",
    xml: "xml",
  }
  editor.setOption("mode", modeMap[language])
}

textarea2.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault()
    const start = e.target.selectionStart
    const end = e.target.selectionEnd
    e.target.value =
      e.target.value.substring(0, start) + "  " + e.target.value.substring(end)
    e.target.selectionStart = e.target.selectionEnd = start + 2
  }
})

textarea1.addEventListener("input", () => {
  setTimeout(() => {
    localStorage.setItem("promt", textarea1.value)
  }, 500)
})

textarea2.addEventListener("input", () => {
  setTimeout(() => {
    localStorage.setItem("code", textarea2.value)
  }, 500)
})

select.addEventListener("change", () => {
  localStorage.setItem("selectedLanguage", select.value)
})

window.addEventListener("load", () => {
  const savedPrompt = localStorage.getItem("promt")
  const savedCode = localStorage.getItem("code")
  const savedLanguage = localStorage.getItem("selectedLanguage")

  savedPrompt ? (textarea1.value = savedPrompt) : null
  savedCode ? (textarea2.value = savedCode) : null
  savedLanguage ? select.value & changeLanguage(savedLanguage) : null
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
  const inputText = form1.get("input1")
  const inputText2 = form2.get("input2")
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
    const [result1, result2, hard] = data

    if (response.ok) {
      ;((form1.textContent = result1), hard)
      form2.textContent = result2
    }
    form1.textContent = `Error: ${data.message || "Error"}`
    form2.textContent = `Error: ${data.message || "Error"}`
  } catch (err) {
    form1.textContent = `Error: ${err.message}`
    form2.textContent = `Error: ${err.message}`
  }
}
