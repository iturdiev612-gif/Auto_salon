/* TURDIEV AUTO 2.0
   Frontend uses Supabase Auth + PostgreSQL when configured.
   Public key only in supabase-config.js. Secret/service_role key must stay server-side.
*/
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from "./supabase-config.js";

const WHATSAPP_NUMBER = "996999425453";
const STORAGE = {
  favorites: "ta2_favorites",
  cart: "ta2_cart",
  theme: "ta2_theme",
  lang: "ta2_lang",
};
const img = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const seedCars = [
  [
    "Mercedes-Benz",
    "C 200",
    2023,
    42000,
    "Sedan",
    "2.0 Turbo",
    66,
    204,
    "RWD",
    18000,
    "photo-1618843479313-40f8afb4b4d8",
    "Комфортный премиальный седан для города и дальних поездок.",
    "C-Class известен сочетанием комфорта, технологий и сдержанного дизайна.",
  ],
  [
    "Mercedes-Benz",
    "E 300",
    2024,
    62500,
    "Sedan",
    "2.0 Turbo",
    66,
    258,
    "RWD",
    9000,
    "photo-1618843479313-40f8afb4b4d8",
    "Бизнес-седан с просторным салоном и плавным ходом.",
    "E-Class — одна из ключевых бизнес-моделей Mercedes-Benz.",
  ],
  [
    "Mercedes-Benz",
    "S 500",
    2023,
    118000,
    "Sedan",
    "3.0 Turbo",
    76,
    435,
    "4MATIC",
    12000,
    "photo-1618843479313-40f8afb4b4d8",
    "Флагманский седан с высоким уровнем комфорта.",
    "S-Class десятилетиями служит технологической витриной марки.",
  ],
  [
    "Mercedes-Benz",
    "GLC 300",
    2024,
    59000,
    "SUV",
    "2.0 Turbo",
    62,
    255,
    "4MATIC",
    8000,
    "photo-1519641471654-76ce0107ad1b",
    "Универсальный премиальный кроссовер.",
    "GLC сочетает комфорт и практичность среднеразмерного SUV.",
  ],
  [
    "Mercedes-Benz",
    "GLE 450",
    2023,
    79500,
    "SUV",
    "3.0 Turbo",
    85,
    362,
    "4MATIC",
    16000,
    "photo-1519641471654-76ce0107ad1b",
    "Просторный SUV для семьи и дальних путешествий.",
    "GLE продолжает традиции комфортных крупных кроссоверов марки.",
  ],
  [
    "Mercedes-Benz",
    "AMG C 43",
    2024,
    72000,
    "Sedan",
    "2.0 Turbo",
    66,
    402,
    "4MATIC",
    6000,
    "photo-1618843479313-40f8afb4b4d8",
    "Спортивный характер AMG и динамичный внешний вид.",
    "AMG создаёт высокопроизводительные версии Mercedes-Benz.",
  ],
  [
    "Mercedes-Benz",
    "CLA 250",
    2022,
    36500,
    "Coupe",
    "2.0 Turbo",
    51,
    221,
    "FWD",
    25000,
    "photo-1503376780353-7e6692767b70",
    "Стильное купе с выразительной линией крыши.",
    "CLA — более молодая дизайнерская интерпретация компактного Mercedes.",
  ],
  [
    "Mercedes-Benz",
    "GLA 250",
    2023,
    39500,
    "SUV",
    "2.0 Turbo",
    51,
    221,
    "4MATIC",
    14000,
    "photo-1519641471654-76ce0107ad1b",
    "Компактный кроссовер для активной городской жизни.",
    "GLA — компактная модель SUV-линейки Mercedes-Benz.",
  ],
  [
    "Mercedes-Benz",
    "EQS 450+",
    2023,
    99000,
    "Sedan",
    "Электро",
    0,
    360,
    "RWD",
    11000,
    "photo-1560958089-b8a1929j2w",
    "Электрический представительский седан.",
    "EQS представляет электрическое направление Mercedes-Benz.",
  ],
  [
    "Mercedes-Benz",
    "G 500",
    2022,
    145000,
    "SUV",
    "4.0 V8",
    100,
    422,
    "4WD",
    22000,
    "photo-1519641471654-76ce0107ad1b",
    "Легендарный внедорожник с узнаваемым силуэтом.",
    "G-Class начинался как внедорожник и стал культовой моделью.",
  ],
  [
    "Toyota",
    "Camry 2.5",
    2024,
    34500,
    "Sedan",
    "2.5 бензин",
    60,
    203,
    "FWD",
    7000,
    "photo-1621007947382-bb3c3994e3fb",
    "Практичный бизнес-седан для ежедневных поездок.",
    "Camry ценят за комфорт и практичность.",
  ],
  [
    "Toyota",
    "Corolla",
    2023,
    22500,
    "Sedan",
    "1.8 бензин",
    50,
    139,
    "FWD",
    15000,
    "photo-1621007947382-bb3c3994e3fb",
    "Экономичный автомобиль на каждый день.",
    "Corolla — одна из наиболее известных массовых моделей в мире.",
  ],
  [
    "Toyota",
    "RAV4",
    2024,
    36500,
    "SUV",
    "2.5 гибрид",
    55,
    219,
    "AWD",
    5000,
    "photo-1519641471654-76ce0107ad1b",
    "Универсальный кроссовер для города и путешествий.",
    "RAV4 помог популяризировать компактные кроссоверы.",
  ],
  [
    "Toyota",
    "Land Cruiser 300",
    2023,
    98000,
    "SUV",
    "3.5 V6 Twin Turbo",
    110,
    409,
    "4WD",
    14000,
    "photo-1519641471654-76ce0107ad1b",
    "Большой внедорожник для дальних маршрутов.",
    "Land Cruiser известен выносливостью на разных континентах.",
  ],
  [
    "Toyota",
    "Hilux",
    2022,
    38500,
    "Pickup",
    "2.8 дизель",
    80,
    204,
    "4WD",
    29000,
    "photo-1533473359331-0135ef1b58bf",
    "Практичный пикап с рабочим характером.",
    "Hilux применяют как в работе, так и в путешествиях.",
  ],
  [
    "Toyota",
    "Prius",
    2023,
    28500,
    "Hatchback",
    "1.8 гибрид",
    43,
    138,
    "FWD",
    9000,
    "photo-1492144534655-ae79c964c9d7",
    "Гибрид для экономичных городских поездок.",
    "Prius стал одним из самых узнаваемых массовых гибридов.",
  ],
  [
    "Toyota",
    "Highlander",
    2023,
    47500,
    "SUV",
    "2.5 гибрид",
    65,
    243,
    "AWD",
    18000,
    "photo-1519641471654-76ce0107ad1b",
    "Семейный кроссовер с просторным салоном.",
    "Highlander ориентирован на семейный комфорт и универсальность.",
  ],
  [
    "Toyota",
    "Supra",
    2022,
    52000,
    "Coupe",
    "3.0 Turbo",
    52,
    382,
    "RWD",
    13000,
    "photo-1503376780353-7e6692767b70",
    "Спортивное купе с ярким характером.",
    "Supra — известное имя в спортивной истории Toyota.",
  ],
  [
    "Toyota",
    "Yaris",
    2022,
    18500,
    "Hatchback",
    "1.5 бензин",
    40,
    106,
    "FWD",
    21000,
    "photo-1492144534655-ae79c964c9d7",
    "Компактный городской автомобиль.",
    "Yaris ориентирован на удобство и экономичность.",
  ],
  [
    "Toyota",
    "Crown",
    2024,
    43500,
    "Sedan",
    "2.5 гибрид",
    55,
    236,
    "AWD",
    4000,
    "photo-1621007947382-bb3c3994e3fb",
    "Комфортная модель с гибридной силовой установкой.",
    "Crown — историческое имя в линейке Toyota.",
  ],
  [
    "BMW",
    "320i",
    2023,
    39500,
    "Sedan",
    "2.0 Turbo",
    59,
    184,
    "RWD",
    17000,
    "photo-1555215695-3004980ad54e",
    "Спортивный седан с точным рулевым управлением.",
    "3 Series стала эталоном спортивного седана для многих поклонников.",
  ],
  [
    "BMW",
    "330i",
    2024,
    45500,
    "Sedan",
    "2.0 Turbo",
    59,
    255,
    "RWD",
    6000,
    "photo-1555215695-3004980ad54e",
    "Динамичный седан для активного вождения.",
    "3 Series сочетает практичность с настройкой на водителя.",
  ],
  [
    "BMW",
    "530i",
    2023,
    58500,
    "Sedan",
    "2.0 Turbo",
    60,
    248,
    "RWD",
    14000,
    "photo-1555215695-3004980ad54e",
    "Бизнес-седан с комфортным салоном.",
    "5 Series объединяет комфорт и управляемость.",
  ],
  [
    "BMW",
    "M3 Competition",
    2024,
    89000,
    "Sedan",
    "3.0 Twin Turbo",
    59,
    503,
    "RWD",
    3000,
    "photo-1555215695-3004980ad54e",
    "Высокопроизводительный спортивный седан.",
    "M3 выросла из автоспортивных традиций BMW M.",
  ],
  [
    "BMW",
    "X3 xDrive30i",
    2023,
    51000,
    "SUV",
    "2.0 Turbo",
    65,
    248,
    "AWD",
    15000,
    "photo-1519641471654-76ce0107ad1b",
    "Среднеразмерный SUV с хорошим балансом комфорта.",
    "X3 сочетает практичность с характерной настройкой шасси.",
  ],
  [
    "BMW",
    "X5 xDrive40i",
    2024,
    79500,
    "SUV",
    "3.0 Turbo",
    83,
    375,
    "AWD",
    7000,
    "photo-1519641471654-76ce0107ad1b",
    "Просторный премиальный SUV.",
    "X5 стал одним из ключевых ранних SUV BMW.",
  ],
  [
    "BMW",
    "X6",
    2022,
    68500,
    "SUV",
    "3.0 Turbo",
    83,
    335,
    "AWD",
    26000,
    "photo-1519641471654-76ce0107ad1b",
    "Кроссовер-купе с эффектным силуэтом.",
    "X6 популяризировал формат спортивного SUV-купе.",
  ],
  [
    "BMW",
    "Z4 M40i",
    2023,
    62000,
    "Coupe",
    "3.0 Turbo",
    52,
    382,
    "RWD",
    8000,
    "photo-1503376780353-7e6692767b70",
    "Спортивный родстер для ярких поездок.",
    "Z4 продолжает традицию открытых спортивных автомобилей BMW.",
  ],
  [
    "BMW",
    "i4 eDrive40",
    2023,
    57000,
    "Sedan",
    "Электро",
    0,
    335,
    "RWD",
    10000,
    "photo-1555215695-3004980ad54e",
    "Электрический Gran Coupe с современным интерьером.",
    "i4 переносит формат Gran Coupe в электрическую эпоху.",
  ],
  [
    "BMW",
    "M8 Competition",
    2022,
    132000,
    "Coupe",
    "4.4 V8 Twin Turbo",
    68,
    617,
    "xDrive",
    12000,
    "photo-1503376780353-7e6692767b70",
    "Флагманское спортивное купе с мощным V8.",
    "M8 объединяет роскошь 8 Series и инженерию BMW M.",
  ],
].map((r, i) => ({
  id: i + 1,
  brand: r[0],
  model: r[1],
  year: r[2],
  price: r[3],
  body: r[4],
  engine: r[5],
  fuel: r[6],
  hp: r[7],
  drive: r[8],
  km: r[9],
  image: img(r[10]),
  desc: r[11],
  history: r[12],
}));

