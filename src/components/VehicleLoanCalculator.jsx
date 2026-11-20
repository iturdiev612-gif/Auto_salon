import React, { useMemo, useState } from 'react';

const money = value => '$' + Math.round(value).toLocaleString('en-US');

export default function VehicleLoanCalculator({ price }) {
  const [downPayment, setDownPayment] = useState(20);
  const [months, setMonths] = useState(60);
  const monthly = useMemo(() => {
    const principal = price * (1 - downPayment / 100);
    const monthlyRate = 0.16 / 12;
    return principal * monthlyRate / (1 - (1 + monthlyRate) ** -months);
  }, [price, downPayment, months]);
  return <section className="loan-calculator" aria-label="Предварительный расчёт платежа">
    <strong>Платёж в месяц — ориентировочно {money(monthly)}</strong>
    <label>Первый взнос: {downPayment}%<input type="range" min="0" max="70" step="5" value={downPayment} onChange={event => setDownPayment(Number(event.target.value))}/></label>
    <label>Срок<select value={months} onChange={event => setMonths(Number(event.target.value))}><option value="36">36 месяцев</option><option value="48">48 месяцев</option><option value="60">60 месяцев</option><option value="72">72 месяца</option></select></label>
    <small>Демо-расчёт при условной ставке 16% годовых. Это не предложение банка; точные условия подтвердит кредитор.</small>
  </section>;
}
