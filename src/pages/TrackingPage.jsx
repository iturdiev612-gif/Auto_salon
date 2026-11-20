import { useState } from 'react';
import BrandMark from '../components/BrandMark.jsx';
import DeliveryMap from '../components/DeliveryMap.jsx';
import DeliveryTimeline from '../components/DeliveryTimeline.jsx';
import { ORDER_STAGES } from '../data/orderStages.js';
import { money } from '../lib/format.js';

function TrackingHeader({ navigate }) {
  return (
    <header className="order-header">
      <a href="/" className="brand-logo" onClick={(event) => { event.preventDefault(); navigate('/'); }}>
        <BrandMark />
        <span>THE FAMILY <b>AUTO</b><small>PREMIUM AUTOMOBILES</small></span>
      </a>
      <button className="text-action" onClick={() => navigate('/')}>← В автосалон</button>
    </header>
  );
}

function TrackingLookup({ navigate }) {
  const [reference, setReference] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const value = reference.trim();
    if (value) navigate(`/tracking?reference=${encodeURIComponent(value)}`);
  }

  return (
    <main className="tracking-layout">
      <span className="eyebrow"><i /> ORDER TRACKING</span>
      <h1 className="tracking-lookup-title">Путь вашего заказа</h1>
      <p className="tracking-lookup-copy">Введите номер заказа, чтобы посмотреть этап доставки.</p>
      <form className="track-search-form" onSubmit={handleSubmit}>
        <input required value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Например, TFA-123456" />
        <button className="button button-lime" type="submit">Показать маршрут<span>↗</span></button>
      </form>
    </main>
  );
}

function TrackingError({ error, navigate }) {
  return (
    <section className="tracking-error">
      <h2>Не удалось найти заказ</h2>
      <p>{error}. Войдите в аккаунт, которым оформляли покупку, и проверьте номер заказа.</p>
      <button className="button button-lime" onClick={() => navigate('/')}>Вернуться в каталог<span>↗</span></button>
    </section>
  );
}

function TrackingMapCard({ order, progress }) {
  return (
    <section className="tracking-map-card">
      <div className="tracking-map-title">
        <div>
          <b>{order.items?.map((item) => item.name).join(', ') || 'Ваш автомобиль'}</b>
          <small>Схема этапа доставки · без GPS</small>
        </div>
        <span>{progress}%</span>
      </div>
      <DeliveryMap progress={progress} />
      <div className="tracking-map-footer">
        <span>⟳ Статус обновляется каждые 30 сек.</span>
        <span>Схематичный маршрут, без GPS</span>
      </div>
    </section>
  );
}

function TrackingProgress({ order, stageIndex }) {
  const stage = ORDER_STAGES[stageIndex];
  const updatedAt = new Date(order.updatedAt || order.createdAt).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <section className="tracking-progress">
      <div className="tracking-progress-title">
        <div>
          <span className="eyebrow"><i /> СТАТУС ДОСТАВКИ</span>
          <h2>{stage.label}</h2>
          <p>{stage.note}</p>
        </div>
        <span className="tracking-updated">Обновлено<br />{updatedAt}</span>
      </div>
      <DeliveryTimeline stages={ORDER_STAGES} currentIndex={stageIndex} />
      <div className="tracking-order-total"><span>Заказ на сумму</span><b>{money(order.total)}</b></div>
      <p className="tracking-demo-note">Статус заказа меняет менеджер. Карта схематичная; GPS водителя не подключён.</p>
    </section>
  );
}

export default function TrackingPage({ reference, order, error, navigate }) {
  const stageIndex = Math.max(0, ORDER_STAGES.findIndex((stage) => stage.id === order?.status));
  const progress = Math.max(0, Math.min(100, Number(order?.progress || 0)));

  return (
    <div className="tracking-page">
      <TrackingHeader navigate={navigate} />
      {!reference ? <TrackingLookup navigate={navigate} /> : (
        <main className="tracking-layout">
          <div className="tracking-top">
            <div>
              <span className="eyebrow"><i /> ORDER TRACKING</span>
              <h1>Путь вашего заказа</h1>
              <p>Номер заказа <b>{reference}</b></p>
            </div>
            {order && <div className="tracking-state"><span className="tracking-pulse" />{ORDER_STAGES[stageIndex].label}</div>}
          </div>
          {error ? <TrackingError error={error} navigate={navigate} /> : !order ? (
            <div className="loading-state"><span className="loader" />Загружаем маршрут заказа…</div>
          ) : (
            <>
              <TrackingMapCard order={order} progress={progress} />
              <TrackingProgress order={order} stageIndex={stageIndex} />
            </>
          )}
        </main>
      )}
    </div>
  );
}
