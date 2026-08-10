// Конфиг Firebase (проект stuffdrive-pas, zovu.pl@gmail.com).
// apiKey — публичный идентификатор (не секрет); доступ ограничен правилами Firestore.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyB8hanCKlazB5K9CWq6SnqKj9faay6jCJU",
  projectId: "stuffdrive-pas"
};

// URL вебхука (Google Apps Script), который постит новые заявки в топик группы.
// Пока null — уведомления отключены. Заполняется на этапе 2.
window.NOTIFY_WEBHOOK = null;
