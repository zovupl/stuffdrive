// Заливка автопарка в Firestore. Запуск: node seed-cars.js <access_token>
// Данные машин: спеки подтверждены по фото (10.08.2026), ЦЕНЫ — ЗАГЛУШКИ, уточнить у владельца!
const PROJECT = 'stuffdrive-pas';

const CARS = [
  {
    id: 'audi-a4',
    name: 'Audi A4 Avant', cls: 'estate',
    priceperday: 55, // PLACEHOLDER
    year: '2020', seats: 5, doors: 5, trans: 'auto', fuel: 'diesel',
    features: ['ac','leather','navi','heated','sensors','led'],
    photos: ['img/audi-a4/1.jpg','img/audi-a4/2.jpg','img/audi-a4/3.jpg','img/audi-a4/4.jpg','img/audi-a4/5.jpg'],
  },
  {
    id: 'camaro-ss',
    name: 'Chevrolet Camaro SS', cls: 'muscle',
    priceperday: 110, // PLACEHOLDER
    year: '2017', seats: 4, doors: 2, trans: 'auto', fuel: 'petrol',
    features: ['sport','led','ac','bluetooth'],
    photos: ['img/camaro-ss/1.jpg','img/camaro-ss/2.jpg','img/camaro-ss/3.jpg','img/camaro-ss/4.jpg','img/camaro-ss/5.jpg'],
  },
  {
    id: 'discovery-sport',
    name: 'Land Rover Discovery Sport', cls: 'suv',
    priceperday: 75, // PLACEHOLDER
    year: '2020', seats: 5, doors: 5, trans: 'auto', fuel: 'diesel',
    features: ['ac','leather','panorama','navi','sensors'],
    photos: ['img/discovery-sport/1.jpg','img/discovery-sport/2.jpg','img/discovery-sport/3.jpg','img/discovery-sport/4.jpg','img/discovery-sport/5.jpg'],
  },
  {
    id: 'mini-cooper',
    name: 'Mini Cooper', cls: 'compact',
    priceperday: 49, // PLACEHOLDER
    year: '2025', seats: 4, doors: 3, trans: 'auto', fuel: 'petrol',
    features: ['ac','leather','panorama','keyless','bluetooth'],
    photos: ['img/mini-cooper/1.jpg','img/mini-cooper/2.jpg','img/mini-cooper/3.jpg','img/mini-cooper/4.jpg','img/mini-cooper/5.jpg'],
  },
];

// Старые демо-документы, которые нужно удалить
const DELETE_IDS = ['c1','c2','c3','c4','c5','c6','c7','c8'];

function toFv(x){
  if (x === null || x === undefined) return {nullValue: null};
  if (typeof x === 'string') return {stringValue: x};
  if (typeof x === 'number') return Number.isInteger(x) ? {integerValue: String(x)} : {doubleValue: x};
  if (typeof x === 'boolean') return {booleanValue: x};
  if (Array.isArray(x)) return {arrayValue: {values: x.map(toFv)}};
  if (typeof x === 'object'){ const f = {}; for (const k in x) f[k] = toFv(x[k]); return {mapValue: {fields: f}}; }
  return {nullValue: null};
}

async function main(){
  const token = process.argv[2];
  if (!token) { console.error('usage: node seed-cars.js <access_token>'); process.exit(1); }
  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
  const H = {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'};

  for (const id of DELETE_IDS) {
    const res = await fetch(`${base}/cars/${id}`, {method: 'DELETE', headers: H});
    console.log('delete', id, '->', res.status);
  }

  let order = 0;
  for (const car of CARS) {
    const {id, ...data} = car;
    data.order = ++order;
    data.active = true;
    const fields = {};
    for (const k in data) fields[k] = toFv(data[k]);
    const res = await fetch(`${base}/cars/${id}`, {
      method: 'PATCH', headers: H,
      body: JSON.stringify({fields}),
    });
    console.log('upsert', id, '->', res.status, res.ok ? 'OK' : await res.text());
  }
}
main();
