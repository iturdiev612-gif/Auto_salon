import React, { useEffect, useRef, useState } from 'react';

const faq = {
  ru: [
    ['Какие автомобили есть в каталоге?', 'В каталоге представлены Toyota, Mercedes-Benz, Honda и Lamborghini. Введите марку или модель в поиск, чтобы быстро найти автомобиль.', ['каталог', 'машин', 'автомобил', 'марка', 'модел']],
    ['Как узнать цену автомобиля?', 'Цена указана в карточке автомобиля. Откройте карточку, чтобы посмотреть характеристики и стоимость.', ['цен', 'стоим']],
    ['Как записаться на тест-драйв?', 'Откройте страницу «Бронирование», выберите автомобиль, укажите телефон, дату и удобный формат встречи. Заявка откроется в WhatsApp.', ['тест', 'драйв', 'брон', 'просмотр', 'встреч']],
    ['Можно проконсультироваться онлайн?', 'Да. В форме бронирования выберите «Онлайн-консультация», оставьте телефон и комментарий.', ['онлайн', 'консультац']],
    ['Как оформить покупку?', 'Добавьте автомобиль в корзину и нажмите «Оформить заказ». Менеджер подтвердит детали.', ['куп', 'покуп', 'заказ', 'оформ']],
    ['Как оплатить заказ?', 'На странице заказа доступны демо-варианты оплаты или оплата менеджеру. Уточните доступный способ у сотрудника салона.', ['оплат', 'stripe', 'post.kg', 'postkg', 'деньг']],
    ['Как отследить заказ?', 'Войдите в свой аккаунт и откройте ссылку отслеживания из заказа. На схеме показан этап доставки; точное GPS-местоположение пока не подключено.', ['отслед', 'маршрут', 'достав', 'где заказ']],
    ['Как создать аккаунт?', 'Нажмите «Войти», затем «Зарегистрироваться». Для аккаунта нужны имя, почта и пароль.', ['регистрац', 'аккаунт', 'войти', 'логин']],
    ['Как связаться с салоном?', 'Позвоните или напишите в WhatsApp: +996 999 42 54 53. Также можно отправить заявку через форму обратной связи.', ['контакт', 'телефон', 'связ', 'whatsapp', 'ватсап']],
    ['Где находится автосалон?', 'Мы находимся в Бишкеке. Точный адрес и время встречи подтвердит менеджер при бронировании.', ['адрес', 'находит', 'бишкек', 'местополож']],
    ['Есть ли гарантия на автомобили?', 'Условия и документы зависят от конкретного автомобиля. Попросите менеджера рассказать о проверке и гарантии до оформления заказа.', ['гарант', 'провер', 'документ']],
    ['Как оставить отзыв?', 'Нажмите «Оставить отзыв» в разделе отзывов, выберите оценку и отправьте комментарий.', ['отзыв', 'рейтинг', 'оцен']],
    ['Как сохранить автомобиль?', 'Нажмите на значок сердца в карточке. Сохранённые автомобили находятся в разделе избранного.', ['избран', 'сердц', 'сохран']],
    ['Как добавить автомобиль в корзину?', 'Нажмите кнопку с плюсом в карточке или «В корзину» в подробном описании автомобиля.', ['корзин', 'добав']],
    ['Как получить помощь с выбором?', 'Расскажите менеджеру о бюджете и предпочтениях по телефону или через WhatsApp: +996 999 42 54 53.', ['помо', 'выбор', 'бюджет', 'совет']],
  ],
  kg: [
    ['Каталогдо кандай унаалар бар?', 'Каталогдо Toyota, Mercedes-Benz, Honda жана Lamborghini бар. Издөө талаасына марканы же моделди жазыңыз.', ['каталог', 'унаа', 'марка', 'модел']],
    ['Унаанын баасын кантип билем?', 'Баасы унаанын карточкасында көрсөтүлгөн. Толук маалымат үчүн карточканы ачыңыз.', ['баа', 'нарк']],
    ['Тест-драйвга кантип жазылам?', 'Брондоо барагынан унааны тандап, телефонуңузду, күндү жана жолугушуу форматын көрсөтүңүз.', ['тест', 'драйв', 'брон', 'көрүү', 'жолуг']],
    ['Онлайн кеңеш алсам болобу?', 'Ооба. Брондоо формасынан «Онлайн кеңеш» дегенди тандап, телефонуңузду калтырыңыз.', ['онлайн', 'кеңеш']],
    ['Унааны кантип сатып алам?', 'Унааны себетке кошуп, буйрутманы ырастагандан кийин менеджер маалыматты тактайт.', ['сатып', 'буйрут', 'заказ']],
    ['Төлөмдү кантип жасайм?', 'Буйрутмада демо төлөм же менеджер аркылуу төлөө көрсөтүлгөн. Жеткиликтүү ыкманы менеджерден тактаңыз.', ['төлө', 'акча', 'stripe']],
    ['Буйрутманы кантип көзөмөлдөйм?', 'Аккаунтуңузга кирип, буйрутмадагы көзөмөл шилтемесин ачыңыз. Азырынча чыныгы GPS жайгашуусу жок.', ['көзөмөл', 'жол', 'жеткир', 'кайда']],
    ['Аккаунтту кантип түзөм?', '«Кирүү» баскычын басып, «Катталууну» тандаңыз. Аты-жөнүңүз, почта жана сырсөз керек.', ['каттал', 'аккаунт', 'кирүү', 'логин']],
    ['Салон менен кантип байланышам?', 'WhatsApp: +996 999 42 54 53. Сайттагы байланыш формасын да колдонсоңуз болот.', ['байланыш', 'телефон', 'whatsapp']],
    ['Салон кайда жайгашкан?', 'Салон Бишкекте. Так даректи жана жолугушуу убактысын менеджер тастыктайт.', ['дарек', 'бишкек', 'кайда']],
    ['Унаага кепилдик барбы?', 'Шарттар унаага жараша айырмаланат. Буйрутмага чейин текшерүү жана кепилдик документтерин менеджерден сураңыз.', ['кепилдик', 'текшер', 'документ']],
    ['Пикирди кантип калтырам?', 'Пикирлер бөлүмүндөгү «Пикир калтыруу» баскычын басып, бааңызды жана комментарийиңизди жөнөтүңүз.', ['пикир', 'баа', 'рейтинг']],
    ['Унааны кантип сактайм?', 'Карточкадагы жүрөк белгисин басыңыз. Сакталган унаалар тандалгандар бөлүмүндө көрүнөт.', ['сакта', 'тандал', 'жүрөк']],
    ['Унааны себетке кантип кошом?', 'Карточкадагы плюс белгисин же толук маалыматтагы «Себетке» баскычын басыңыз.', ['себет', 'кош']],
    ['Унаа тандоого жардам бересизби?', 'Бюджетиңизди жана каалооңузду айтып, WhatsApp аркылуу менеджерге жазыңыз: +996 999 42 54 53.', ['жардам', 'тандоо', 'бюджет']],
  ],
  en: [
    ['What cars are in the catalog?', 'Browse Toyota, Mercedes-Benz, Honda and Lamborghini. Search by make or model to find a car.', ['catalog', 'cars', 'make', 'model']],
    ['How can I check a car price?', 'The price is shown on each car card. Open the card for details and specifications.', ['price', 'cost']],
    ['How do I book a test drive?', 'Open Booking, choose a car, and enter your phone, date and preferred meeting format.', ['test', 'drive', 'book', 'viewing', 'meeting']],
    ['Can I get an online consultation?', 'Yes. Choose Online consultation in the booking form and leave your phone number.', ['online', 'consult']],
    ['How do I buy a car?', 'Add a car to your cart and submit the order. A manager will confirm the details.', ['buy', 'purchase', 'order']],
    ['How can I pay?', 'Demo payment options or payment through a manager are shown at checkout. Ask the manager about available methods.', ['pay', 'payment', 'stripe']],
    ['How do I track an order?', 'Sign in and open the tracking link from your order. The map shows the delivery stage; live GPS is not connected.', ['track', 'route', 'delivery', 'where']],
    ['How do I create an account?', 'Choose Sign in, then Create account. You will need your name, email and password.', ['register', 'account', 'login', 'sign in']],
    ['How do I contact the showroom?', 'Message us on WhatsApp: +996 999 42 54 53, or use the contact form.', ['contact', 'phone', 'whatsapp']],
    ['Where is the showroom?', 'We are in Bishkek. The manager will confirm the exact meeting location.', ['address', 'location', 'bishkek', 'where']],
    ['Do cars include a warranty?', 'Terms depend on the car. Ask the manager about inspection and warranty documents before ordering.', ['warranty', 'inspection', 'documents']],
    ['How do I leave a review?', 'Select Write a review in the reviews section, choose a rating and submit your comment.', ['review', 'rating']],
    ['How do I save a car?', 'Tap the heart on a car card. Saved cars appear in Favorites.', ['favorite', 'save', 'heart']],
    ['How do I add a car to my cart?', 'Tap the plus on the car card or Add to cart in its details.', ['cart', 'add']],
    ['Can you help me choose?', 'Tell our manager your budget and preferences on WhatsApp: +996 999 42 54 53.', ['help', 'choose', 'budget', 'recommend']],
  ],
};

