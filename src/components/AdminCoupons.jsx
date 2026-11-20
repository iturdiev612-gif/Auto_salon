import React, { useEffect, useState } from 'react';

const money = value => '$' + Number(value || 0).toLocaleString('en-US');

export default function AdminCoupons({ api, announce }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; api('/api/admin/coupons').then(data => { if (active) setCoupons(data); }).catch(error => announce(error.message)).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [api, announce]);

  const createCoupon = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.value = Number(data.value);
    try { const coupon = await api('/api/admin/coupons', { method: 'POST', body: JSON.stringify(data) }); setCoupons(items => [coupon, ...items]); form.reset(); announce('Купон создан'); }
    catch (error) { announce(error.message); }
  };

  const toggleCoupon = async coupon => {
    try { const updated = await api(`/api/admin/coupons/${encodeURIComponent(coupon.code)}`, { method: 'PATCH', body: JSON.stringify({ active: !coupon.active }) }); setCoupons(items => items.map(item => item.code === updated.code ? updated : item)); }
    catch (error) { announce(error.message); }
  };

  return <details className="admin-optional admin-coupons" open><summary>Купоны и скидки ({coupons.length})</summary>
    <form className="coupon-admin-form" onSubmit={createCoupon}>
      <input name="code" required minLength="3" maxLength="24" pattern="[A-Za-z0-9-]+" placeholder="Код, например FAMILY10"/>
      <select name="type" defaultValue="percent"><option value="percent">Скидка, %</option><option value="fixed">Скидка, $</option></select>
      <input name="value" type="number" required min="1" step="1" placeholder="Размер"/>
      <input name="usageLimit" type="number" min="1" step="1" placeholder="Лимит применений (необязательно)"/>
      <input name="expiresAt" type="date" aria-label="Действует до"/>
      <button className="button button-lime" type="submit">Создать купон</button>
    </form>
    <div className="coupon-admin-list">{loading ? <p>Загружаем купоны…</p> : coupons.length ? coupons.map(coupon => <div key={coupon.id}><span><b>{coupon.code}</b><small>{coupon.type === 'percent' ? `${coupon.value}%` : money(coupon.value)} скидка · использован {coupon.uses}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}{coupon.expiresAt ? ` · до ${coupon.expiresAt}` : ''}</small></span><button type="button" onClick={() => toggleCoupon(coupon)}>{coupon.active ? 'Отключить' : 'Включить'}</button></div>) : <p>Купонов пока нет.</p>}</div>
  </details>;
}
