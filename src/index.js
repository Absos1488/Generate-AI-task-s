// Инициализация после загрузки DOM
document.addEventListener("DOMContentLoaded", function() {
  // Проверяем существование элементов
  const navig = document.querySelector(".task__header__nav-item")
  const fotter = document.querySelector(".task__footer-div-list")
  const form1 = document.getElementById("task__menager-form")
  const form2 = document.getElementById("task__article-form")
  const harder = document.getElementById("harder")
  const textarea1 = document.getElementById("menager-input")
  const textarea2 = document.getElementById("task-input")
  const select = document.getElementById("select")

  // Проверяем, что все основные элементы найдены
  if (!textarea2) {
    console.error("CodeMirror textarea not found!")
    return
  }

  // Инициализация CodeMirror
  const editor = CodeMirror.fromTextArea(textarea2, {
    mode: "javascript",
    theme: "monokai",
    lineNumbers: true,
    autoCloseBrackets: true,
  })

  // Делаем editor глобальным для использования в других функциях
  window.codeEditor = editor

  // Navigation click handler
  if (navig && fotter) {
    navig.addEventListener("click", () => {
      fotter.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    })
  }

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
  if (window.codeEditor) {
    window.codeEditor.setOption("mode", modeMap[language])
  }
}

  // Tab handling больше не нужен для CodeMirror (он делает это автоматически)

  // Обработчик для textarea1
  if (textarea1) {
    textarea1.addEventListener("input", () => {
      setTimeout(() => {
        localStorage.setItem("promt", textarea1.value)
      }, 500)
    })
  }

  // Интеграция с CodeMirror для автосохранения
  if (editor) {
    editor.on("change", () => {
      setTimeout(() => {
        localStorage.setItem("code", editor.getValue())
      }, 500)
    })
  }

  // Обработчик изменения языка
  if (select) {
    select.addEventListener("change", () => {
      localStorage.setItem("selectedLanguage", select.value)
      if (window.codeEditor) {
        changeLanguage(select.value)
      }
    })
  }

  // Восстановление сохраненных данных
  const savedPrompt = localStorage.getItem("promt")
  const savedCode = localStorage.getItem("code")
  const savedLanguage = localStorage.getItem("selectedLanguage")

  if (savedPrompt && textarea1) {
    textarea1.value = savedPrompt
  }
  if (savedCode && editor) {
    editor.setValue(savedCode)
  }
  if (savedLanguage && select) {
    select.value = savedLanguage
    changeLanguage(savedLanguage)
  }

  // Footer click handler с проверкой существования
  const footerList = document.querySelector(".task__footer-div-list")
  if (footerList) {
    footerList.addEventListener("click", async (e) => {
      try {
        const item = e.target.closest(".task__footer-div-list-item")
        if (!item) {
          console.warn("Clicked outside of footer item")
          return
        }
        
        const textToCopy = e.target.textContent || e.target.innerText
        await navigator.clipboard.writeText(textToCopy)
        console.log(`You copied: ${textToCopy}`)
      } catch (error) {
        console.error("Copy failed:", error)
      }
    })
  }

  // Form submit handlers
  if (form1) {
    form1.addEventListener("submit", (e) => {
      sendRequest(e)
    })
  }

  if (form2) {
    form2.addEventListener("submit", (e) => {
      sendRequest(e)
    })
  }

}) // Закрытие DOMContentLoaded

function showError(element, message) {
  const errorDiv = document.createElement('div')
  errorDiv.className = 'error-message'
  errorDiv.style.color = 'red'
  errorDiv.style.marginTop = '10px'
  errorDiv.textContent = message
  element.parentElement.appendChild(errorDiv)
  
  setTimeout(() => errorDiv.remove(), 5000)
}

function clearErrors(element) {
  const errors = element.parentElement.querySelectorAll('.error-message')
  errors.forEach(error => error.remove())
}

async function sendRequest(event) {
  event.preventDefault()
  
  // Получаем данные правильным способом с проверками
  const textarea1 = document.getElementById("menager-input")
  const harder = document.getElementById("harder")
  
  if (!textarea1 || !harder || !window.codeEditor) {
    console.error("Required elements not found")
    return
  }
  
  const inputText = textarea1.value.trim()
  const inputText2 = window.codeEditor.getValue().trim()
  const harders = harder.value

  // Очищаем предыдущие ошибки с проверками
  const form1 = document.getElementById("task__menager-form")
  const form2 = document.getElementById("task__article-form")
  
  if (form1) clearErrors(form1)
  if (form2) clearErrors(form2)

  // Валидация первого поля
  if (!inputText || inputText === '') {
    showError(form1, "Пожалуйста, введите условие задачи")
    return
  }
  if (inputText.length > 1000) {
    showError(form1, "Условие задачи слишком длинное (максимум 1000 символов)")
    return
  }

  // Валидация второго поля (опционально)
  if (inputText2 && inputText2.length > 5000) {
    showError(form2, "Код решения слишком длинный (максимум 5000 символов)")
    return
  }

  // Показываем индикатор загрузки
  const loadingDiv = document.createElement('div')
  loadingDiv.className = 'loading-message'
  loadingDiv.textContent = 'Loading...'
  form1.parentElement.appendChild(loadingDiv)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд таймаут
    
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
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    loadingDiv.remove()

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const [result1, result2] = Array.isArray(data) ? data : [data.task, data.solution]

    // Отображаем результаты
    const resultContainer1 = document.createElement('div')
    resultContainer1.className = 'result-container'
    resultContainer1.style.marginTop = '20px'
    resultContainer1.style.padding = '15px'
    resultContainer1.style.border = '1px solid #ccc'
    resultContainer1.style.borderRadius = '5px'
    resultContainer1.textContent = result1 || 'Задача сгенерирована'
    
    const resultContainer2 = document.createElement('div')
    resultContainer2.className = 'result-container'
    resultContainer2.style.marginTop = '20px'
    resultContainer2.style.padding = '15px'
    resultContainer2.style.border = '1px solid #ccc'
    resultContainer2.style.borderRadius = '5px'
    resultContainer2.textContent = result2 || 'Решение получено'
    
    // Удаляем предыдущие результаты
    form1.parentElement.querySelectorAll('.result-container').forEach(el => el.remove())
    form2.parentElement.querySelectorAll('.result-container').forEach(el => el.remove())
    
    // Добавляем новые результаты
    form1.parentElement.appendChild(resultContainer1)
    form2.parentElement.appendChild(resultContainer2)

  } catch (error) {
    loadingDiv.remove()
    
    if (error.name === 'AbortError') {
      showError(form1, 'Время ожидания истекло. Попробуйте еще раз.')
    } else if (error.name === 'TypeError') {
      showError(form1, 'Проблема с подключением к интернету')
    } else {
      showError(form1, `Ошибка: ${error.message}`)
    }
  }
}