const quickIndex = [2, 4, 6];

export default function ChatBot({ lang = 'ru' }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);
  const questions = faq[lang] || faq.ru;

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, open]);

  const ask = (question, knownIndex = -1) => {
    const normalized = question.toLocaleLowerCase();
    const match = knownIndex >= 0 ? knownIndex : questions.findIndex(item => item[2].some(keyword => normalized.includes(keyword)));
    const fallback = lang === 'kg'
      ? 'Так суроо боюнча менеджер жардам берет. WhatsApp: +996 999 42 54 53.'
      : lang === 'en'
        ? 'A manager can help with that question. WhatsApp: +996 999 42 54 53.'
        : 'По этому вопросу поможет менеджер. Напишите в WhatsApp: +996 999 42 54 53.';
    const answer = match >= 0 ? questions[match][1] : fallback;
    setMessages(previous => [...previous, { from: 'user', text: question }, { from: 'bot', text: answer }]);
    setInput('');
  };

  const title = lang === 'en' ? 'How can I help?' : lang === 'kg' ? 'Кандай жардам керек?' : 'Чем помочь?';

  return <>
    <button className="chat-launcher" aria-label={open ? 'Закрыть чат-помощник' : 'Открыть чат-помощник'} aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? '×' : '✦'}<span>{open ? '' : 'Chat'}</span></button>
    {open && <aside className="chat-panel" aria-label="Чат-помощник">
      <header><span className="chat-avatar">F</span><div><b>The Family Auto</b><small>Помощник автосалона</small></div><button aria-label="Закрыть чат" onClick={() => setOpen(false)}>×</button></header>
      <div className="chat-messages" ref={listRef} aria-live="polite">
        <p className="bot-message">{title}</p>
        {messages.map((message, index) => <p className={message.from === 'user' ? 'user-message' : 'bot-message'} key={`${index}-${message.text}`}>{message.text}</p>)}
      </div>
      <div className="chat-prompts" aria-label="Частые вопросы">
        {questions.map(([question], index) => <button key={question} onClick={() => ask(question, index)}>{question}</button>)}
      </div>
      <form className="chat-input-row" onSubmit={event => { event.preventDefault(); if (input.trim()) ask(input.trim()); }}>
        <input value={input} onChange={event => setInput(event.target.value)} placeholder={lang === 'en' ? 'Ask a question…' : lang === 'kg' ? 'Суроо жазыңыз…' : 'Задайте вопрос…'} aria-label="Ваш вопрос" />
        <button type="submit" disabled={!input.trim()} aria-label="Отправить вопрос">↗</button>
      </form>
      <small className="chat-note">{lang === 'en' ? 'FAQ assistant · Ask about cars, booking or orders' : lang === 'kg' ? 'Көп берилген суроолор · Унаа жана буйрутма' : '15 тем по автомобилям, брони и заказам'}</small>
    </aside>}
  </>;
}
