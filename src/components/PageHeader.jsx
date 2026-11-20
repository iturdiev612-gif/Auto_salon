import BrandMark from './BrandMark.jsx';

export default function PageHeader({ navigate, backLabel }) {
  return (
    <header className="order-header">
      <a href="/" className="brand-logo" onClick={(event) => { event.preventDefault(); navigate('/'); }}>
        <BrandMark />
        <span>THE FAMILY <b>AUTO</b><small>PREMIUM AUTOMOBILES</small></span>
      </a>
      <button className="text-action" onClick={() => navigate('/')}>{backLabel}</button>
    </header>
  );
}
