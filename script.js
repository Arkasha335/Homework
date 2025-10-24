// App State
let subjects = [];
let currentEditingSubject = null;
let currentEditingHomework = null;

// DOM Elements
const subjectsContainer = document.getElementById('subjectsContainer');
const emptyState = document.getElementById('emptyState');
const subjectModal = document.getElementById('subjectModal');
const homeworkModal = document.getElementById('homeworkModal');
const modalTitle = document.getElementById('modalTitle');
const homeworkModalTitle = document.getElementById('homeworkModalTitle');
const subjectNameInput = document.getElementById('subjectName');
const homeworkTextarea = document.getElementById('homeworkText');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const subjectCount = document.querySelector('.subject-count');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadSubjects();
    renderSubjects();
    initializeEventListeners();
});

// Event Listeners
function initializeEventListeners() {
    // Add Subject Button
    document.getElementById('addSubjectBtn').addEventListener('click', openAddSubjectModal);
    
    // Modal Controls
    document.getElementById('closeModal').addEventListener('click', closeSubjectModal);
    document.getElementById('cancelBtn').addEventListener('click', closeSubjectModal);
    document.getElementById('saveSubjectBtn').addEventListener('click', saveSubject);
    
    document.getElementById('closeHomeworkModal').addEventListener('click', closeHomeworkModal);
    document.getElementById('cancelHomeworkBtn').addEventListener('click', closeHomeworkModal);
    document.getElementById('saveHomeworkBtn').addEventListener('click', saveHomework);
    
    // Icon Selector
    document.querySelectorAll('.icon-option').forEach(btn => {
        btn.addEventListener('click', () => selectIcon(btn));
    });
    
    // Color Selector
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => selectColor(btn));
    });
    
    // Close modal on outside click
    subjectModal.addEventListener('click', (e) => {
        if (e.target === subjectModal) closeSubjectModal();
    });
    
    homeworkModal.addEventListener('click', (e) => {
        if (e.target === homeworkModal) closeHomeworkModal();
    });
    
    // Enter key support for input
    subjectNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveSubject();
    });
}

// Subject Management
function loadSubjects() {
    const stored = localStorage.getItem('homework_subjects');
    if (stored) {
        subjects = JSON.parse(stored);
    }
}

function saveSubjectsToStorage() {
    localStorage.setItem('homework_subjects', JSON.stringify(subjects));
}

function renderSubjects() {
    subjectsContainer.innerHTML = '';
    
    if (subjects.length === 0) {
        emptyState.classList.add('visible');
        subjectCount.textContent = '0 предметов';
        return;
    }
    
    emptyState.classList.remove('visible');
    subjectCount.textContent = `${subjects.length} ${getSubjectWord(subjects.length)}`;
    
    subjects.forEach(subject => {
        const card = createSubjectCard(subject);
        subjectsContainer.appendChild(card);
    });
}

function createSubjectCard(subject) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.style.setProperty('--card-gradient', subject.color);
    
    const lastUpdate = formatTimestamp(subject.updatedAt);
    const homeworkContent = subject.homework ? 
        `<div class="homework-content">${escapeHtml(subject.homework)}</div>` :
        `<button class="add-homework-btn" onclick="openHomeworkModal('${subject.id}')">
            <i class="fas fa-plus-circle"></i>
            <span>Добавить задание</span>
        </button>`;
    
    card.innerHTML = `
        <div class="subject-header">
            <div class="subject-icon" style="background: ${subject.color}">
                <i class="fas ${subject.icon}"></i>
            </div>
            <div class="subject-info">
                <h3 class="subject-name">${escapeHtml(subject.name)}</h3>
                <div class="subject-timestamp">
                    <i class="far fa-clock"></i>
                    <span>${lastUpdate}</span>
                </div>
            </div>
            <div class="subject-actions">
                <button class="action-btn" onclick="editSubject('${subject.id}')" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteSubject('${subject.id}')" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="homework-section">
            ${homeworkContent}
        </div>
    `;
    
    // Add click handler for homework content
    const homeworkContentEl = card.querySelector('.homework-content');
    if (homeworkContentEl) {
        homeworkContentEl.addEventListener('click', () => openHomeworkModal(subject.id));
        homeworkContentEl.style.cursor = 'pointer';
    }
    
    return card;
}

// Modal Functions
function openAddSubjectModal() {
    currentEditingSubject = null;
    modalTitle.textContent = 'Новый предмет';
    subjectNameInput.value = '';
    resetIconSelector();
    resetColorSelector();
    subjectModal.classList.add('active');
    subjectNameInput.focus();
}

