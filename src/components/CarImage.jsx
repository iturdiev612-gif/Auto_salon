import { useState } from 'react';
export default function CarImage({ src, alt = '', ...props }) {
  const [failed, setFailed] = useState(false);
  return <img {...props} src={failed ? '/cars/unavailable.svg' : src} alt={alt} onError={() => setFailed(true)} />;
}
