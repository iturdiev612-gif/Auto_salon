import { useEffect, useRef, useState } from 'react';

const labels = {
  ru: { interval: 'Смена автомобилей каждые 2 секунды', pause: 'Приостановить слайд-шоу', play: 'Продолжить слайд-шоу' },
  kg: { interval: 'Унаалар ар 2 секунд сайын алмашат', pause: 'Слайд-шоуну токтотуу', play: 'Слайд-шоуну улантуу' },
  en: { interval: 'Cars change every 2 seconds', pause: 'Pause slideshow', play: 'Resume slideshow' },
};

export default function CatalogSlideshow({ page, pageCount, onPageChange, lang = 'ru', disabled = false, children }) {
  const element = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const t = labels[lang] || labels.ru;

  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  const paused = !playing || hovered || focused || !inView || !visible || disabled || pageCount < 2;
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onPageChange(current => current >= pageCount ? 1 : current + 1), 2000);
    return () => clearTimeout(timer);
  }, [paused, page, pageCount, onPageChange]);

  return <div ref={element} className="catalog-slideshow"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={event => setFocused(!event.target.closest('.catalog-playback'))}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onPointerDown={event => { if (event.pointerType === 'touch' && !event.target.closest('.catalog-playback')) setPlaying(false); }}>
    {pageCount > 1 && <div className="catalog-slideshow-controls">
      <span>{t.interval}</span>
      <button type="button" className="catalog-playback" aria-pressed={!playing} onClick={() => setPlaying(value => !value)}>
        <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>{playing ? t.pause : t.play}
      </button>
    </div>}
    {children}
  </div>;
}
