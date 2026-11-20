import React from 'react';
import {extraCatalog} from '../data/marketplace.js';
import MarketIcon from './MarketIcon.jsx';
export default function CatalogExtras({category,lang,onInquiry}) {
  return <div className="catalog-extras"><p className="catalog-demo-note">{lang==='en'?'Example catalogue. Availability and price are confirmed on enquiry.':lang==='kg'?'Үлгү каталог. Бар-жогу жана баасы суроо боюнча такталат.':'Пример каталога. Наличие и стоимость уточняются по запросу.'}</p><div className="extras-grid">{extraCatalog[category].map((item,index)=>{const [title,description]=item[lang]||item.ru;return <article className="extra-card" key={index}><MarketIcon name={item.icon} width="32" height="32"/><h3>{title}</h3><p>{description}</p><button type="button" className="outline-button" onClick={()=>onInquiry(title)}>{lang==='en'?'Send enquiry':lang==='kg'?'Суроо жөнөтүү':'Оставить запрос'}</button></article>;})}</div></div>;
}
