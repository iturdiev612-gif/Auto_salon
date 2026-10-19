import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  isSupabaseConfigured,
} from "./supabase-config.js";
const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
let mode =
  params.get("mode") === "signup" || params.get("mode") === "register"
    ? "signup"
    : "login";
const redirectTo = params.get("next") === "admin" ? "admin.html" : "index.html";
let supabase = null;
function showError(message) {
  const el = $("#authError");
  el.textContent = message;
  el.classList.add("show");
}
function clearError() {
  const el = $("#authError");
  el.textContent = "";
  el.classList.remove("show");
}
function setMode(next) {
  mode = next;
  const signup = next === "signup";
  $("#loginTab").classList.toggle("active", !signup);
  $("#signupTab").classList.toggle("active", signup);
  $("#nameWrap").hidden = !signup;
  $("#name").required = signup;
  $("#password").autocomplete = signup ? "new-password" : "current-password";
  $("#formTitle").textContent = signup ? "Создать аккаунт" : "С возвращением";
  $("#formSubtitle").textContent = signup
    ? "Зарегистрируйтесь, чтобы сохранять свои автомобили и заявки."
    : "Войдите в аккаунт, чтобы продолжить.";
  $("#submitBtn").innerHTML = signup
    ? "Создать аккаунт <span>↗</span>"
    : "Войти в аккаунт <span>↗</span>";
  $("#signupTab").href = "auth.html?mode=signup";
  $("#loginTab").href = "auth.html?mode=login";
}
const savedTheme = localStorage.getItem("ta2_theme") || "light";
document.documentElement.dataset.theme = savedTheme;
$("#themeToggle").textContent = savedTheme === "dark" ? "☀" : "☾";
$("#themeToggle").onclick = () => {
  const t =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  $("#themeToggle").textContent = t === "dark" ? "☀" : "☾";
  localStorage.setItem("ta2_theme", t);
};
setMode(mode);
const DEMO_USERS_KEY = "ta3_demo_users";
function getDemoUsers() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY)) || [];
  } catch {
    return [];
  }
}
function setDemoUsers(v) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(v));
}
const demoMode = !isSupabaseConfigured;
if (demoMode) {
  const note = document.querySelector(".auth-note");
  note.textContent =
    "Демо-режим: аккаунты хранятся только в этом браузере. Для настоящей защиты подключите Supabase перед публикацией.";
} else {
  import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm")
    .then(({ createClient }) => {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return supabase.auth.getSession();
    })
    .then(({ data }) => {
      if (data.session) location.replace(redirectTo);
    })
    .catch(() =>
      showError(
        "Не удалось загрузить Supabase. Проверьте интернет-соединение.",
      ),
    );
}
$("#authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();
  const email = $("#email").value.trim(),
    password = $("#password").value,
    name = $("#name").value.trim();
  const signup = mode === "signup";
  if (signup && name.length < 2) {
    showError("Введите имя минимум из двух символов.");
    return;
  }
  if (demoMode) {
    const users = getDemoUsers(),
      existing = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
    if (signup) {
      if (existing) {
        showError("Этот email уже зарегистрирован. Войдите в аккаунт.");
        return;
      }
      users.push({ email, password, name, role: "user" });
      setDemoUsers(users);
      localStorage.setItem(
        "ta3_session",
        JSON.stringify({ email, name, role: "user" }),
      );
      location.replace(redirectTo);
      return;
    } else {
      const adminEmail = "admin@turdiev.auto",
        adminPassword = "Admin123!";
      if (email === adminEmail && password === adminPassword) {
        localStorage.setItem(
          "ta3_session",
          JSON.stringify({ email, name: "Turdiev Auto Admin", role: "admin" }),
        );
        location.replace(redirectTo);
        return;
      }
      if (!existing || existing.password !== password) {
        showError(
          "Неверный email или пароль. Если аккаунта нет — откройте Sign up.",
        );
        return;
      }
      localStorage.setItem(
        "ta3_session",
        JSON.stringify({
          email,
          name: existing.name,
          role: existing.role || "user",
        }),
      );
      location.replace(redirectTo);
      return;
    }
  }
  const btn = $("#submitBtn");
  btn.disabled = true;
  btn.textContent = signup ? "Создаём аккаунт…" : "Входим…";
  try {
    let result;
    if (signup) {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name },
          emailRedirectTo: new URL(redirectTo, location.href).href,
        },
      });
      if (result.error) throw result.error;
      if (result.data.user) {
        await supabase
          .from("profiles")
          .upsert({
            id: result.data.user.id,
            display_name: name,
            role: "user",
          });
      }
      if (!result.data.session) {
        showError(
          "Аккаунт создан. Проверьте почту и подтвердите email, затем войдите.",
        );
        btn.disabled = false;
        setMode("login");
        return;
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
    }
    location.replace(redirectTo);
  } catch (err) {
    showError(
      err.message ||
        "Не удалось выполнить вход. Проверьте данные и настройки Supabase.",
    );
  } finally {
    btn.disabled = false;
    if (!$("#authError").classList.contains("show")) setMode(mode);
  }
});
