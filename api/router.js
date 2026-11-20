import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';
import { seedCars, repairSeedCars, addCatalogSamples } from '../src/data.js';
import { ORDER_STAGE_LABELS, ORDER_STAGE_PROGRESS } from '../src/data/orderStages.js';
import nodemailer from 'nodemailer';
import { mailConfigured, sendMail } from '../server/mail.js';

const STORE_KEY = 'the-family-auto-store-v1';
let memoryStore;
let localStoreAdapter;
export function setLocalStoreAdapter(adapter) { localStoreAdapter = adapter; }

// Persistence adapters: Redis in Vercel, memory only for local handler fallback.
async function sendDeliveryNotification(order, status) {
  const recipient = order.contactEmail || order.email;
  if (!recipient || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return { sent: false, reason: 'smtp_not_configured' };
  const stageLabel = ORDER_STAGE_LABELS[status] || 'Статус заказа обновлён';
  try {
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }, connectionTimeout: 5000, socketTimeout: 8000 });
    await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: recipient, subject: `${stageLabel} · заказ ${order.reference}`, text: `Здравствуйте, ${order.name}!\n\n${stageLabel}. Автомобиль: ${order.items.map(item => item.name).join(', ')}. Заказ: ${order.reference}. Адрес доставки: ${order.address || 'не указан'}.\n\nСтатус обновлён автосалоном The Family Auto.` });
    return { sent: true };
  } catch (error) {
    console.error('Delivery email failed:', error.message);
    return { sent: false, reason: 'smtp_delivery_failed' };
  }
}

async function sendPasswordReset(email, code, lang='ru') {
  const messages={ru:['Код сброса пароля The Family Auto',`Код для сброса пароля: ${code}. Он действует 15 минут. Если вы не запрашивали сброс, проигнорируйте это письмо.`],kg:['The Family Auto · Сырсөздү жаңылоо коду',`Сырсөздү жаңылоо коду: ${code}. Код 15 мүнөт жарактуу. Эгер сиз сурабасаңыз, бул катты этибарга албаңыз.`],en:['The Family Auto password reset code',`Your password reset code is ${code}. It expires in 15 minutes. If you did not request this, ignore this email.`]};
  const [subject,text]=messages[lang]||messages.ru;
  await sendMail({to:email,subject,text});
}

function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('996')) digits = digits.slice(3);
  if (digits.length > 9 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.length === 9 ? `+996${digits}` : '';
}

function freshStore() {
  return { cars: structuredClone(seedCars), reviews: [], orders: [], bookings: [], users: [], expenses: [], coupons: [], resetTokens: [], _catalogAdditionsVersion: 3, _revision: 0 };
}
function normalizeStore(store) {
  return { cars: repairSeedCars(Number(store?._catalogAdditionsVersion || 0) < 3 ? addCatalogSamples(store?.cars || seedCars) : (store?.cars || seedCars)), _catalogAdditionsVersion: 3, reviews: store?.reviews || [], orders: store?.orders || [], bookings: store?.bookings || [], users: store?.users || [], expenses: store?.expenses || [], coupons: store?.coupons || [], resetTokens: store?.resetTokens || [], _revision: Number(store?._revision || 0) };
}
async function redisCommand(command) {
  const url = process.env.TFA_STORE_URL;
  const token = process.env.TFA_STORE_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command) });
  if (!response.ok) throw new Error(`Хранилище данных ответило HTTP ${response.status}`);
  return (await response.json()).result;
}
async function getStore() {
  if (localStoreAdapter) return normalizeStore(await localStoreAdapter.read());
  if (process.env.TFA_STORE_URL && process.env.TFA_STORE_TOKEN) {
    try {
      const saved = await redisCommand(['GET', STORE_KEY]);
      if (saved) return normalizeStore(JSON.parse(saved));
      const initial = freshStore();
      const created = await redisCommand(['SET', STORE_KEY, JSON.stringify(initial), 'NX']);
      if (created) return initial;
      return normalizeStore(JSON.parse(await redisCommand(['GET', STORE_KEY])));
    } catch (error) {
      console.error('Persistent store unavailable:', error.message);
      throw new Error('Не удалось подключиться к хранилищу. Проверьте TFA_STORE_URL и TFA_STORE_TOKEN в Vercel.');
    }
  }
  if (process.env.NODE_ENV === 'production') throw new Error('Для надёжной работы сайта в Vercel подключите Upstash Redis: TFA_STORE_URL и TFA_STORE_TOKEN.');
  memoryStore ||= freshStore();
  memoryStore.expenses ||= [];
  return memoryStore;
}
async function saveStore(store) {
  if (localStoreAdapter) return localStoreAdapter.write(store);
  if (process.env.TFA_STORE_URL && process.env.TFA_STORE_TOKEN) {
    try {
      const expectedRevision = Number(store._revision || 0);
      const next = { ...store, _revision: expectedRevision + 1 };
      const script = "local raw=redis.call('GET',KEYS[1]); if not raw then return -1 end; local current=cjson.decode(raw); if tonumber(current._revision or 0)~=tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1";
      const saved = await redisCommand(['EVAL', script, '1', STORE_KEY, String(expectedRevision), JSON.stringify(next)]);
      if (Number(saved) !== 1) throw new Error('Данные одновременно изменились. Обновите страницу и повторите действие.');
      store._revision = next._revision;
    } catch (error) { console.error('Persistent store write failed:', error.message); throw new Error(error.message || 'Не удалось сохранить данные. Проверьте подключение к хранилищу Vercel.'); }
    return;
  }
  memoryStore = store;
}

