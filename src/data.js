// Demonstration inventory. Photos are of the named model/generation; the owner supplies actual stock photos.
const entries = [
  ['Toyota','Camry SE','Седан',2024,32500,'2.5 л · 203 hp','Серебристый','camry','Бензин','Автомат'],
  ['Toyota','Corolla LE','Седан',2024,26900,'2.0 л · 169 hp','Серебристый','corolla','Бензин','Вариатор'],
  ['Toyota','RAV4 Prime XSE','Кроссовер',2024,48400,'2.5 л Plug-in Hybrid · 302 hp','Серебристый','rav4','Гибрид','Вариатор'],
  ['Toyota','Land Cruiser 300 VX','Внедорожник',2024,112000,'3.5 л V6 Twin Turbo · 415 PS','Белый','land-cruiser','Бензин','Автомат'],
  ['Toyota','Highlander Hybrid','Кроссовер',2024,58900,'2.5 л Hybrid · 243 hp','Серый','highlander','Гибрид','Вариатор'],
  ['Mercedes-Benz','C 300 4MATIC','Седан',2024,54500,'2.0 л Turbo · 255 hp','Серебристый','c-class','Бензин','Автомат'],
  ['Mercedes-Benz','E 350 4MATIC','Седан',2024,68900,'2.0 л Turbo · 255 hp','Белый','e-class','Бензин','Автомат'],
  ['Mercedes-Benz','GLC 300 4MATIC','Кроссовер',2023,74200,'2.0 л Turbo · 255 hp','Белый','glc','Бензин','Автомат'],
  ['Mercedes-Benz','GLE 450 4MATIC','Кроссовер',2024,103000,'3.0 л Turbo · 375 hp','Серый','gle','Бензин','Автомат'],
  ['Mercedes-Benz','G 550','Внедорожник',2023,178000,'4.0 л V8 Biturbo · 416 hp','Синий','g-class','Бензин','Автомат'],
  ['Honda','Civic Touring','Седан',2024,27900,'1.5 л Turbo · 180 hp','Серебристый','civic','Бензин','Вариатор'],
  ['Honda','Accord Sport-L Hybrid','Седан',2024,34800,'2.0 л Hybrid · 204 hp','Синий','accord','Гибрид','Вариатор'],
  ['Honda','CR-V EX-L','Кроссовер',2024,39800,'1.5 л Turbo · 190 hp','Серый','cr-v','Бензин','Вариатор'],
  ['Honda','Pilot Touring','Внедорожник',2023,51200,'3.5 л V6 · 285 hp','Белый','pilot','Бензин','Автомат'],
  ['Honda','HR-V EX-L','Кроссовер',2024,36500,'2.0 л · 158 hp','Зелёный','hr-v','Бензин','Вариатор'],
  ['Lamborghini','Urus S','Кроссовер',2024,245000,'4.0 л V8 Biturbo · 666 CV','Зелёный','urus-s','Бензин','Автомат'],
  ['Lamborghini','Urus Performante','Кроссовер',2024,278000,'4.0 л V8 Biturbo · 666 CV','Жёлтый','urus-performante','Бензин','Автомат'],
  ['Lamborghini','Huracán EVO','Купе',2023,239000,'5.2 л V10 · 640 CV','Оранжевый','huracan-evo','Бензин','Робот'],
  ['Lamborghini','Huracán Tecnica','Купе',2024,269000,'5.2 л V10 · 640 CV','Зелёный','huracan-tecnica','Бензин','Робот'],
  ['Lamborghini','Revuelto','Купе',2024,608000,'6.5 л V12 Plug-in Hybrid · 1015 CV','Белый','revuelto','Гибрид','Робот'],
];
const passengerCars = entries.map(([brand,model,type,year,price,engine,color,slug,fuel,transmission],i)=>({
  id:i+1,category:'passenger',brand,model,name:`${brand} ${model}`,type,year,price,engine,color,image:`/cars/${slug}.jpg`,fuel,transmission,
  rating:[4.7,4.8,4.9,5][i%4],reviews:8+(i*7)%31,badge:i%3===0?'Хит продаж':i%3===1?'Новинка':'В наличии',
  description:`${brand} ${model}. Подробности о комплектации, состоянии, пробеге и наличии уточняйте у менеджера. Фотография иллюстрирует модель; перед покупкой запросите актуальные фотографии выбранного автомобиля.`,
  catalogVersion:2,
}));
// Example additions: prices describe the demo catalogue, not actual stock or market quotes.
const additions=[
  ['Yamaha','MT-07','Мотоцикл',2014,6900,'mt-07','moto','Бензин','Механика'],
  ['Honda','CBR500R','Мотоцикл',2023,7200,'cbr500r','moto','Бензин','Механика'],
  ['Kawasaki','Ninja 400','Мотоцикл',2018,5800,'ninja-400','moto','Бензин','Механика'],
  ['BMW','G 310 R','Мотоцикл',2017,4900,'g310r','moto','Бензин','Механика'],
  ['KTM','390 Duke','Мотоцикл',2015,5200,'duke-390','moto','Бензин','Механика'],
  ['Toyota','HiAce','Микроавтобус',2020,28500,'hiace','commercial','',''],
  ['Mercedes-Benz','Sprinter 314 CDI','Фургон',2019,34500,'sprinter','commercial','Дизель',''],
  ['Ford','Transit','Микроавтобус',2020,29900,'transit','commercial','Дизель',''],
];
export const additionalVehicles=additions.map(([brand,model,type,year,price,slug,category,fuel,transmission],index)=>({
 id:21+index,category,brand,model,name:brand+' '+model,type,year,price,image:'/cars/'+slug+'.jpg',fuel,transmission,
 engine:'Комплектация по запросу',color:'Уточняется',rating:4.8,reviews:0,badge:'Демо · пример',isDemo:true,catalogVersion:3,
 description:'Демонстрационная карточка для примера каталога. Цена, год и комплектация приведены как образец. Наличие и характеристики конкретной техники необходимо уточнить. Фотография иллюстрирует модель.',
}));
export const seedCars=[...passengerCars,...additionalVehicles];
export function addCatalogSamples(cars){
 const result=[...cars];let nextId=Math.max(28,...cars.map(car=>Number(car.id)||0))+1;
 for(const sample of additionalVehicles){if(result.some(car=>car.name===sample.name))continue;result.push({...sample,id:result.some(car=>Number(car.id)===sample.id)?nextId++:sample.id});}
 return result;
}
const legacyModels=['Camry Comfort','Camry Premium','RAV4 Adventure','Land Cruiser 300','Highlander Hybrid','C-Class Avantgarde','E-Class Exclusive','GLC 300 4MATIC','GLE 450','G-Class G 500','Civic Elegance','Accord Sport','CR-V Lifestyle','Pilot Touring','ZR-V Advance','Urus S','Urus Performante','Huracán EVO','Huracán Tecnica','Revuelto'];
export function repairSeedCars(cars) {
  return cars.map(car => {
    const i=Number(car.id)-1;
    // Repair only unchanged sample entries. Preserve cars and photos entered by the owner.
    if(!seedCars[i] || car.brand!==seedCars[i].brand || car.model!==legacyModels[i] || !String(car.image).startsWith('https://images.unsplash.com/')) return car;
    const {price:unusedPrice,rating:unusedRating,reviews:unusedReviews,badge:unusedBadge,...corrected}=seedCars[i];
    return {...car,...corrected};
  });
}
export const photoFallback = '/cars/unavailable.svg';
