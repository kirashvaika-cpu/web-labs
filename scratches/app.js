// ЧАСТИНА «ВІДМІННО»: Я додаю персистентність (localStorage)
// Це дозволяє мені зберігати дані в браузері, щоб вони не зникали після оновлення
const STORAGE_KEY = "v9_tickets_data_kira";

// Я завантажую дані з пам'яті або створюю порожній масив, якщо це перший запуск
let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
// Я обчислюю наступний ID, щоб кожен мій запис мав унікальний номер
let nextId = items.length > 0 ? Math.max(...items.map(x => x.id)) + 1 : 1;

// ЧАСТИНА «ВІДМІННО»: Я використовую цю змінну для відстеження режиму редагування
let editId = null;

const form = document.getElementById("createForm");
const tbody = document.getElementById("itemsTableBody");
const resetBtn = document.getElementById("resetBtn");
const submitBtn = document.getElementById("submitBtn");
const searchInput = document.getElementById("searchInput");

// ЧАСТИНА «ВІДМІННО»: ДЕЛЕГУВАННЯ ПОДІЙ
// Я вішаю один обробник на весь tbody, щоб керувати всіма кнопками в таблиці
tbody.addEventListener("click", (e) => {
    const target = e.target;
    const id = Number(target.dataset.id); // Я зчитую ID через атрибут data-id
    if (!id) return;

    if (target.classList.contains("delete-btn")) {
        deleteItem(id); // Рівень «Добре»: Я видаляю запис за його ID
    } else if (target.classList.contains("edit-btn")) {
        startEdit(id); // Рівень «Відмінно»: Я запускаю процес редагування
    }
});

// РІВЕНЬ «ЗАДОВІЛЬНО»: Я обробляю відправку форми
form.addEventListener("submit", (e) => {
    e.preventDefault(); // Я скасовую перезавантаження сторінки браузером

    const dto = readForm(); // Я зчитую дані з усіх полів
    const isValid = validate(dto); // Я перевіряю, чи коректно заповнена форма

    if (isValid) {
        // Рівень «Відмінно»: Я перевіряю, чи це оновлення старого запису
        if (editId !== null) {
            const index = items.findIndex(item => item.id === editId);
            items[index] = { ...dto, id: editId };
            editId = null;
            submitBtn.textContent = "Надіслати";
            submitBtn.style.backgroundColor = "#27ae60"; // Я повертаю зелений колір
        } else {
            addItem(dto); // Рівень «Задовільно»: Я додаю новий запис у масив
        }

        saveAndRender(); // Я зберігаю зміни та оновлюю таблицю
        form.reset(); // Рівень «Добре»: Я очищаю форму після успіху
    }
});

// Рівень «Відмінно»: Я записую масив у localStorage у форматі JSON
function saveAndRender() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    render();
}

// Рівень «Відмінно»: Я підставляю дані в форму, коли хочу щось змінити
function startEdit(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Я заповнюю всі поля форми даними обраного квитка
    document.getElementById("subjectInput").value = item.subject;
    document.getElementById("statusSelect").value = item.status;
    document.getElementById("prioritySelect").value = item.priority;
    document.getElementById("authorInput").value = item.author;
    document.getElementById("messageInput").value = item.message;

    editId = id;
    submitBtn.textContent = "Зберегти";
    submitBtn.style.backgroundColor = "#3498db"; // Я змінюю колір на синій для візуального акценту
    window.scrollTo(0, 0); // Я прокручую сторінку вгору до форми
}

// Рівень «Відмінно»: Я додаю пошук, який працює миттєво при введенні тексту
if (searchInput) {
    searchInput.addEventListener("input", render);
}

// РІВЕНЬ «ЗАДОВІЛЬНО»: Я відмальовую таблицю
function render() {
    tbody.innerHTML = ""; // Я очищаю вміст перед кожним оновленням
    const term = searchInput ? searchInput.value.toLowerCase() : "";

    // Рівень «Відмінно»: Я фільтрую список перед виводом, якщо введено текст у пошук
    const displayItems = items.filter(item => item.subject.toLowerCase().includes(term));

    displayItems.forEach((item, index) => {
        // Я формую рядки таблиці, додаючи класи та data-id для мого стилю
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${item.subject}</td>
                <td>${item.status}</td>
                <td>${item.priority}</td>
                <td>${item.author}</td>
                <td>
                    <button class="edit-btn" data-id="${item.id}" style="background-color: #f1c40f; color: white; padding: 6px 12px; font-size: 12px; border-radius: 4px; border: none; cursor: pointer; margin-right: 5px;">Ред.</button>
                    <button class="delete-btn" data-id="${item.id}">Видалити</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// РІВЕНЬ «ДОБРЕ»: Я збираю дані в об'єкт DTO
function readForm() {
    return {
        subject: document.getElementById("subjectInput").value.trim(),
        status: document.getElementById("statusSelect").value,
        priority: document.getElementById("prioritySelect").value,
        author: document.getElementById("authorInput").value.trim(),
        message: document.getElementById("messageInput").value.trim()
    };
}

// РІВЕНЬ «ЗАДОВІЛЬНО» + «ДОБРЕ»: Я реалізую валідацію
function validate(dto) {
    clearErrors();
    let isValid = true;

    // Рівень «Добре»: Я перевіряю кожне поле та підсвічую помилки окремо
    if (dto.subject === "") { showError("subjectInput", "subjectError", "Вкажіть тему"); isValid = false; }
    if (dto.status === "") { showError("statusSelect", "statusError", "Оберіть статус"); isValid = false; }
    if (dto.priority === "") { showError("prioritySelect", "priorityError", "Оберіть пріоритет"); isValid = false; }
    if (dto.author === "") { showError("authorInput", "authorError", "Вкажіть автора"); isValid = false; }
    if (dto.message.length < 5) { showError("messageInput", "messageError", "Повідомлення занадто коротке"); isValid = false; }

    return isValid;
}

// Рівень «Добре»: Я додаю клас .invalid для червоної рамки та виводжу текст помилки
function showError(inputId, errorId, message) {
    document.getElementById(inputId).classList.add("invalid");
    document.getElementById(errorId).textContent = message;
}

// Я очищаю всі старі помилки перед новою перевіркою
function clearErrors() {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach(input => input.classList.remove("invalid"));
    const errors = document.querySelectorAll(".error-text");
    errors.forEach(err => err.textContent = "");
}

// Рівень «Задовільно»: Я додаю об'єкт у свій масив
function addItem(dto) {
    items.push({ ...dto, id: nextId++ });
}

// Рівень «Добре»: Я видаляю квиток за допомогою фільтрації масиву
function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    saveAndRender(); // Я зберігаю новий стан після видалення
}

// Я скидаю форму та всі активні режими (як-от редагування)
resetBtn.addEventListener("click", () => {
    form.reset();
    clearErrors();
    editId = null;
    submitBtn.textContent = "Надіслати";
    submitBtn.style.backgroundColor = "#27ae60";
});
