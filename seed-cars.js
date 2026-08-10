// Заливка автопарка в Firestore. Запуск: node seed-cars.js <access_token>
// Токен берётся из логина firebase CLI (см. CLAUDE.md проекта).
const PROJECT = 'stuffdrive-pas';

const CARS = [
  {id:'c1', name:'Fiat 500 Cabrio', cls:'Compacto', shape:'low', color:'#E9D6C0', priceperday:39, year:'2022', seats:4, doors:3, trans:'Manual', fuel:'Gasolina', consumo:'5.2 L', features:['A/C','Bluetooth','Descapotable']},
  {id:'c2', name:'VW T-Roc', cls:'SUV', shape:'tall', color:'#D8E1DE', priceperday:59, year:'2023', seats:5, doors:5, trans:'Automático', fuel:'Diésel', consumo:'5.6 L', features:['A/C','CarPlay','Techo panorámico']},
  {id:'c3', name:'Mini Cooper S', cls:'Compacto', shape:'mid', color:'#E3C9C1', priceperday:49, year:'2021', seats:4, doors:3, trans:'Manual', fuel:'Gasolina', consumo:'6.0 L', features:['A/C','Bluetooth']},
  {id:'c4', name:'Mercedes Clase C', cls:'Premium', shape:'mid', color:'#D9D9D9', priceperday:89, year:'2023', seats:5, doors:4, trans:'Automático', fuel:'Híbrido', consumo:'4.8 L', features:['Cuero','CarPlay','Asist. carril']},
  {id:'c5', name:'Fiat Panda', cls:'Económico', shape:'mid', color:'#EFE3C8', priceperday:29, year:'2020', seats:5, doors:5, trans:'Manual', fuel:'Gasolina', consumo:'5.4 L', features:['A/C','Radio USB']},
  {id:'c6', name:'BMW X1', cls:'SUV', shape:'tall', color:'#CFE0DD', priceperday:75, year:'2022', seats:5, doors:5, trans:'Automático', fuel:'Diésel', consumo:'5.9 L', features:['A/C','CarPlay','Sensores']},
  {id:'c7', name:'Renault Clio', cls:'Económico', shape:'mid', color:'#E4D2DA', priceperday:32, year:'2021', seats:5, doors:5, trans:'Manual', fuel:'Gasolina', consumo:'5.3 L', features:['A/C','Bluetooth']},
  {id:'c8', name:'Tesla Model 3', cls:'Eléctrico', shape:'low', color:'#D6D9E0', priceperday:95, year:'2023', seats:5, doors:4, trans:'Automático', fuel:'Eléctrico', consumo:'0 L', features:['Autopilot','Carga rápida','CarPlay']},
];

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
  let order = 0;
  for (const car of CARS) {
    const {id, ...data} = car;
    data.order = ++order;
    data.active = true;
    const fields = {};
    for (const k in data) fields[k] = toFv(data[k]);
    const res = await fetch(`${base}/cars/${id}`, {
      method: 'PATCH',
      headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({fields}),
    });
    console.log(id, data.name, '->', res.status, res.ok ? 'OK' : await res.text());
  }
}
main();
