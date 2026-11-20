import React from 'react';

export default function CouponEntry({ code, onCodeChange, onApply, coupon }) {
  return <div className="coupon-entry">
    <label htmlFor="order-coupon">Промокод</label>
    <div><input id="order-coupon" value={code} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); onApply(); } }} onChange={event => onCodeChange(event.target.value.toUpperCase())} maxLength={24} placeholder="Например, FAMILY10"/><button type="button" className="outline-button" onClick={onApply}>Применить</button></div>
    {coupon && <small>Купон {coupon.code}: −${Number(coupon.discount).toLocaleString('en-US')}</small>}
  </div>;
}
