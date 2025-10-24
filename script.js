// Функция для добавления ведущего нуля к числам (например, 7 -> "07")
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

// Эта функция сработает, как только страница полностью загрузится
window.onload = function() {
    // Находим на странице элемент с id="last-updated"
    const dateElement = document.getElementById('last-updated');

    // Создаем объект текущей даты и времени
    const now = new Date();

    // Форматируем дату в формат ДД.ММ.ГГГГ
    const date = [
        padTo2Digits(now.getDate()),
        padTo2Digits(now.getMonth() + 1), // Месяцы начинаются с 0
        now.getFullYear(),
    ].join('.');

    // Форматируем время в формат ЧЧ:ММ
    const time = [
        padTo2Digits(now.getHours()),
        padTo2Digits(now.getMinutes()),
    ].join(':');

    // Обновляем текст в элементе
    dateElement.textContent = `Обновлено: ${date}, ${time}`;
};