function tokenFor(user) {
  const encode = value => Buffer.from(value).toString('base64url');
  const now = Date.now();
  const unsigned = `${encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${encode(JSON.stringify({ sub: user.email, name: user.name, role: user.role, iat: now, exp: now + 7 * 86400000 }))}`;
  const signature = createHmac('sha256', process.env.JWT_SECRET || 'local-only-change-this-secret').update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
}
function userFromToken(req) {
  try {
    const authorization = req.headers.authorization || '';
    const cookie = (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith('tfa_token='))?.slice(10);
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : decodeURIComponent(cookie || '');
    const [header, payload, signature] = token.split('.');
    const unsigned = `${header}.${payload}`;
    const expected = createHmac('sha256', process.env.JWT_SECRET || 'local-only-change-this-secret').update(unsigned).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return user.exp > Date.now() ? user : null;
  } catch { return null; }
}
function reply(res, status, body) { return res.status(status).json(body); }
function requireUser(req, res, admin = false, store) {
  const claims = userFromToken(req);
  const storedUser = claims && store?.users.find(item => item.email === claims.sub);
  if (storedUser?.passwordChangedAt && Number(claims.iat || 0) < Number(storedUser.passwordChangedAt)) { reply(res, 401, { error: 'Пароль изменён. Войдите снова.' }); return null; }
  const user = storedUser ? { ...claims, role: storedUser.role, name: storedUser.name } : claims;
  if (!user) { reply(res, 401, { error: 'Нужно войти в аккаунт' }); return null; }
  if (admin && (user.role !== 'admin' || user.sub !== String(process.env.ADMIN_EMAIL || '').trim().toLowerCase())) { reply(res, 403, { error: 'Доступ только для администратора' }); return null; }
  return user;
}
function sendCookie(res, token) {
  res.setHeader('Set-Cookie', `tfa_token=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
function readCookie(req, name) {
  const prefix = `${name}=`;
  const value = (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(prefix))?.slice(prefix.length);
  try { return decodeURIComponent(value || ''); } catch { return ''; }
}
function oauthRedirect(res, provider, success = false, token = '') {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const clearState = `tfa_oauth_${provider}=; HttpOnly; SameSite=Lax; Path=/api; Max-Age=0${secure}`;
  const cookies = [clearState];
  if (success) cookies.push(`tfa_token=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`);
  res.setHeader('Set-Cookie', cookies);
  res.statusCode = 302;
  res.setHeader('Location', success ? '/?oauth=success' : '/login?oauth_error=1');
  return res.end();
}
function oauthCallbackUrl(req, provider) {
  const configured = process.env[provider === 'google' ? 'GOOGLE_OAUTH_CALLBACK_URL' : 'GITHUB_OAUTH_CALLBACK_URL'];
  if (configured) return configured;
  const protocol = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = process.env.VERCEL_URL || req.headers.host;
  return `${protocol}://${host}/api/oauth/${provider}/callback`;
}
async function handleOAuth(req, res, provider, callback, query) {
  const clientId = process.env[provider === 'google' ? 'GOOGLE_CLIENT_ID' : 'GITHUB_CLIENT_ID'];
  const clientSecret = process.env[provider === 'google' ? 'GOOGLE_CLIENT_SECRET' : 'GITHUB_CLIENT_SECRET'];
  if (!clientId || !clientSecret) return reply(res, 503, { error: `Настройте ${provider === 'google' ? 'GOOGLE' : 'GITHUB'}_CLIENT_ID и CLIENT_SECRET` });
  const cookieName = `tfa_oauth_${provider}`;
  if (!callback) {
    const state = randomBytes(24).toString('hex');
    const redirectUri = oauthCallbackUrl(req, provider);
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `${cookieName}=${state}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=600${secure}`);
    const params = provider === 'google'
      ? new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account' })
      : new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, scope: 'read:user user:email', state });
    res.statusCode = 302;
    res.setHeader('Location', provider === 'google' ? `https://accounts.google.com/o/oauth2/v2/auth?${params}` : `https://github.com/login/oauth/authorize?${params}`);
    return res.end();
  }

  const stateCookie = readCookie(req, cookieName);
  const expectedState = Buffer.from(stateCookie);
  const suppliedState = Buffer.from(String(query.state || ''));
  if (!expectedState.length || expectedState.length !== suppliedState.length || !timingSafeEqual(expectedState, suppliedState)) return oauthRedirect(res, provider);
  if (query.error || !query.code) return oauthRedirect(res, provider);

  try {
    let profile;
    if (provider === 'google') {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: query.code, client_id: clientId, client_secret: clientSecret, redirect_uri: oauthCallbackUrl(req, provider), grant_type: 'authorization_code' }) });
      const tokens = await tokenResponse.json();
      if (!tokenResponse.ok || !tokens.access_token) throw new Error('Google token exchange failed');
      const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
      profile = await userResponse.json();
      if (!userResponse.ok || profile.email_verified !== true) throw new Error('Google email is not verified');
    } else {
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ code: query.code, client_id: clientId, client_secret: clientSecret }) });
      const tokens = await tokenResponse.json();
      if (!tokenResponse.ok || !tokens.access_token) throw new Error('GitHub token exchange failed');
      const headers = { Authorization: `Bearer ${tokens.access_token}`, 'User-Agent': 'The-Family-Auto', Accept: 'application/vnd.github+json' };
      const [userResponse, emailResponse] = await Promise.all([fetch('https://api.github.com/user', { headers }), fetch('https://api.github.com/user/emails', { headers })]);
      const github = await userResponse.json(); const emails = await emailResponse.json();
      if (!userResponse.ok || !emailResponse.ok || !Array.isArray(emails)) throw new Error('GitHub profile lookup failed');
      const verifiedEmail = emails.find(item => item.primary && item.verified)?.email;
      if (!verifiedEmail) throw new Error('GitHub did not return a verified primary email');
      profile = { email: verifiedEmail, name: github.name || github.login };
    }

    const store = await getStore();
    const email = String(profile.email).trim().toLowerCase();
    const existing = store.users.find(item => item.email === email);
    const user = existing || { email, name: profile.name || email.split('@')[0], role: 'user' };
    if (existing) existing.name = profile.name || existing.name;
    else store.users.push(user);
    await saveStore(store);
    return oauthRedirect(res, provider, true, tokenFor(user));
  } catch (error) {
    console.error(`${provider} OAuth failed:`, error.message);
    return oauthRedirect(res, provider);
  }
}
async function notify(record) {
  const cars = record.items?.map(item => item.name).filter(Boolean).join(', ') || record.car || 'Не указан';
  const message = [
    record.items ? '🚘 Новый заказ The Family Auto' : '📅 Новая заявка The Family Auto',
    `Номер: ${record.reference || '—'}`,
    `Клиент: ${record.name || 'Не указано'}`,
    `Телефон: ${record.phone || 'Не указан'}`,
    `Автомобиль: ${cars}`,
    record.total ? `Сумма: $${Number(record.total).toLocaleString('en-US')}` : '',
    record.method ? `Формат: ${record.method}` : '',
    record.email ? `Email: ${record.email}` : '',
    record.reason || record.comment ? `Запрос: ${String(record.reason || record.comment).slice(0,2000)}` : '',
  ].filter(Boolean).join('\n');
  const results = [];
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message }) });
      results.push({ telegram: response.ok ? 'sent' : 'failed' });
    } catch { results.push({ telegram: 'failed' }); }
  }
  return results;
}
function quoteCoupon(store, code, subtotal) {
  const coupon = store.coupons.find(item => item.code === String(code || '').trim().toUpperCase());
  if (!coupon || !coupon.active) return { error: 'Купон не найден или отключён' };
  const today = new Date().toISOString().slice(0, 10);
  if (coupon.startsAt && today < coupon.startsAt) return { error: 'Срок действия купона ещё не начался' };
  if (coupon.expiresAt && today > coupon.expiresAt) return { error: 'Срок действия купона истёк' };
  if (coupon.usageLimit && coupon.uses >= coupon.usageLimit) return { error: 'Купон уже использован максимальное число раз' };
  const discount = Math.min(subtotal, coupon.type === 'percent' ? subtotal * coupon.value / 100 : coupon.value);
  return { coupon, discount: Math.round(discount * 100) / 100 };
}

