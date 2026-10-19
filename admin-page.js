import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from "./supabase-config.js";
const $ = (s) => document.querySelector(s);
let supabase = null,
  cars = [],
  bookings = [],
  editingId = null;
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n) => "$" + Number(n || 0).toLocaleString("en-US");
function toast(s) {
  const el = $("#toast");
  el.textContent = s;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}
const theme = localStorage.getItem("ta2_theme") || "light";
document.documentElement.dataset.theme = theme;
$("#themeToggle").textContent = theme === "dark" ? "☀" : "☾";
$("#themeToggle").onclick = () => {
  const t =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  $("#themeToggle").textContent = t === "dark" ? "☀" : "☾";
  localStorage.setItem("ta2_theme", t);
};
function showGate(html) {
  $("#gate").innerHTML = html;
  $("#gate").classList.remove("hidden");
  $("#dashboard").classList.add("hidden");
}
function bootDemo() {
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem("ta3_session"));
  } catch {}
  if (session?.role !== "admin") {
    $("#roleStatus").textContent = "Нужен вход администратора";
    showGate(
      '<h2>Демо-админ-панель</h2><p>Supabase пока не настроен, поэтому включён локальный демонстрационный режим. Войдите специальным демо-аккаунтом — он работает только в этом браузере.</p><div class="admin-message"><b>Email:</b> admin@turdiev.auto<br><b>Пароль:</b> Admin123!</div><a class="primary-btn" href="auth.html?mode=login&next=admin">Войти как администратор →</a><p>Этот режим предназначен для проверки интерфейса. Он не защищён как серверная админ-панель.</p>',
    );
    return;
  }
  let localCars = [];
  try {
    localCars = JSON.parse(localStorage.getItem("ta3_cars_cache")) || [];
  } catch {}
  if (!localCars.length)
    localCars = [
      {
        id: 1,
        brand: "Mercedes-Benz",
        model: "C 200",
        year: 2023,
        price: 42000,
        body: "Sedan",
        engine: "2.0 Turbo",
        fuel: 66,
        hp: 204,
        drive: "RWD",
        km: 18000,
        image:
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80",
        desc: "Премиальный седан",
        history: "История модели Mercedes-Benz C-Class.",
      },
      {
        id: 2,
        brand: "Toyota",
        model: "Camry 2.5",
        year: 2024,
        price: 34500,
        body: "Sedan",
        engine: "2.5 бензин",
        fuel: 60,
        hp: 203,
        drive: "FWD",
        km: 7000,
        image:
          "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80",
        desc: "Комфортный седан",
        history: "История Toyota Camry.",
      },
      {
        id: 3,
        brand: "BMW",
        model: "M3 Competition",
        year: 2024,
        price: 89000,
        body: "Sedan",
        engine: "3.0 Twin Turbo",
        fuel: 59,
        hp: 503,
        drive: "RWD",
        km: 3000,
        image:
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80",
        desc: "Спортивный седан",
        history: "История BMW M3.",
      },
    ];
  const store = () =>
    localStorage.setItem("ta3_cars_cache", JSON.stringify(localCars));
  const asDb = (c) => ({
    id: c.id,
    brand: c.brand,
    model: c.model,
    year: c.year,
    price: c.price,
    body: c.body,
    engine: c.engine,
    fuel_liters: c.fuel ?? c.fuel_liters ?? 0,
    horsepower: c.hp ?? c.horsepower ?? 0,
    drive: c.drive || "—",
    mileage_km: c.km ?? c.mileage_km ?? 0,
    image_url: c.image || c.image_url || "",
    description: c.desc || c.description || "",
    history: c.history || "",
  });
  const draw = () => {
    cars = localCars.map(asDb);
    $("#statCars").textContent = cars.length;
    $("#statBookings").textContent = JSON.parse(
      localStorage.getItem("ta3_bookings") || "[]",
    ).length;
    $("#statUsers").textContent = session.name || session.email;
    $("#roleStatus").textContent = "Демо-режим · ADMIN";
    $("#gate").classList.add("hidden");
    $("#dashboard").classList.remove("hidden");
    const q = $("#adminSearch").value.toLowerCase().trim();
    $("#adminCarsList").innerHTML =
      localCars
        .filter((c) => (c.brand + " " + c.model).toLowerCase().includes(q))
        .map(
          (c) =>
            `<div class="admin-list-row"><div><b>${esc(c.brand)} ${esc(c.model)}</b><br><span>${c.year} · ${money(c.price)}</span></div><div class="admin-row-actions"><button class="mini-btn" data-demo-edit="${c.id}">Изменить</button><button class="mini-btn" data-demo-delete="${c.id}">Удалить</button></div></div>`,
        )
        .join("") || "<p>Автомобили не найдены.</p>";
    $("#bookingRows").innerHTML =
      '<tr><td colspan="6">В демо-режиме заявки не синхронизируются с сервером. Бронирование открывает WhatsApp у клиента.</td></tr>';
  };
  $("#carForm").addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const f = new FormData(e.target),
        v = Object.fromEntries(f.entries());
      const id = Number(v.id) || Date.now();
      const old = localCars.find((c) => Number(c.id) === id);
      const car = {
        id,
        brand: v.brand.trim(),
        model: v.model.trim(),
        year: +v.year,
        price: +v.price,
        body: v.body,
        engine: v.engine,
        fuel: +v.fuel_liters || 0,
        hp: +v.horsepower || 0,
        drive: v.drive || "—",
        km: +v.mileage_km || 0,
        image:
          v.image_url ||
          old?.image ||
          "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
        desc: v.description || "",
        history: v.history || "",
      };
      if (old)
        localCars = localCars.map((c) => (Number(c.id) === id ? car : c));
      else localCars.unshift(car);
      store();
      e.target.reset();
      e.elements.id.value = "";
      $("#carFormTitle").textContent = "Добавить автомобиль";
      $("#cancelEdit").classList.add("hidden");
      draw();
      toast("Автомобиль сохранён в этом браузере");
    },
    true,
  );
  $("#adminCarsList").addEventListener(
    "click",
    (e) => {
      const edit = e.target.closest("[data-demo-edit]"),
        del = e.target.closest("[data-demo-delete]");
      if (!edit && !del) return;
      e.stopImmediatePropagation();
      if (edit) {
        const c = localCars.find(
          (x) => Number(x.id) === Number(edit.dataset.demoEdit),
        );
        const f = $("#carForm");
        const vals = {
          id: c.id,
          brand: c.brand,
          model: c.model,
          year: c.year,
          price: c.price,
          body: c.body,
          engine: c.engine,
          fuel_liters: c.fuel ?? c.fuel_liters,
          horsepower: c.hp ?? c.horsepower,
          drive: c.drive,
          mileage_km: c.km ?? c.mileage_km,
          image_url: c.image ?? c.image_url,
          description: c.desc ?? c.description,
          history: c.history,
        };
        Object.entries(vals).forEach(([k, v]) => {
          if (f.elements[k]) f.elements[k].value = v ?? "";
        });
        $("#carFormTitle").textContent = "Редактировать автомобиль";
        $("#cancelEdit").classList.remove("hidden");
        f.scrollIntoView({ behavior: "smooth" });
      } else {
        const id = Number(del.dataset.demoDelete);
        if (!confirm("Удалить автомобиль?")) return;
        localCars = localCars.filter((c) => Number(c.id) !== id);
        store();
        draw();
        toast("Автомобиль удалён из демо-каталога");
      }
    },
    true,
  );
  $("#adminSearch").addEventListener("input", draw);
  $("#cancelEdit").onclick = () => {
    const f = $("#carForm");
    f.reset();
    f.elements.id.value = "";
    $("#carFormTitle").textContent = "Добавить автомобиль";
    $("#cancelEdit").classList.add("hidden");
  };
  draw();
}
async function boot() {
  if (!isSupabaseConfigured) {
    bootDemo();
    return;
  }
  const { createClient } =
    await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    showGate(
      '<h2>Войдите в аккаунт</h2><p>Для доступа к рабочей панели требуется авторизация. После входа проверим роль аккаунта.</p><a class="primary-btn" href="auth.html?mode=login&next=admin">Sign in →</a> <a class="mini-btn" href="auth.html?mode=signup&next=admin">Sign up</a>',
    );
    return;
  }
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name,role")
    .eq("id", session.user.id)
    .maybeSingle();
  if (error || profile?.role !== "admin") {
    $("#roleStatus").textContent = "Доступ ограничен";
    showGate(
      `<h2>Нет прав администратора</h2><p>Вы вошли как <b>${esc(session.user.email)}</b>, но роль аккаунта не admin. Для тестирования владелец проекта может назначить роль через SQL Editor: <code>update public.profiles set role='admin' where id='${esc(session.user.id)}';</code></p><p>После изменения роли обновите страницу. Не выдавайте роль admin обычным пользователям.</p><button class="mini-btn" id="reloadAccess">Проверить ещё раз</button>`,
    );
    $("#reloadAccess").onclick = () => location.reload();
    return;
  }
  $("#roleStatus").textContent = "Доступ подтверждён";
  $("#gate").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");
  $("#statUsers").textContent = profile.display_name || session.user.email;
  await Promise.all([loadCars(), loadBookings()]);
}
async function loadCars() {
  const { data, error } = await supabase.from("cars").select("*").order("id");
  if (error) {
    toast("Не удалось загрузить автомобили: " + error.message);
    return;
  }
  cars = data || [];
  $("#statCars").textContent = cars.length;
  renderCars();
}
async function loadBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id,customer_name,phone,car_id,booking_type,comment,created_at,cars(brand,model,year)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    $("#bookingRows").innerHTML =
      `<tr><td colspan="6">Не удалось загрузить заявки: ${esc(error.message)}. Проверьте таблицу bookings и RLS-политику.</td></tr>`;
    $("#statBookings").textContent = "—";
    return;
  }
  bookings = data || [];
  $("#statBookings").textContent = bookings.length;
  $("#bookingRows").innerHTML = bookings.length
    ? bookings
        .map(
          (b) =>
            `<tr><td><b>${esc(b.customer_name)}</b></td><td>${esc(b.phone)}</td><td>${esc(b.cars ? `${b.cars.brand} ${b.cars.model} (${b.cars.year})` : `ID ${b.car_id}`)}</td><td>${esc(b.booking_type)}</td><td>${b.created_at ? new Date(b.created_at).toLocaleString("ru-RU") : "—"}</td><td>${esc(b.comment || "—")}</td></tr>`,
        )
        .join("")
    : '<tr><td colspan="6">Заявок пока нет.</td></tr>';
}
function renderCars() {
  const q = $("#adminSearch").value.toLowerCase().trim(),
    list = cars.filter((c) =>
      (c.brand + " " + c.model).toLowerCase().includes(q),
    );
  $("#adminCarsList").innerHTML = list.length
    ? list
        .map(
          (c) =>
            `<div class="admin-list-row"><div><b>${esc(c.brand)} ${esc(c.model)}</b><br><span>${c.year} · ${money(c.price)} · ${esc(c.body)}</span></div><div class="admin-row-actions"><button class="mini-btn" data-edit="${c.id}">Изменить</button><button class="mini-btn" data-delete="${c.id}">Удалить</button></div></div>`,
        )
        .join("")
    : "<p>Ничего не найдено.</p>";
}
function resetForm() {
  editingId = null;
  $("#carForm").reset();
  $("#carForm").elements.id.value = "";
  $("#carFormTitle").textContent = "Добавить автомобиль";
  $("#cancelEdit").classList.add("hidden");
  $("#carForm").elements.year.value = 2024;
  $("#carForm").elements.fuel_liters.value = 60;
  $("#carForm").elements.horsepower.value = 250;
  $("#carForm").elements.mileage_km.value = 0;
}
$("#carForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!supabase) return;
  const f = new FormData(e.target),
    v = Object.fromEntries(f.entries());
  const row = {
    brand: v.brand.trim(),
    model: v.model.trim(),
    year: Number(v.year),
    price: Number(v.price),
    body: v.body,
    engine: v.engine.trim(),
    fuel_liters: Number(v.fuel_liters) || 0,
    horsepower: Number(v.horsepower) || 0,
    drive: v.drive.trim() || "—",
    mileage_km: Number(v.mileage_km) || 0,
    image_url:
      v.image_url.trim() ||
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
    description: v.description.trim(),
    history: v.history.trim(),
  };
  const result = editingId
    ? await supabase.from("cars").update(row).eq("id", editingId)
    : await supabase.from("cars").insert(row);
  if (result.error) {
    toast("Ошибка сохранения: " + result.error.message);
    return;
  }
  resetForm();
  await loadCars();
  toast("Автомобиль сохранён");
});
$("#adminCarsList").addEventListener("click", async (e) => {
  const edit = e.target.closest("[data-edit]"),
    del = e.target.closest("[data-delete]");
  if (edit) {
    const c = cars.find((x) => String(x.id) === edit.dataset.edit);
    if (!c) return;
    editingId = c.id;
    const f = $("#carForm");
    const vals = {
      id: c.id,
      brand: c.brand,
      model: c.model,
      year: c.year,
      price: c.price,
      body: c.body,
      engine: c.engine,
      fuel_liters: c.fuel_liters,
      horsepower: c.horsepower,
      drive: c.drive,
      mileage_km: c.mileage_km,
      image_url: c.image_url,
      description: c.description,
      history: c.history,
    };
    Object.entries(vals).forEach(([k, v]) => {
      if (f.elements[k]) f.elements[k].value = v ?? "";
    });
    $("#carFormTitle").textContent = "Редактировать автомобиль";
    $("#cancelEdit").classList.remove("hidden");
    f.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (del) {
    const c = cars.find((x) => String(x.id) === del.dataset.delete);
    if (
      !c ||
      !confirm(`Удалить ${c.brand} ${c.model}? Это действие нельзя отменить.`)
    )
      return;
    const { error } = await supabase.from("cars").delete().eq("id", c.id);
    if (error) {
      toast("Не удалось удалить: " + error.message);
      return;
    }
    await loadCars();
    toast("Автомобиль удалён");
  }
});
$("#cancelEdit").onclick = resetForm;
$("#adminSearch").addEventListener("input", renderCars);
$("#logoutBtn").onclick = async () => {
  if (supabase) await supabase.auth.signOut();
  location.href = "index.html";
};
boot().catch((e) => {
  console.error(e);
  showGate(
    "Не удалось открыть панель. Проверьте подключение Supabase и обновите страницу.",
  );
});
