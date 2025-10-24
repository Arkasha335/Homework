document.addEventListener('DOMContentLoaded', () => {
    // --- Получение элементов DOM ---
    const subjectsContainer = document.getElementById('subjects-container');
    const addSubjectBtn = document.getElementById('add-subject-btn');
    const modal = document.getElementById('add-modal');
    const cancelBtn = document.getElementById('cancel-add');
    const saveBtn = document.getElementById('save-subject');
    const newSubjectNameInput = document.getElementById('new-subject-name');
    const lastUpdatedElement = document.getElementById('last-updated');

    // --- Загрузка данных или инициализация пустого массива ---
    let subjects = JSON.parse(localStorage.getItem('homework-tracker-subjects')) || [];

    // --- Функции для работы с данными ---
    const saveSubjects = () => {
        localStorage.setItem('homework-tracker-subjects', JSON.stringify(subjects));
        updateTimestamp();
    };

    const renderSubjects = () => {
        subjectsContainer.innerHTML = ''; // Очищаем контейнер
        if (subjects.length === 0) {
            subjectsContainer.innerHTML = `<p style="color: var(--secondary-text-color); text-align: center;">Пока нет ни одного предмета. Нажмите "+" внизу, чтобы добавить первый.</p>`;
        }
        
        subjects.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.dataset.id = subject.id;

            card.innerHTML = `
                <div class="card-header">
                    <h2>${subject.name}</h2>
                    <button class="delete-btn" title="Удалить предмет">×</button>
                </div>
                <div class="task-field">
                    <strong>Домашнее задание:</strong>
                    <div class="editable" contenteditable="true" data-field="homework">${subject.homework}</div>
                </div>
                <div class="task-field">
                    <strong>Заметки:</strong>
                    <div class="editable" contenteditable="true" data-field="notes">${subject.notes}</div>
                </div>
            `;
            subjectsContainer.appendChild(card);
        });
    };

    // --- Функции для управления модальным окном ---
    const showModal = () => {
        modal.style.display = 'flex';
        newSubjectNameInput.focus();
    };

    const hideModal = () => {
        modal.style.display = 'none';
        newSubjectNameInput.value = '';
    };

    // --- Логика добавления, обновления и удаления ---
    const addSubject = () => {
        const name = newSubjectNameInput.value.trim();
        if (name) {
            const newSubject = {
                id: Date.now(),
                name: name,
                homework: '',
                notes: ''
            };
            subjects.push(newSubject);
            saveSubjects();
            renderSubjects();
            hideModal();
        }
    };

    const updateSubject = (id, field, value) => {
        const subject = subjects.find(s => s.id === parseInt(id));
        if (subject) {
            subject[field] = value;
            saveSubjects();
        }
    };

    const deleteSubject = (id) => {
        subjects = subjects.filter(s => s.id !== parseInt(id));
        saveSubjects();
        renderSubjects();
    };
    
    // --- Функция обновления времени ---
    const padTo2Digits = (num) => num.toString().padStart(2, '0');

    const updateTimestamp = () => {
        const now = new Date();
        const date = `${padTo2Digits(now.getDate())}.${padTo2Digits(now.getMonth() + 1)}.${now.getFullYear()}`;
        const time = `${padTo2Digits(now.getHours())}:${padTo2Digits(now.getMinutes())}`;
        lastUpdatedElement.textContent = `Обновлено: ${date}, ${time}`;
    };

    // --- Назначение обработчиков событий ---
    addSubjectBtn.addEventListener('click', showModal);
    cancelBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });
    saveBtn.addEventListener('click', addSubject);
    newSubjectNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addSubject();
    });

    subjectsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const card = e.target.closest('.subject-card');
            deleteSubject(card.dataset.id);
        }
    });

    subjectsContainer.addEventListener('blur', (e) => {
        if (e.target.classList.contains('editable')) {
            const card = e.target.closest('.subject-card');
            const field = e.target.dataset.field;
            updateSubject(card.dataset.id, field, e.target.innerHTML);
        }
    }, true); // Использовать 'capturing' для надежности

    // --- Первичный запуск ---
    renderSubjects();
    updateTimestamp();
});
