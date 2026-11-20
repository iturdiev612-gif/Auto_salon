import React, { useState } from 'react';

function digitsFrom(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('996')) digits = digits.slice(3);
  if (digits.length > 9 && digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 9);
}

function formatLocal(digits) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean).join(' ');
}

export default function PhoneInput({ name = 'phone', required = true, id }) {
  const [digits, setDigits] = useState('');
  const inputId = id || `${name}-local-number`;
  return <>
    <div className="phone-control">
      <span className="phone-prefix"><small>KG</small><b>+996</b></span>
      <input
        id={inputId}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={formatLocal(digits)}
        onChange={event => setDigits(digitsFrom(event.target.value))}
        placeholder="700 123 456"
        pattern="[0-9]{3} [0-9]{3} [0-9]{3}"
        title="Введите 9 цифр номера после кода +996"
        required={required}
        aria-label="Номер телефона после кода +996"
      />
    </div>
    <input type="hidden" name={name} value={`+996${digits}`} />
  </>;
}
