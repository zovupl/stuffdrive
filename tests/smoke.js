// Дымовые тесты бэкенда StuffDrive (Google Apps Script + Firestore).
// Запуск:  node tests/smoke.js            — только публичные проверки (без секретов)
//          SETUP_SECRET=... node tests/smoke.js — плюс служебные op:'info'
// Ничего не создаёт в базе: все брони в тестах намеренно невалидные и отклоняются сервером.

const WEBHOOK = 'https://script.google.com/macros/s/AKfycbwAOinpNUXY5NIAW-vznHcZ0AEatdC-zaZcaUQwwSpgIqbyTU68hZAOVcsH5mb4LY4ZKQ/exec';
const FS = 'https://firestore.googleapis.com/v1/projects/stuffdrive-pas/databases/(default)/documents';
const PAGES = 'https://zovupl.github.io/stuffdrive/';

let failed = 0;
function check(name, ok, extra) {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (extra ? '  ' + extra : ''));
  if (!ok) failed++;
}
async function post(body) {
  const r = await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), redirect: 'follow' });
  return r.json();
}
function iso(d) { return d.toISOString().slice(0, 10); }

(async () => {
  console.log('Webhook');
  const ping = await fetch(WEBHOOK, { redirect: 'follow' }).then(r => r.text());
  check('GET отвечает', ping.includes('stuffdrive webhook ok'), ping.slice(0, 40));
  check('мусор → bad_request', (await post({ hello: 1 })).error === 'bad_request');

  console.log('Бронь: валидация (ничего не создаётся)');
  const today = new Date(); const past = new Date(today.getTime() - 5 * 86400000); const far = new Date(today.getTime() + 90 * 86400000);
  check('без полей → bad_fields', (await post({ type: 'booking', booking: {} })).error === 'bad_fields');
  check('дата в прошлом → past', (await post({ type: 'booking', booking: { carId: 'audi-a4', from: iso(past), to: iso(past), name: 'T', phone: '1' } })).error === 'past');
  check('to < from → bad_dates', (await post({ type: 'booking', booking: { carId: 'audi-a4', from: iso(far), to: iso(today), name: 'T', phone: '1' } })).error === 'bad_dates');
  check('несуществующая машина → no_car', (await post({ type: 'booking', booking: { carId: 'nope-car', from: iso(far), to: iso(far), name: 'T', phone: '1' } })).error === 'no_car');
  check('>60 дней → too_long', (await post({ type: 'booking', booking: { carId: 'audi-a4', from: iso(today), to: iso(far), name: 'T', phone: '1' } })).error === 'too_long');

  console.log('Клиент / админ без подписи');
  check('client cancel без токена → ошибка', !(await post({ type: 'client', op: 'cancel', bookingId: 'bk_none', token: 'x' })).ok);
  const adm = await post({ type: 'admin', op: 'whoami', initData: 'query_id=1&user=%7B%22id%22%3A1%7D&hash=deadbeef' });
  check('admin с поддельной подписью → не админ', !adm.isAdmin && !adm.ok, JSON.stringify(adm).slice(0, 80));

  console.log('Firestore (правила)');
  const cars = await fetch(FS + '/cars').then(r => r.json());
  check('cars читаются публично', Array.isArray(cars.documents) && cars.documents.length >= 1, (cars.documents || []).length + ' машин');
  const bk = await fetch(FS + '/bookings').then(r => r.status);
  check('bookings закрыты для чтения (403)', bk === 403, 'status ' + bk);
  const av = await fetch(FS + '/availability').then(r => r.json());
  check('availability читается публично', Array.isArray(av.documents), (av.documents || []).length + ' документов');
  const created = await fetch(FS + '/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { name: { stringValue: 'x' } } }) }).then(r => r.status);
  check('прямое создание брони запрещено (403)', created === 403, 'status ' + created);

  console.log('GitHub Pages');
  const html = await fetch(PAGES + 'index.html').then(r => r.text());
  check('index.html отдаётся', html.includes('StuffDrive') || html.includes('STUFFDRIVE'));
  check('абзац о данных (🔒) есть', html.includes('🔒'));
  const cfg = await fetch(PAGES + 'firebase-config.js').then(r => r.text());
  check('SUPPORT_LINK = @stuffdrive', cfg.includes('t.me/stuffdrive"'));

  if (process.env.SETUP_SECRET) {
    console.log('Служебное');
    const info = await post({ type: 'setup', secret: process.env.SETUP_SECRET, op: 'info' });
    check('op:info ok', info.ok === true, 'hb_date=' + info.hb_date + ' offset=' + info.offset);
    check('календари доступны', Array.isArray(info.calendars) ? info.calendars.every(c => c.ok !== false) : !!info.calendars);
  }

  console.log(failed ? `\n${failed} проверок упало` : '\nВсе проверки прошли');
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