let supabase = null,
  user = null,
  profile = null,
  cars = [...seedCars],
  favorites = load(STORAGE.favorites, []),
  cart = load(STORAGE.cart, []);
let currentBrand = "all",
  currentPage = 1,
  pageSize = 9,
  authMode = "login",
  editingId = null,
  bookings = [];
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
function load(k, f) {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? f;
  } catch {
    return f;
  }
}
function save(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}
function esc(v = "") {
  return String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}
function toast(s) {
  const el = $("#toast");
  el.textContent = s;
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("show"), 3000);
}
function getCar(id) {
  return cars.find((c) => Number(c.id) === Number(id));
}
function toDb(c) {
  return {
    brand: c.brand,
    model: c.model,
    year: c.year,
    price: c.price,
    body: c.body,
    engine: c.engine,
    fuel_liters: c.fuel,
    horsepower: c.hp,
    drive: c.drive,
    mileage_km: c.km,
    image_url: c.image,
    description: c.desc,
    history: c.history,
  };
}
function fromDb(c) {
  return {
    id: c.id,
    brand: c.brand,
    model: c.model,
    year: c.year,
    price: Number(c.price),
    body: c.body,
    engine: c.engine,
    fuel: c.fuel_liters || 0,
    hp: c.horsepower || 0,
    drive: c.drive || "—",
    km: c.mileage_km || 0,
    image: c.image_url || img("photo-1492144534655-ae79c964c9d7"),
    desc: c.description || "",
    history: c.history || "",
  };
}
async function initSupabase() {
  if (!isSupabaseConfigured) {
    toast("Supabase ещё не настроен — показан демонстрационный каталог");
    return;
  }
  const { createClient } =
    await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) console.error(error);
  user = session?.user || null;
  if (user) await loadProfile();
  await loadCars();
  await supabase.auth.onAuthStateChange((_event, session) => {
    user = session?.user || null;
    setTimeout(async () => {
      if (user) await loadProfile();
      else profile = null;
      renderAll();
    }, 0);
  });
  renderAll();
}
async function loadProfile() {
  if (!supabase || !user) return;
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name,role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    console.error(error);
    profile = {
      display_name: user.email?.split("@")[0] || "Пользователь",
      role: "user",
    };
    return;
  }
  profile = data || {
    display_name: user.user_metadata?.display_name || user.email?.split("@")[0],
    role: "user",
  };
}
async function loadCars() {
  if (!supabase) return;
  const { data, error } = await supabase.from("cars").select("*").order("id");
  if (error) {
    console.warn("Не удалось загрузить автомобили из БД:", error.message);
    toast("Не удалось загрузить базу. Проверь SQL и политики Supabase.");
    return;
  }
  if (data && data.length) cars = data.map(fromDb);
  else {
    toast("Таблица cars пуста: добавьте автомобили через SQL из README");
  }
}
function card(c) {
  const liked = favorites.includes(c.id),
    inCart = cart.includes(c.id);
  return `<article class="car-card"><div class="car-image"><img src="${esc(c.image)}" alt="${esc(c.brand + " " + c.model)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80'"><span class="car-brand-tag">${esc(c.brand)}</span><button class="heart-btn ${liked ? "active" : ""}" data-action="favorite" data-id="${c.id}">${liked ? "♥" : "♡"}</button></div><div class="car-info"><div class="car-meta"><span>${c.year} ГОД</span><span>${esc(c.body)}</span></div><h3>${esc(c.model)}</h3><div class="car-subtitle">${esc(c.engine)} · ${c.hp} л.с.</div><div class="specs"><span>⚙ ${esc(c.drive)}</span><span>⛽ ${c.fuel ? c.fuel + " л" : "Электро"}</span><span>◉ ${Number(c.km).toLocaleString()} км</span></div><div class="card-bottom"><div class="price">${money(c.price)}<small>Предварительная цена</small></div><div class="card-actions"><button class="mini-btn" data-action="details" data-id="${c.id}">Подробнее</button><button class="mini-btn add" data-action="cart" data-id="${c.id}">${inCart ? "✓ В корзине" : "＋"}</button></div></div></div></article>`;
}
function filtered() {
  const q = $("#searchInput").value.trim().toLowerCase(),
    p = $("#priceFilter").value,
    b = $("#bodyFilter").value,
    y = $("#yearFilter").value;
  let a = cars.filter(
    (c) =>
      (currentBrand === "all" || c.brand === currentBrand) &&
      `${c.brand} ${c.model} ${c.year} ${c.engine}`.toLowerCase().includes(q) &&
      (p === "all" ||
        (p === "under50" && c.price < 50000) ||
        (p === "50to100" && c.price >= 50000 && c.price <= 100000) ||
        (p === "over100" && c.price > 100000)) &&
      (b === "all" || c.body === b) &&
      (y === "all" || c.year >= +y),
  );
  if ($("#sortSelect").value === "priceAsc")
    a.sort((x, y) => x.price - y.price);
  if ($("#sortSelect").value === "priceDesc")
    a.sort((x, y) => y.price - x.price);
  if ($("#sortSelect").value === "yearDesc") a.sort((x, y) => y.year - x.year);
  return a;
}
function renderCatalog() {
  const a = filtered(),
    pages = Math.max(1, Math.ceil(a.length / pageSize));
  currentPage = Math.min(currentPage, pages);
  $("#carsGrid").innerHTML =
    a
      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
      .map(card)
      .join("") ||
    '<p class="empty-state">Ничего не найдено. Попробуйте изменить фильтры.</p>';
  $("#resultsCount").textContent = a.length;
  $("#pagination").innerHTML =
    pages > 1
      ? Array.from(
          { length: pages },
          (_, i) =>
            `<button class="page-btn ${currentPage === i + 1 ? "active" : ""}" data-page="${i + 1}">${i + 1}</button>`,
        ).join("")
      : "";
}
function renderFavorites() {
  const a = favorites.map(getCar).filter(Boolean);
  $("#favoritesGrid").innerHTML = a.map(card).join("");
  $("#favoritesEmpty").style.display = a.length ? "none" : "block";
  $("#favoriteCount").textContent = a.length;
}
function renderCart() {
  const a = cart.map(getCar).filter(Boolean);
  $("#cartItems").innerHTML = a
    .map(
      (c) =>
        `<div class="cart-row"><img src="${esc(c.image)}" alt="${esc(c.model)}"><div><h3>${esc(c.brand)} ${esc(c.model)}</h3><p>${c.year} · ${esc(c.engine)}</p></div><strong>${money(c.price)}</strong><button class="remove-btn" data-action="remove-cart" data-id="${c.id}">×</button></div>`,
    )
    .join("");
  $("#cartTotal").textContent = money(a.reduce((s, c) => s + c.price, 0));
  $("#cartSummary").classList.toggle("show", a.length > 0);
  $("#cartEmpty").style.display = a.length ? "none" : "block";
  $("#cartCount").textContent = a.length;
}
function renderAccount() {
  const el = $("#accountPanel");
  if (user) {
    el.innerHTML = `<h3>Здравствуйте, ${esc(profile?.display_name || user.email)}!</h3><p>Аккаунт: <b>${esc(user.email)}</b></p><p>Роль: <b>${esc(profile?.role || "user")}</b></p><div class="account-actions"><button class="mini-btn" id="viewMyBookings">Мои заявки</button><button class="mini-btn" id="logoutButton">Выйти</button></div><div id="myBookings"></div>`;
    $("#logoutButton").onclick = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) toast(error.message);
      else toast("Вы вышли из аккаунта");
    };
    $("#viewMyBookings").onclick = loadMyBookings;
  } else {
    el.innerHTML =
      '<h3>Личный кабинет</h3><p>Регистрация и вход работают через Supabase Auth после подключения проекта.</p><button class="primary-btn" id="accountLogin">Войти / Регистрация →</button>';
    $("#accountLogin").onclick = openAuth;
  }
  if ($("#profileButton"))
    $("#profileButton").textContent = user
      ? (profile?.display_name || user.email.split("@")[0]).split(" ")[0]
      : "Войти";
}
async function loadMyBookings() {
  if (!supabase || !user) return;
  const { data, error } = await supabase
    .from("bookings")
    .select("id,booking_type,status,created_at,car_id,cars(brand,model)")
    .order("created_at", { ascending: false });
  $("#myBookings").innerHTML = error
    ? `<p>${esc(error.message)}</p>`
    : data?.length
      ? data
          .map(
            (b) =>
              `<p>${esc(b.cars?.brand || "Автомобиль")} ${esc(b.cars?.model || "")} · ${esc(b.booking_type)} · ${esc(b.status)} · ${new Date(b.created_at).toLocaleDateString()}</p>`,
          )
          .join("")
      : "<p>Заявок пока нет.</p>";
}
function renderAdmin() {
  const el = $("#adminPanel");
  if (!user || profile?.role !== "admin") {
    el.innerHTML =
      "<h3>Доступ администратора</h3><p>Войдите с аккаунтом, которому владелец проекта назначил роль <b>admin</b> в таблице profiles. Доступ контролируется также политиками базы данных.</p>";
    return;
  }
  el.innerHTML = `<div class="admin-stats"><div class="admin-stat"><strong>${cars.length}</strong><span>Автомобилей</span></div><div class="admin-stat"><strong>${bookings.length}</strong><span>Заявок в этой сессии</span></div><div class="admin-stat"><strong>Supabase</strong><span>Источник данных</span></div></div><h3>${editingId ? "Изменить автомобиль" : "Добавить автомобиль"}</h3><form id="adminCarForm" class="admin-form"><input name="brand" required placeholder="Марка (BMW / Toyota / Mercedes-Benz)"><input name="model" required placeholder="Модель"><input name="year" type="number" min="1990" max="2035" required placeholder="Год"><input name="price" type="number" min="1" required placeholder="Цена USD"><select name="body"><option>Sedan</option><option>SUV</option><option>Coupe</option><option>Hatchback</option><option>Pickup</option></select><input name="engine" required placeholder="Двигатель"><input name="fuel_liters" type="number" min="0" placeholder="Бак, литры"><input name="horsepower" type="number" min="1" placeholder="Лошадиные силы"><input name="drive" placeholder="Привод"><input name="mileage_km" type="number" min="0" placeholder="Пробег км"><input name="image_url" placeholder="URL изображения"><input name="description" placeholder="Описание"><button class="primary-btn" type="submit">${editingId ? "Сохранить изменения" : "Добавить автомобиль"} →</button></form><div class="admin-list">${cars.map((c) => `<div class="admin-list-row"><div><b>${esc(c.brand)} ${esc(c.model)}</b><br><span>${c.year} · ${money(c.price)}</span></div><div><button class="mini-btn" data-action="edit-car" data-id="${c.id}">Изменить</button> <button class="mini-btn" data-action="delete-car" data-id="${c.id}">Удалить</button></div></div>`).join("")}</div>`;
  $("#adminCarForm").onsubmit = saveAdminCar;
}
async function saveAdminCar(e) {
  e.preventDefault();
  const f = new FormData(e.target),
    v = Object.fromEntries(f.entries());
  const row = {
    brand: v.brand.trim(),
    model: v.model.trim(),
    year: +v.year,
    price: +v.price,
    body: v.body,
    engine: v.engine,
    fuel_liters: +v.fuel_liters || 0,
    horsepower: +v.horsepower || 0,
    drive: v.drive || "—",
    mileage_km: +v.mileage_km || 0,
    image_url: v.image_url || img("photo-1492144534655-ae79c964c9d7"),
    description: v.description || "",
    history: "История модели добавлена администратором.",
  };
  let result;
  if (editingId)
    result = await supabase.from("cars").update(row).eq("id", editingId);
  else result = await supabase.from("cars").insert(row);
  if (result.error) {
    toast("Ошибка базы: " + result.error.message);
    return;
  }
  editingId = null;
  await loadCars();
  renderAll();
  toast("Автомобиль сохранён в базе");
}
function showDetails(id) {
  const c = getCar(id);
  if (!c) return;
  $("#carDetails").innerHTML =
    `<div class="detail-layout"><img src="${esc(c.image)}" alt="${esc(c.model)}"><div class="detail-copy"><span class="eyebrow">${esc(c.brand)} · ${c.year}</span><h2>${esc(c.model)}</h2><h3>${money(c.price)}</h3><p>${esc(c.desc)}</p><div class="detail-specs">${[
      ["Двигатель", c.engine],
      ["Мощность", c.hp + " л.с."],
      ["Объём бака", c.fuel ? c.fuel + " л" : "Электро"],
      ["Привод", c.drive],
      ["Пробег", Number(c.km).toLocaleString() + " км"],
      ["Кузов", c.body],
    ]
      .map(
        ([a, b]) =>
          `<div class="detail-spec"><small>${a}</small><strong>${esc(b)}</strong></div>`,
      )
      .join(
        "",
      )}</div><p><b>История модели</b><br>${esc(c.history)}</p><button class="primary-btn" data-action="book-car" data-id="${c.id}">Забронировать ↗</button> <button class="mini-btn" data-action="cart" data-id="${c.id}">＋ В корзину</button></div></div>`;
  $("#carDialog").showModal();
}
function openAuth() {
  authMode = "login";
  updateAuth();
  $("#authDialog").showModal();
}
function updateAuth() {
  $$(".auth-tabs button").forEach((b) =>
    b.classList.toggle("active", b.dataset.auth === authMode),
  );
  $("#authName").parentElement.style.display =
    authMode === "register" ? "grid" : "none";
  $("#authTitle").textContent =
    authMode === "login" ? "С возвращением" : "Создать аккаунт";
  $("#authSubtitle").textContent =
    authMode === "login"
      ? "Войдите в личный кабинет"
      : "Регистрация через защищённый сервис Supabase";
  $("#authSubmit").textContent =
    authMode === "login" ? "Войти →" : "Создать аккаунт →";
}
async function authSubmit(e) {
  e.preventDefault();
  if (!supabase) {
    toast("Сначала настрой supabase-config.js по README");
    return;
  }
  const email = $("#authEmail").value.trim(),
    password = $("#authPassword").value,
    name = $("#authName").value.trim();
  let result;
  if (authMode === "register") {
    if (name.length < 2) {
      toast("Введите имя минимум из 2 символов");
      return;
    }
    result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (!result.error && result.data.user) {
      const uid = result.data.user.id;
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: uid, display_name: name, role: "user" });
      if (error) console.error("Profile insert:", error.message);
    }
  } else result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error) {
    toast(result.error.message);
    return;
  }
  $("#authDialog").close();
  toast(
    authMode === "register"
      ? "Регистрация отправлена. Подтвердите email, если включено подтверждение."
      : "Вход выполнен",
  );
  await initSupabase();
}
async function submitBooking(e) {
  e.preventDefault();
  const name = $("#bookingName").value.trim(),
    phone = $("#bookingPhone").value.trim(),
    id = Number($("#bookingCar").value),
    car = getCar(id);
  if (!car) {
    toast("Выберите автомобиль");
    return;
  }
  const type = $("#bookingType").value,
    comment = $("#bookingComment").value.trim();
  let bookingError = null;
  if (supabase) {
    const { error } = await supabase
      .from("bookings")
      .insert({
        user_id: user?.id || null,
        customer_name: name,
        phone,
        car_id: id,
        booking_type: type,
        comment,
      });
    bookingError = error;
    if (error) toast("Заявка не сохранена в базе: " + error.message);
  }
  const msg = `Здравствуйте, Турдиев Ислам!%0AХочу забронировать автомобиль.%0AИмя: ${encodeURIComponent(name)}%0AТелефон: ${encodeURIComponent(phone)}%0AАвтомобиль: ${encodeURIComponent(car.brand + " " + car.model)} (${car.year})%0AЦена: ${encodeURIComponent(money(car.price))}%0AСпособ: ${encodeURIComponent(type)}%0AКомментарий: ${encodeURIComponent(comment || "Нет")}`;
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`,
    "_blank",
    "noopener,noreferrer",
  );
  e.target.reset();
  toast(
    bookingError
      ? "WhatsApp открыт, но сохранение в базе не удалось"
      : "Заявка подготовлена для WhatsApp",
  );
}
function all() {
  renderCatalog();
  renderFavorites();
  renderCart();
  renderAccount();
  renderAdmin();
  $("#bookingCar").innerHTML =
    '<option value="">Выберите автомобиль</option>' +
    cars
      .map(
        (c) =>
          `<option value="${c.id}">${esc(c.brand)} ${esc(c.model)} — ${money(c.price)}</option>`,
      )
      .join("");
}
function renderAll() {
  all();
  save("ta3_cars_cache", cars);
}
function favorite(id) {
  const adding = !favorites.includes(id);
  favorites = adding ? [...favorites, id] : favorites.filter((x) => x !== id);
  save(STORAGE.favorites, favorites);
  renderAll();
  if (adding) {
    location.href = "favorites.html";
  } else toast("Удалено из избранного");
}
function addCart(id) {
  if (!cart.includes(id)) {
    cart.push(id);
    save(STORAGE.cart, cart);
  }
  save("ta3_cars_cache", cars);
  location.href = "cart.html";
}
async function action(e) {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const id = Number(b.dataset.id),
    a = b.dataset.action;
  if (a === "favorite") favorite(id);
  if (a === "cart") addCart(id);
  if (a === "details") showDetails(id);
  if (a === "remove-cart") {
    cart = cart.filter((x) => x !== id);
    save(STORAGE.cart, cart);
    renderAll();
  }
  if (a === "book-car") {
    $("#carDialog").close();
    $("#bookingCar").value = String(id);
    $("#bookingName").value = profile?.display_name || "";
    location.hash = "#booking";
  }
  if (a === "edit-car") {
    const c = getCar(id);
    editingId = id;
    renderAdmin();
    const f = $("#adminCarForm");
    Object.entries({
      ...c,
      fuel_liters: c.fuel,
      horsepower: c.hp,
      mileage_km: c.km,
      image_url: c.image,
      description: c.desc,
    }).forEach(([k, v]) => {
      if (f.elements[k]) f.elements[k].value = v;
    });
    f.scrollIntoView({ behavior: "smooth" });
  }
  if (a === "delete-car") {
    if (!confirm("Удалить автомобиль из базы?")) return;
    const { error } = await supabase.from("cars").delete().eq("id", id);
    if (error) {
      toast(error.message);
      return;
    }
    await loadCars();
    favorites = favorites.filter((x) => x !== id);
    cart = cart.filter((x) => x !== id);
    save(STORAGE.favorites, favorites);
    save(STORAGE.cart, cart);
    renderAll();
    toast("Автомобиль удалён");
  }
}
$("#brandFilters").addEventListener("click", (e) => {
  const b = e.target.closest("[data-brand]");
  if (!b) return;
  currentBrand = b.dataset.brand;
  currentPage = 1;
  $$(".filter-chip").forEach((x) => x.classList.toggle("active", x === b));
  renderCatalog();
});
[
  "searchInput",
  "priceFilter",
  "sortSelect",
  "bodyFilter",
  "yearFilter",
].forEach((id) =>
  $("#" + id).addEventListener(
    id === "searchInput" ? "input" : "change",
    () => {
      currentPage = 1;
      renderCatalog();
    },
  ),
);
$("#resetFilters").onclick = () => {
  $("#searchInput").value = "";
  $("#priceFilter").value = "all";
  $("#sortSelect").value = "featured";
  $("#bodyFilter").value = "all";
  $("#yearFilter").value = "all";
  currentBrand = "all";
  currentPage = 1;
  $$(".filter-chip").forEach((b, i) => b.classList.toggle("active", i === 0));
  renderCatalog();
};
$("#pagination").addEventListener("click", (e) => {
  const b = e.target.closest("[data-page]");
  if (b) {
    currentPage = +b.dataset.page;
    renderCatalog();
    $("#catalog").scrollIntoView({ behavior: "smooth" });
  }
});
document.addEventListener("click", action);
$("#themeToggle").onclick = () => {
  const t =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  $("#themeToggle").textContent = t === "dark" ? "☀" : "☾";
  save(STORAGE.theme, t);
};
if ($("#profileButton"))
  $("#profileButton").onclick = () => (location.href = "auth.html?mode=login");
$("#menuToggle").onclick = () => {
  $(".nav-links").style.display =
    $(".nav-links").style.display === "flex" ? "none" : "flex";
  Object.assign($(".nav-links").style, {
    position: "absolute",
    top: "70px",
    right: "4%",
    background: "var(--surface)",
    padding: "18px",
    border: "1px solid var(--line)",
    borderRadius: "12px",
    flexDirection: "column",
  });
};
$("#bookingForm").addEventListener("submit", submitBooking);
$("#authForm").addEventListener("submit", authSubmit);
$$(".auth-tabs button").forEach(
  (b) =>
    (b.onclick = () => {
      authMode = b.dataset.auth;
      updateAuth();
    }),
);
$("#closeDialog").onclick = () => $("#carDialog").close();
$("#closeAuth").onclick = () => $("#authDialog").close();
$("#cartBookButton").onclick = () => {
  const c = getCar(cart[0]);
  if (c) $("#bookingCar").value = String(c.id);
  location.hash = "#booking";
  $("#bookingName").value = profile?.display_name || "";
};
$("#langToggle").onclick = () => {
  const a = ["RU", "KY", "EN"],
    next = a[(a.indexOf($("#langToggle").textContent) + 1) % a.length];
  $("#langToggle").textContent = next;
  const map = {
    RU: ["Каталог", "Бронирование", "О нас"],
    KY: ["Унаалар", "Брондоо", "Биз жөнүндө"],
    EN: ["Catalog", "Booking", "About us"],
  };
  $$("[data-i18n]").forEach(
    (el, i) => (el.textContent = map[next][i] || el.textContent),
  );
  save(STORAGE.lang, next.toLowerCase());
  toast("Перевод основных пунктов: " + next);
};
document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    e.preventDefault();
    $("#searchInput").focus();
  }
});
document.documentElement.dataset.theme = load(STORAGE.theme, "light");
$("#themeToggle").textContent =
  document.documentElement.dataset.theme === "dark" ? "☀" : "☾";
$("#langToggle").textContent = load(STORAGE.lang, "ru").toUpperCase();
renderAll();
initSupabase().catch((e) => {
  console.error(e);
  toast("Ошибка подключения Supabase. Проверь настройки.");
});
