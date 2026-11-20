export async function api(path, options = {}) {
  const token = localStorage.getItem('tfa-token');
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Сервер ${path} вернул не JSON. Проверьте настройки API в Vercel.`);
  }
  if (!response.ok) throw new Error(data.error || 'Не удалось выполнить запрос');
  return data;
}
