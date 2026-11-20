import PageHeader from '../components/PageHeader.jsx';
import PhoneInput from '../components/PhoneInput.jsx';

function BookingForm({ cars, initialCarId, submitRequest, bookSuccess }) {
  return (
    <form className="booking-page-form" onSubmit={(event) => submitRequest(event, '/api/bookings', bookSuccess)}>
      <label>Ваше имя<input required name="name" autoComplete="name" placeholder="Как к вам обращаться?" /></label>
      <label>Телефон<PhoneInput /></label>
      <label>Автомобиль
        <select required name="carId" defaultValue={initialCarId}>
          <option value="" disabled>Выберите автомобиль</option>
          {cars.map((car) => <option key={car.id} value={car.id}>{car.name}</option>)}
        </select>
      </label>
      <label>Способ бронирования
        <select name="method" defaultValue="personal">
          <option value="personal">Личная встреча</option>
          <option value="test-drive">Записаться на тест-драйв</option>
          <option value="online">Онлайн-консультация</option>
        </select>
      </label>
      <label className="booking-comment">Комментарий<textarea name="comment" placeholder="Удобное время, вопросы, пожелания…" rows="3" /></label>
      <button className="booking-submit" type="submit">Отправить заявку в WhatsApp <span>↗</span></button>
      <small className="booking-consent">Нажимая кнопку, вы откроете WhatsApp с заполненным сообщением. Отправку сообщения нужно подтвердить в WhatsApp.</small>
    </form>
  );
}

export default function BookingPage({ navigate, cars, bookingCarId, submitRequest, bookSuccess }) {
  return (
    <div className="booking-page">
      <PageHeader navigate={navigate} backLabel="← В каталог" />
      <main className="booking-layout">
        <div className="booking-intro">
          <span className="booking-kicker">ВАШ СЛЕДУЮЩИЙ ШАГ</span>
          <h1>Забронируйте <em>автомобиль.</em></h1>
          <p>Выберите модель и удобный способ связи. После отправки откроется WhatsApp с готовой заявкой.</p>
        </div>
        <BookingForm cars={cars} initialCarId={bookingCarId} submitRequest={submitRequest} bookSuccess={bookSuccess} />
      </main>
    </div>
  );
}
