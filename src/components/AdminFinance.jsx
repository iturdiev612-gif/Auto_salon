import React from 'react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const money = value => '$' + Number(value || 0).toLocaleString('en-US');

export default function AdminFinance({ stats, expenses, onAddExpense }) {
  return <section className="finance-panel" aria-labelledby="finance-title">
    <div className="finance-heading"><div><span className="eyebrow"><i/> FINANCE · 6 MONTHS</span><h3 id="finance-title">Доходы, расходы и прибыль</h3></div><b>{money(stats?.profit)}</b></div>
    <p className="finance-note">Прибыль рассчитывается как оборот минус закупочная стоимость проданных машин и записанные расходы. Внесите закупочную цену в карточку каждого автомобиля для точного расчёта.</p>
    <div className="finance-chart"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={stats?.monthly || []} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 10 }}/><YAxis tick={{ fill: 'var(--muted)', fontSize: 9 }} tickFormatter={value => `$${Math.round(value / 1000)}k`}/><Tooltip formatter={value => money(value)} contentStyle={{ background: 'var(--surface)', borderColor: 'var(--line)', borderRadius: 10, color: 'var(--ink)' }}/><Legend wrapperStyle={{ fontSize: 9 }}/><Bar dataKey="revenue" name="Оборот" fill="#82975a" radius={[4,4,0,0]}/><Bar dataKey="inventoryCost" name="Себестоимость" fill="#d1ad68" radius={[4,4,0,0]}/><Bar dataKey="expenses" name="Расходы" fill="#c8796d" radius={[4,4,0,0]}/>
    <Line type="monotone" dataKey="profit" name="Прибыль" stroke="#607a42" strokeWidth={2} dot={false}/></ComposedChart></ResponsiveContainer></div>
    <div className="finance-kpis"><div><span>Оборот</span><b>{money(stats?.revenue)}</b></div><div><span>Закупочная стоимость авто в наличии</span><b>{money(stats?.inventoryCost)}</b></div><div><span>Расходы</span><b>{money(stats?.expenses)}</b></div><div><span>Расчётная прибыль</span><b>{money(stats?.profit)}</b></div></div>
    <form className="expense-form" onSubmit={onAddExpense}><strong>Добавить расход</strong><input name="description" required maxLength="120" placeholder="Например, аренда помещения"/><select name="category" defaultValue="operating"><option value="operating">Операционный</option><option value="marketing">Реклама</option><option value="service">Обслуживание</option><option value="other">Другое</option></select><input name="date" type="date" required defaultValue={new Date().toISOString().slice(0,10)}/><input name="amount" type="number" min="0.01" step="0.01" required placeholder="Сумма, $"/><button className="button button-dark" type="submit">Сохранить расход</button></form>
    <details className="expense-history"><summary>Записанные расходы ({expenses.length})</summary><div>{expenses.length ? expenses.slice(0,12).map(item => <p key={item.id}><span>{item.date} · {item.description}</span><b>{money(item.amount)}</b></p>) : <p>Расходы пока не добавлены.</p>}</div></details>
    {stats?.knownCostOrders < stats?.orders && <small className="finance-note">В {stats.orders - stats.knownCostOrders} старых заказах себестоимость неизвестна; история прибыли может быть завышена.</small>}
  </section>;
}