function openEditSubjectModal(subject) {
    currentEditingSubject = subject.id;
    modalTitle.textContent = 'Редактировать предмет';
    subjectNameInput.value = subject.name;
    
    // Set selected icon
    resetIconSelector();
    const iconBtn = document.querySelector(`[data-icon="${subject.icon}"]`);
    if (iconBtn) iconBtn.classList.add('active');
    
    // Set selected color
    resetColorSelector();
    const colorBtn = document.querySelector(`[data-color="${subject.color}"]`);
    if (colorBtn) colorBtn.classList.add('active');
    
    subjectModal.classList.add('active');
    subjectNameInput.focus();
}

function closeSubjectModal() {
    subjectModal.classList.remove('active');
    currentEditingSubject = null;
}

function openHomeworkModal(subjectId) {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    currentEditingHomework = subjectId;
    homeworkModalTitle.textContent = `${subject.name} - Домашнее задание`;
    homeworkTextarea.value = subject.homework || '';
    homeworkModal.classList.add('active');
    homeworkTextarea.focus();
}

function closeHomeworkModal() {
    homeworkModal.classList.remove('active');
    currentEditingHomework = null;
}

// Save Functions
function saveSubject() {
    const name = subjectNameInput.value.trim();
    if (!name) {
        showToast('Введите название предмета', 'error');
        return;
    }
    
    const selectedIcon = document.querySelector('.icon-option.active');
    const selectedColor = document.querySelector('.color-option.active');
    
    const icon = selectedIcon ? selectedIcon.dataset.icon : 'fa-book';
    const color = selectedColor ? selectedColor.dataset.color : '#667EEA';
    
    if (currentEditingSubject) {
        // Edit existing subject
        const subject = subjects.find(s => s.id === currentEditingSubject);
        if (subject) {
            subject.name = name;
            subject.icon = icon;
            subject.color = color;
            subject.updatedAt = Date.now();
            showToast('Предмет обновлен');
        }
    } else {
        // Add new subject
        const newSubject = {
            id: generateId(),
            name: name,
            icon: icon,
            color: color,
            homework: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        subjects.unshift(newSubject);
        showToast('Предмет добавлен');
    }
    
    saveSubjectsToStorage();
    renderSubjects();
    closeSubjectModal();
}

function saveHomework() {
    const subject = subjects.find(s => s.id === currentEditingHomework);
    if (!subject) return;
    
    subject.homework = homeworkTextarea.value.trim();
    subject.updatedAt = Date.now();
    
    saveSubjectsToStorage();
    renderSubjects();
    closeHomeworkModal();
    showToast('Задание сохранено');
}

// Action Functions
function editSubject(id) {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
        openEditSubjectModal(subject);
    }
}

function deleteSubject(id) {
    if (confirm('Удалить этот предмет и все его задания?')) {
        subjects = subjects.filter(s => s.id !== id);
        saveSubjectsToStorage();
        renderSubjects();
        showToast('Предмет удален');
    }
}

// UI Helper Functions
function selectIcon(btn) {
    document.querySelectorAll('.icon-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function selectColor(btn) {
    document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function resetIconSelector() {
    document.querySelectorAll('.icon-option').forEach(b => b.classList.remove('active'));
    document.querySelector('.icon-option').classList.add('active');
}

function resetColorSelector() {
    document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
    document.querySelector('.color-option').classList.add('active');
}

function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    const icon = toast.querySelector('i');
    
    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = '#FF3B30';
    } else {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#43E97B';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatTimestamp(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} ${getMinuteWord(minutes)} назад`;
    if (hours < 24) return `${hours} ${getHourWord(hours)} назад`;
    if (days < 7) return `${days} ${getDayWord(days)} назад`;
    
    return new Date(timestamp).toLocaleDateString('ru-RU');
}

function getSubjectWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'предметов';
    if (lastDigit === 1) return 'предмет';
    if (lastDigit >= 2 && lastDigit <= 4) return 'предмета';
    return 'предметов';
}

function getMinuteWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'минут';
    if (lastDigit === 1) return 'минуту';
    if (lastDigit >= 2 && lastDigit <= 4) return 'минуты';
    return 'минут';
}

function getHourWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'часов';
    if (lastDigit === 1) return 'час';
    if (lastDigit >= 2 && lastDigit <= 4) return 'часа';
    return 'часов';
}

function getDayWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'дней';
    if (lastDigit === 1) return 'день';
    if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    return 'дней';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally accessible
window.editSubject = editSubject;
window.deleteSubject = deleteSubject;
window.openHomeworkModal = openHomeworkModal;