let mutationQueue = Promise.resolve();
export default async function handler(req, res) {
  if ((req.method || 'GET') === 'GET') return handleRequest(req, res);
  const task = mutationQueue.then(() => handleRequest(req, res));
  mutationQueue = task.catch(() => {});
  return task;
}
async function handleRequest(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const route = String(url.searchParams.get('path') || url.pathname.replace(/^\/api\/?/, '')).replace(/^\/+|\/+$/g, '');
  const parts = route.split('/').filter(Boolean);
  const method = req.method || 'GET';
  const body = req.body && typeof req.body === 'object' ? req.body : {};

  try {
    if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || !process.env.ADMIN_EMAIL)) throw new Error('Для запуска задайте JWT_SECRET длиной не менее 32 символов и ADMIN_EMAIL в настройках Vercel.');
    const store = await getStore();
    if (method === 'GET' && route === 'cars') { res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300'); return reply(res, 200, store.cars); }
    if (method === 'GET' && route === 'reviews') return reply(res, 200, store.reviews);
    if (method === 'POST' && route === 'auth/logout') { res.setHeader('Set-Cookie', 'tfa_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' + (process.env.NODE_ENV === 'production' ? '; Secure' : '')); return reply(res, 200, { ok: true }); }
    if (method === 'POST' && route === 'auth/reset/request') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(res, 400, { error: 'Введите действующий email' });
      if (!mailConfigured()) return reply(res, 503, { code: 'MAIL_NOT_CONFIGURED', error: 'Отправка кодов ещё не подключена. Настройте почтовый сервис автосалона.' });
      const user = store.users.find(item => item.email === email);
      if (user) {
        try {
          const recentReset = store.resetTokens.find(item => item.email === email && item.sentAt > Date.now() - 60_000);
          if (recentReset) return reply(res, 200, { ok: true, retryAfter: 60, expiresIn: 900, message: 'Если аккаунт существует, код восстановления отправлен на email.' });

          const code = String(randomInt(0, 1000000)).padStart(6, '0');
          const codeHash = createHmac('sha256', process.env.JWT_SECRET || 'local-only-change-this-secret').update(`${email}:${code}`).digest('hex');
          store.resetTokens = store.resetTokens.filter(item => item.email !== email && item.expiresAt > Date.now());
          store.resetTokens.push({ email, codeHash, sentAt: Date.now(), expiresAt: Date.now() + 15 * 60 * 1000 });
          await saveStore(store);
          await sendPasswordReset(email, code, body.lang);
        } catch (error) { store.resetTokens = store.resetTokens.filter(item => item.email !== email); try { await saveStore(store); } catch {} return reply(res, 503, { code: 'MAIL_SEND_FAILED', error: 'Не удалось отправить письмо. Попробуйте позже или свяжитесь с автосалоном.' }); }
      }
      return reply(res, 200, { ok: true, retryAfter: 60, expiresIn: 900, message: 'Если аккаунт существует, код восстановления отправлен на email.' });
    }
    if (method === 'POST' && route === 'auth/reset/confirm') {
      const email = String(body.email || '').trim().toLowerCase(); const code = String(body.code || '').trim(); const password = String(body.password || '');
      if (password.length < 8 || !/^\d{6}$/.test(code)) return reply(res, 400, { error: 'Введите шестизначный код и пароль не короче 8 символов' });
      const reset = store.resetTokens.find(item => item.email === email && item.expiresAt > Date.now());
      if (!reset) return reply(res, 400, { code: 'RESET_INVALID', error: 'Код неверный или срок его действия истёк' });
      reset.attempts = Number(reset.attempts || 0) + 1;
      if (reset.attempts > 5) { store.resetTokens = store.resetTokens.filter(item => item.email !== email); await saveStore(store); return reply(res, 400, { code: 'RESET_BLOCKED', error: 'Код заблокирован. Запросите новый.' }); }
      const supplied = createHmac('sha256', process.env.JWT_SECRET || 'local-only-change-this-secret').update(`${email}:${code}`).digest();
      const expected = Buffer.from(reset.codeHash || '', 'hex');
      if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) { await saveStore(store); return reply(res, 400, { code: 'RESET_INVALID', error: 'Код неверный или срок его действия истёк' }); }
      const user = store.users.find(item => item.email === email);
      if (!user) return reply(res, 400, { error: 'Аккаунт не найден' });
      user.salt = randomBytes(16).toString('hex'); user.passwordHash = scryptSync(password, user.salt, 64).toString('hex'); user.passwordChangedAt = Date.now() + 1;
      store.resetTokens = store.resetTokens.filter(item => item.email !== email); await saveStore(store);
      res.setHeader('Set-Cookie', 'tfa_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' + (process.env.NODE_ENV === 'production' ? '; Secure' : ''));
      return reply(res, 200, { ok: true });
    }
    if (method === 'POST' && route === 'auth/owner/setup') {
      const email = String(body.email || '').trim().toLowerCase();
      const expected = Buffer.from(String(process.env.ADMIN_BOOTSTRAP_SECRET || ''));
      const supplied = Buffer.from(String(body.adminSecret || ''));
      if (!expected.length || supplied.length !== expected.length || !timingSafeEqual(expected, supplied) || email !== String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()) return reply(res, 403, { error: 'Данные настройки неверны' });
      if (store.users.some(user => user.email === email && user.role === 'admin')) return reply(res, 409, { error: 'Доступ владельца уже настроен. Используйте страницу входа.' });
      if (String(body.password || '').length < 12) return reply(res, 400, { error: 'Пароль должен содержать не менее 12 символов' });
      const salt = randomBytes(16).toString('hex');
      const user = { email, name: String(body.name || 'Владелец').trim().slice(0,100), role: 'admin', salt, passwordHash: scryptSync(body.password, salt, 64).toString('hex'), passwordChangedAt: Date.now() };
      store.users = store.users.filter(item => item.email !== email);
      store.users.forEach(item => { if (item.role === 'admin') item.role = 'user'; });
      store.users.push(user); await saveStore(store);
      return reply(res, 201, { ok: true });
    }
    if (method === 'POST' && route === 'auth') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || String(body.password || '').length < 8) return reply(res, 400, { error: 'Укажите действующий email и пароль не короче 8 символов' });
      let user = store.users.find(item => item.email === email);
      if (body.mode === 'register') {
        if (body.terms !== 'on') return reply(res, 400, { error: 'Подтвердите согласие с условиями использования' });
        const phone = normalizePhone(body.phone);
        if (!phone) return reply(res, 400, { error: 'Введите 9 цифр телефона после кода +996' });
        if (user) return reply(res, 409, { error: 'Аккаунт с таким email уже существует' });
        const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
        const role = 'user';
        if (adminEmail && email === adminEmail) return reply(res, 403, { error: 'Этот адрес недоступен для регистрации. Воспользуйтесь входом.' });
        const salt = randomBytes(16).toString('hex');
        user = { email, name: body.name || email.split('@')[0], phone, role, salt, passwordHash: scryptSync(body.password, salt, 64).toString('hex') };
        store.users.push(user); await saveStore(store);
      } else if (!user || !user.passwordHash || scryptSync(body.password, user.salt, 64).toString('hex') !== user.passwordHash) return reply(res, 401, { error: 'Неверная почта или пароль' });

      const token = tokenFor(user); sendCookie(res, token);
      return reply(res, 200, { token, user: { name: user.name, email: user.email, role: user.role } });
    }
    if (method === 'POST' && route === 'auth/oauth') {
      if (process.env.NODE_ENV === 'production') return reply(res, 503, { error: 'Демо-вход отключён. Настройте вход Google или GitHub перед публикацией.' });
      if (!['google', 'github'].includes(body.provider)) return reply(res, 400, { error: 'Неизвестный OAuth provider' });
      const user = { name: `${body.provider[0].toUpperCase()}${body.provider.slice(1)} Demo`, email: `${body.provider}-demo@example.com`, role: 'user' };
      return reply(res, 200, { token: tokenFor(user), user, demo: true });
    }
    if (method === 'GET' && route === 'me') {
      const user = requireUser(req, res, false, store); if (!user) return;
      return reply(res, 200, { name: user.name, email: user.sub, role: user.role });
    }
    if (method === 'GET' && route === 'me/orders') {
      const user = requireUser(req, res, false, store); if (!user) return;
      return reply(res, 200, store.orders.filter(order => order.email === user.sub));
    }
    if (method === 'GET' && route === 'admin/stats') {
      if (!requireUser(req, res, true, store)) return;
      const byBrand = [...new Set(store.cars.map(car => String(car.brand || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)).map(brand => ({ brand, total: store.cars.filter(car => car.brand === brand).length }));
      const months = Array.from({ length: 6 }, (_, index) => { const date = new Date(); date.setDate(1); date.setHours(0, 0, 0, 0); date.setMonth(date.getMonth() - (5 - index)); return { key: date.toISOString().slice(0, 7), month: date.toLocaleDateString('ru-RU', { month: 'short' }), revenue: 0, inventoryCost: 0, expenses: 0, profit: 0 }; });
      const monthMap = new Map(months.map(month => [month.key, month]));
      let knownCostOrders = 0;
      let soldInventoryCost = 0;
      for (const order of store.orders) {
        const items = order.items || [];
        const hasCost = items.length && items.every(item => Number(item.purchaseCost) > 0);
        if (hasCost) { knownCostOrders += 1; soldInventoryCost += items.reduce((sum, item) => sum + Number(item.purchaseCost), 0); }
        const month = monthMap.get(String(order.createdAt || '').slice(0, 7));
        if (!month) continue;
        month.revenue += Number(order.total || 0);
        if (hasCost) month.inventoryCost += items.reduce((sum, item) => sum + Number(item.purchaseCost), 0);
      }
      for (const expense of store.expenses) { const month = monthMap.get(String(expense.date || '').slice(0, 7)); if (month) month.expenses += Number(expense.amount || 0); }
      for (const month of months) month.profit = month.revenue - month.inventoryCost - month.expenses;
      const revenue = store.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      const expenses = store.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      return reply(res, 200, { cars: store.cars.length, users: store.users.length, orders: store.orders.length, revenue, expenses, inventoryCost: store.cars.reduce((sum, car) => sum + Number(car.purchaseCost || 0), 0), profit: revenue - soldInventoryCost - expenses, monthly: months, knownCostOrders, byBrand });
    }
    if (method === 'GET' && route === 'admin/expenses') {
      if (!requireUser(req, res, true, store)) return;
      return reply(res, 200, store.expenses.slice().sort((a, b) => b.date.localeCompare(a.date)));
    }
    if (method === 'POST' && route === 'admin/expenses') {
      if (!requireUser(req, res, true, store)) return;
      const amount = Number(body.amount);
      const date = String(body.date || '').slice(0, 10);
      if (!Number.isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !String(body.description || '').trim()) return reply(res, 400, { error: 'Укажите описание, дату и сумму расхода больше нуля' });
      const expense = { id: randomBytes(8).toString('hex'), description: String(body.description).trim().slice(0, 120), category: String(body.category || 'other').slice(0, 40), date, amount: Math.round(amount * 100) / 100, createdAt: new Date().toISOString() };
      store.expenses.push(expense); await saveStore(store); return reply(res, 201, expense);
    }
    if (method === 'GET' && route === 'admin/coupons') {
      if (!requireUser(req, res, true, store)) return;
      return reply(res, 200, store.coupons.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }
    if (method === 'POST' && route === 'admin/coupons') {
      if (!requireUser(req, res, true, store)) return;
      const code = String(body.code || '').trim().toUpperCase();
      const type = body.type === 'fixed' ? 'fixed' : 'percent';
      const value = Number(body.value);
      const usageLimit = body.usageLimit ? Math.floor(Number(body.usageLimit)) : null;
      if (!/^[A-Z0-9-]{3,24}$/.test(code) || store.coupons.some(item => item.code === code)) return reply(res, 400, { error: 'Введите уникальный код из 3–24 латинских букв, цифр или дефисов' });
      if (!Number.isFinite(value) || value <= 0 || (type === 'percent' && value > 90)) return reply(res, 400, { error: 'Скидка должна быть положительной; процент не может превышать 90%' });
      if (usageLimit !== null && (!Number.isFinite(usageLimit) || usageLimit < 1)) return reply(res, 400, { error: 'Лимит использований должен быть целым числом больше нуля' });
      const coupon = { id: randomBytes(8).toString('hex'), code, type, value: Math.round(value * 100) / 100, usageLimit, uses: 0, startsAt: String(body.startsAt || '').slice(0, 10), expiresAt: String(body.expiresAt || '').slice(0, 10), active: true, createdAt: new Date().toISOString() };
      store.coupons.push(coupon); await saveStore(store); return reply(res, 201, coupon);
    }
    if (method === 'PATCH' && parts[0] === 'admin' && parts[1] === 'coupons' && parts[2]) {
      if (!requireUser(req, res, true, store)) return;
      const coupon = store.coupons.find(item => item.code === decodeURIComponent(parts[2]).toUpperCase());
      if (!coupon) return reply(res, 404, { error: 'Купон не найден' });
      coupon.active = Boolean(body.active); await saveStore(store); return reply(res, 200, coupon);
    }
    if (method === 'POST' && route === 'coupons/validate') {
      const ids = Array.isArray(body.items) ? body.items.map(Number) : [];
      const items = store.cars.filter(car => ids.includes(Number(car.id)));
      if (!items.length) return reply(res, 400, { error: 'Корзина пуста' });
      const subtotal = items.reduce((sum, car) => sum + Number(car.price || 0), 0);
      const result = quoteCoupon(store, body.code, subtotal);
      if (result.error) return reply(res, 400, { error: result.error });
      return reply(res, 200, { code: result.coupon.code, discount: result.discount, total: subtotal - result.discount });
    }
    if (method === 'PATCH' && parts[0] === 'admin' && parts[1] === 'orders' && parts[2]) {
      if (!requireUser(req, res, true, store)) return;
      const order = store.orders.find(item => item.reference === parts[2]);
      if (!order) return reply(res, 404, { error: 'Заказ не найден' });
      if (!Object.hasOwn(ORDER_STAGE_PROGRESS, body.status)) return reply(res, 400, { error: 'Неизвестный этап заказа' });
      const statusChanged = order.status !== body.status;
      const updatedAt = new Date().toISOString();
      Object.assign(order, { status: body.status, progress: ORDER_STAGE_PROGRESS[body.status], progressAt: updatedAt, updatedAt });
      await saveStore(store);
      const deliveryNotification = statusChanged ? await sendDeliveryNotification(order, body.status) : undefined;
      return reply(res, 200, { ...order, deliveryNotification });
    }
    if (method === 'GET' && parts[0] === 'orders' && parts[1]) {
      const user = requireUser(req, res, false, store); if (!user) return;
      const order = store.orders.find(item => item.reference === parts[1] && (user.role === 'admin' || item.email === user.sub));
      return order ? reply(res, 200, order) : reply(res, 404, { error: 'Заказ не найден' });
    }
    if (method === 'GET' && route === 'admin/orders') {
      if (!requireUser(req, res, true, store)) return;
      return reply(res, 200, store.orders);
    }
    if (method === 'POST' && route === 'cars') {
      if (!requireUser(req, res, true, store)) return;
      const brand = String(body.brand || '').trim().slice(0, 80); const model = String(body.model || '').trim().slice(0, 100);
      const price = Number(body.price); const year = Number(body.year); const purchaseCost = Number(body.purchaseCost);
      if (!brand || !model || !Number.isFinite(price) || price <= 0 || !Number.isInteger(year) || year < 1886 || year > 2035 || !Number.isFinite(purchaseCost) || purchaseCost < 0) return reply(res, 400, { error: 'Укажите марку, модель, корректный год, цену и закупочную стоимость автомобиля' });
      const car = { ...body, brand, model, year, price, purchaseCost, priceHistory: [], id: Date.now(), name: `${brand} ${model}`, rating: 5, reviews: 0, badge: body.badge || 'Новинка', description: String(body.description || 'Новый автомобиль в каталоге The Family Auto.').slice(0, 4000) };
      store.cars.unshift(car); await saveStore(store); return reply(res, 201, car);
    }
    if ((method === 'PUT' || method === 'DELETE') && parts[0] === 'cars' && parts[1]) {
      if (!requireUser(req, res, true, store)) return;
      const index = store.cars.findIndex(car => String(car.id) === parts[1]);
      if (index < 0) return reply(res, 404, { error: 'Автомобиль не найден' });
      if (method === 'DELETE') { store.cars.splice(index, 1); await saveStore(store); return reply(res, 200, { ok: true }); }
      const previous = store.cars[index];
      const updated = { ...previous, ...body, purchaseCost: Math.max(0, Number(body.purchaseCost ?? previous.purchaseCost) || 0), id: previous.id, name: `${body.brand || previous.brand} ${body.model || previous.model}` };
      if (Number(updated.price) !== Number(previous.price)) updated.priceHistory = [...(previous.priceHistory || []), { price: Number(previous.price), date: new Date().toISOString().slice(0, 10) }].slice(-12);
      store.cars[index] = updated;
      await saveStore(store); return reply(res, 200, store.cars[index]);
    }
    if (method === 'POST' && route === 'reviews') {
      if (!String(body.name || '').trim() || !String(body.text || '').trim()) return reply(res, 400, { error: 'Укажите имя и текст отзыва' });
      const review = { name: String(body.name).trim().slice(0,100), text: String(body.text).trim().slice(0,3000), id: randomBytes(12).toString('hex'), rating: Math.max(1, Math.min(5, Math.round(Number(body.rating) || 5))), createdAt: new Date().toISOString() };
      store.reviews.unshift(review); await saveStore(store); return reply(res, 201, review);
    }
    if (method === 'POST' && route === 'contact') {
      const phone = normalizePhone(body.phone); if (!phone) return reply(res, 400, { error: 'Введите 9 цифр телефона после кода +996' });
      return reply(res, 201, { ok: true, notifications: await notify({ ...body, phone, total: 0, reference: `TFA-${Date.now().toString().slice(-6)}` }) });
    }
    if (method === 'POST' && route === 'bookings') {
      const phone = normalizePhone(body.phone); if (!phone) return reply(res, 400, { error: 'Введите 9 цифр телефона после кода +996' });
      const booking = { id: Date.now(), ...body, phone, reference: `TFA-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString() };
      store.bookings.unshift(booking); await saveStore(store); return reply(res, 201, { ok: true, reference: booking.reference, notifications: await notify({ ...booking, total: 0 }) });
    }
    if (method === 'POST' && route === 'orders') {
      const user = requireUser(req, res, false, store); if (!user) return;
      const phone = normalizePhone(body.phone); if (!phone) return reply(res, 400, { error: 'Введите 9 цифр телефона после кода +996' });
      const address = String(body.address || '').trim(); if (address.length < 6) return reply(res, 400, { error: 'Укажите полный адрес доставки' });
      const ids = Array.isArray(body.items) ? body.items.map(Number) : [];
      const items = store.cars.filter(car => ids.includes(Number(car.id)));
      if (!items.length || items.length !== new Set(ids).size) return reply(res, 400, { error: 'Проверьте корзину: один из автомобилей уже недоступен' });
      const reference = `TFA-${randomBytes(6).toString('hex').toUpperCase()}`;
      const createdAt = new Date().toISOString();
      const subtotal = items.reduce((sum, car) => sum + Number(car.price), 0);
      let discount = 0; let couponCode = '';
      if (body.couponCode) { const quote = quoteCoupon(store, body.couponCode, subtotal); if (quote.error) return reply(res, 400, { error: quote.error }); discount = quote.discount; couponCode = quote.coupon.code; quote.coupon.uses += 1; }
      const order = { id: Date.now(), reference, name: body.name || user.name, email: user.sub, contactEmail: String(body.email || user.sub).trim().slice(0, 254), phone, items: items.map(car => ({ id: car.id, name: car.name, price: car.price, purchaseCost: Number(car.purchaseCost || 0) })), subtotal, discount, couponCode, total: subtotal - discount, payment: body.payment || 'demo', address, status: 'confirmed', progress: 0, progressAt: createdAt, createdAt, updatedAt: createdAt };
      store.orders.unshift(order); await saveStore(store); const notifications = await notify(order);
      return reply(res, 201, { ok: true, reference, total: order.total, payment: { provider: order.payment, mode: 'demo', status: 'pending' }, notifications });
    }
    if (method === 'POST' && route === 'payments') {
      if (!requireUser(req, res, false, store)) return;
      return reply(res, 200, { mode: 'demo', provider: body.provider || 'stripe', message: 'Демо-платёж: деньги не списываются', reference: `PAY-${Date.now().toString().slice(-6)}` });
    }
    const oauthRoute = route.match(/^oauth\/(google|github)(\/callback)?$/);
    if (method === 'GET' && oauthRoute) return handleOAuth(req, res, oauthRoute[1], Boolean(oauthRoute[2]), Object.fromEntries(url.searchParams));
    return reply(res, 404, { error: 'API endpoint не найден' });
  } catch (error) {
    console.error('API error:', error);
    return reply(res, 500, { error: error.message || 'Внутренняя ошибка API' });
  }
}
