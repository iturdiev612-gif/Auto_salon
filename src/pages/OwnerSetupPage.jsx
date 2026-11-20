import { useState } from 'react';
import { api } from '../lib/api.js';
import PageHeader from '../components/PageHeader.jsx';
export default function OwnerSetupPage({ navigate }) {
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  return <main className="auth-page"><PageHeader navigate={navigate} backLabel="← На главную"/><section className="auth-panel"><div className="auth-box"><h1>Доступ владельца</h1>{done ? <><p role="status">Аккаунт владельца настроен. Войдите с указанной почтой и паролем.</p><button className="button button-lime" onClick={() => navigate('/login')}>Перейти ко входу ↗</button></> : <><p>Однократная настройка по инструкции, переданной владельцу автосалона.</p><form className="auth-form" onSubmit={async event => { event.preventDefault(); setBusy(true); setError(''); const body = Object.fromEntries(new FormData(event.currentTarget)); try { await api('/api/auth/owner/setup', { method: 'POST', body: JSON.stringify(body) }); setDone(true); } catch (e) { setError(e.message); } finally { setBusy(false); } }}><label>Имя<input name="name" autoComplete="name" required/></label><label>Почта владельца<input name="email" type="email" autoComplete="email" required/></label><label>Код из инструкции<input name="adminSecret" type="password" autoComplete="off" required/></label><label>Пароль<input name="password" type="password" autoComplete="new-password" minLength="12" required/></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="button button-lime" disabled={busy}>{busy ? 'Сохраняем…' : 'Создать доступ владельца'}</button></form></>}</div></section></main>;
}
