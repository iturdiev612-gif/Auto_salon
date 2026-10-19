const $ = (s) => document.querySelector(s);
const key = location.pathname.endsWith("cart.html")
  ? "ta2_cart"
  : "ta2_favorites";
const isCart = key === "ta2_cart";
const money = (n) => "$" + Number(n || 0).toLocaleString("en-US");
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function read(k, f = []) {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? f;
  } catch {
    return f;
  }
}
function write(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}
let ids = read(key),
  cars = read("ta3_cars_cache", []);
const fallback = () => {
  const sample = [
    [
      "Mercedes-Benz",
      "C 200",
      2023,
      42000,
      "2.0 Turbo",
      "photo-1618843479313-40f8afb4b4d8",
    ],
    [
      "Toyota",
      "Camry 2.5",
      2024,
      34500,
      "2.5 бензин",
      "photo-1621007947382-bb3c3994e3fb",
    ],
    [
      "BMW",
      "M3 Competition",
      2024,
      89000,
      "3.0 Twin Turbo",
      "photo-1555215695-3004980ad54e",
    ],
  ];
  return sample.map((x, i) => ({
    id: i + 1,
    brand: x[0],
    model: x[1],
    year: x[2],
    price: x[3],
    engine: x[4],
    image: `https://images.unsplash.com/${x[5]}?auto=format&fit=crop&w=900&q=80`,
    body: "Sedan",
    hp: 250,
    desc: "Демонстрационный автомобиль",
  }));
};
if (!cars.length) cars = fallback();
function render() {
  ids = read(key);
  const list = ids
    .map((id) => cars.find((c) => Number(c.id) === Number(id)))
    .filter(Boolean);
  $("#count").textContent = list.length;
  $("#items").innerHTML = list
    .map(
      (c) =>
        `<article class="car-card saved-card"><div class="car-image"><img src="${esc(c.image)}" alt="${esc(c.brand + " " + c.model)}"><span class="car-brand-tag">${esc(c.brand)}</span></div><div class="car-info"><div class="car-meta"><span>${c.year} ГОД</span><span>${esc(c.body || "Sedan")}</span></div><h3>${esc(c.model)}</h3><div class="car-subtitle">${esc(c.engine || "Двигатель")} · ${c.hp || "—"} л.с.</div><div class="card-bottom"><div class="price">${money(c.price)}</div><div class="card-actions"><a class="mini-btn" href="index.html">Подробнее</a><button class="mini-btn add" data-remove="${c.id}">${isCart ? "Убрать из корзины" : "Убрать"}</button></div></div></div></article>`,
    )
    .join("");
  $("#empty").classList.toggle("hidden", list.length > 0);
  $("#items").classList.toggle("hidden", !list.length);
  if (isCart) {
    $("#total").textContent = money(
      list.reduce((s, c) => s + Number(c.price || 0), 0),
    );
    $("#summary").classList.toggle("hidden", !list.length);
  }
}
$("#items").addEventListener("click", (e) => {
  const b = e.target.closest("[data-remove]");
  if (!b) return;
  const id = Number(b.dataset.remove);
  write(
    key,
    read(key).filter((x) => Number(x) !== id),
  );
  render();
});
$("#theme").onclick = () => {
  const t =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  localStorage.setItem("ta2_theme", t);
  $("#theme").textContent = t === "dark" ? "☀" : "☾";
};
document.documentElement.dataset.theme =
  localStorage.getItem("ta2_theme") || "light";
$("#theme").textContent =
  document.documentElement.dataset.theme === "dark" ? "☀" : "☾";
$("#clear").onclick = () => {
  if (confirm(isCart ? "Очистить корзину?" : "Очистить избранное?")) {
    write(key, []);
    render();
  }
};
$("#checkout").onclick = () => {
  const list = read("ta2_cart")
    .map((id) => cars.find((c) => Number(c.id) === Number(id)))
    .filter(Boolean);
  const msg =
    "Здравствуйте, Турдиев Ислам! Хочу оформить заявку на автомобили: " +
    list.map((c) => `${c.brand} ${c.model} (${money(c.price)})`).join(", ");
  location.href = "https://wa.me/996999425453?text=" + encodeURIComponent(msg);
};
render();
