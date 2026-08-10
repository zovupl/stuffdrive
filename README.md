# Stuffdrive — Pablo Auto Spain

Telegram Mini App для аренды машин в Барселоне. Работает внутри Telegram через бота [@stuffdrivebot](https://t.me/stuffdrivebot) в группе [StuffDive](https://t.me/StuffDive).

**Сайт (Mini App):** https://zovupl.github.io/stuffdrive/

- `index.html` — приложение (каталог машин, свайп-карточки, форма брони)
- `firebase-config.js` — конфиг Firebase (Firestore) и URL вебхука уведомлений; при `null` работает демо-режим

Данные: Firebase Firestore — коллекции `cars` (машины) и `bookings` (заявки).
