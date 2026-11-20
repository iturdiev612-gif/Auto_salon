import CouponEntry from '../components/CouponEntry.jsx';
import PageHeader from '../components/PageHeader.jsx';
import PhoneInput from '../components/PhoneInput.jsx';
import CarImage from '../components/CarImage.jsx';

export default function OrderPage({ navigate, cart, cars, t, user, couponCode, setCouponCode, setCouponQuote, applyCoupon, couponQuote, checkoutTotal, submitRequest, onRemoveCar, money, submitting, requestError, loading }) {
  const selected = cart.map(id => cars.find(car => car.id === id)).filter(Boolean);
  return <div className="order-page">
    <PageHeader navigate={navigate} backLabel="← Вернуться в каталог"/>
    <main className="order-layout">
      <div className="order-form-panel">
        <span className="eyebrow"><i/> ВАШ СЛЕДУЮЩИЙ АВТОМОБИЛЬ</span>
        <h1>{t.order}</h1>
        <p className="modal-muted">Оставьте контакты — менеджер свяжется с вами и подтвердит наличие, стоимость и способ получения автомобиля.</p>
        {loading ? <p role="status">Загружаем выбранные автомобили…</p> : selected.length ? <form className="modal-form checkout-form" onSubmit={event => submitRequest(event,'/api/orders',t.success)}>
          <fieldset disabled={submitting}>
            <legend>Контактные данные</legend>
            <label>{t.name}<input required name="name" autoComplete="name" defaultValue={user?.name || ''} maxLength="100"/></label>
            <label>{t.phone}<PhoneInput/></label>
            <label>{t.email}<input required name="email" type="email" autoComplete="email" defaultValue={user?.email || ''}/></label>
            <label>Адрес доставки<input required minLength="6" name="address" autoComplete="street-address" placeholder="Город, улица, дом"/></label>
            <CouponEntry code={couponCode} onCodeChange={value => {setCouponCode(value);setCouponQuote(null);}} onApply={applyCoupon} coupon={couponQuote}/>
            <label>Способ оплаты<select name="payment" defaultValue="cash"><option value="cash">Оплата после согласования с менеджером</option><option value="stripe">Stripe — тестовый режим</option><option value="postkg">Post.kg — тестовый режим</option></select></label>
            <p className="checkout-note">Сейчас оформляется заявка на покупку. Деньги с карты не списываются.</p>
            {requestError && <div className="auth-error" role="alert">{requestError}</div>}
            <button className="button button-lime full-button" type="submit" disabled={submitting}>{submitting ? 'Отправляем заказ…' : 'Подтвердить заказ'}<span>↗</span></button>
          </fieldset>
        </form> : <div className="order-empty"><p>{t.empty}. Добавьте автомобиль в корзину.</p><button className="button button-lime" onClick={() => navigate('/#catalog')}>{t.showCars}<span>↗</span></button></div>}
      </div>
      <aside className="order-summary"><span className="eyebrow"><i/> ВЫ ВЫБРАЛИ</span><h2>{t.cart} <small>({selected.length})</small></h2>
        {selected.map(car => <div className="order-car" key={car.id}><CarImage src={car.image} alt={car.name}/><div><b>{car.name}</b><span>{money(car.price)}</span><button disabled={submitting} type="button" onClick={() => onRemoveCar(car.id)}>{t.remove}</button></div></div>)}
        {couponQuote && <p>Скидка: −{money(couponQuote.discount)}</p>}
        <div className="modal-total"><span>{t.total}</span><b>{money(checkoutTotal)}</b></div>
      </aside>
    </main>
  </div>;
}
