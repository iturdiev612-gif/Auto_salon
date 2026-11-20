export const ORDER_STAGES = [
  { id: 'confirmed', label: 'Заказ подтверждён', note: 'Заказ принят и передан менеджеру', progress: 0 },
  { id: 'preparing', label: 'Готовится к отправке', note: 'Проверяем автомобиль и готовим документы', progress: 20 },
  { id: 'on_the_way', label: 'Выехал из салона', note: 'Автомобиль отправился по маршруту к вам', progress: 55 },
  { id: 'nearby', label: 'Уже рядом', note: 'Водитель скоро будет у вас', progress: 85 },
  { id: 'delivered', label: 'Доставлен', note: 'Автомобиль передан покупателю', progress: 100 },
];

export const ORDER_STAGE_PROGRESS = Object.freeze(
  Object.fromEntries(ORDER_STAGES.map(({ id, progress }) => [id, progress])),
);

export const ORDER_STAGE_LABELS = Object.freeze(
  Object.fromEntries(ORDER_STAGES.map(({ id, label }) => [id, label])),
);
