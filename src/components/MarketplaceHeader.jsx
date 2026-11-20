import React from 'react';
import BrandMark from './BrandMark.jsx';
import MarketIcon from './MarketIcon.jsx';
import LanguageSwitch from './LanguageSwitch.jsx';

export default function MarketplaceHeader({lang,setLang,dark,setDark,menu,setMenu,user,t,favorites,cart,onModal,navigate,onCategory,onInquiry}) {
  const labels=lang==='en'?['Buy','Rent a car','Find a car','Showrooms','Sell','Customs']:lang==='kg'?['Сатып алуу','Ижара','Унаа издөө','Автосалондор','Сатуу','Бажы']:['Купить','Аренда авто','Ищу авто','Автосалоны','Продать','Растаможка'];
  const links=[{href:'#catalog',action:()=>onCategory('passenger')},{href:'#contact',action:()=>onInquiry(labels[1])},{href:'#contact',action:()=>onInquiry(labels[2])},{href:'#locations'},{href:'#contact',action:()=>onInquiry(labels[4])},{href:'#catalog',action:()=>onCategory('services')}];
  return <header className="market-header">
    <a href="#home" className="brand-logo market-brand"><BrandMark/><span>THE FAMILY <b>AUTO</b><small>PREMIUM AUTOMOBILES</small></span></a>
    <nav className="market-primary" aria-label={lang==='en'?'Main navigation':'Основная навигация'}>{links.map((link,i)=><a key={link.href+i} href={link.href} className={i===3?'market-nav-accent':''} onClick={event=>{setMenu(false);if(link.action){event.preventDefault();link.action();}}}>{labels[i]}</a>)}</nav>
    <div className="market-actions">
      <button type="button" className="market-icon" aria-label={lang==='en'?'Toggle theme':lang==='kg'?'Теманы өзгөртүү':'Сменить тему'} onClick={()=>setDark(!dark)}><MarketIcon name={dark?'sun':'moon'}/></button>
      <LanguageSwitch lang={lang} onChange={setLang}/>
      <button type="button" className="market-icon" aria-label={t.favorite} onClick={()=>onModal('favorites')}><MarketIcon name="heart"/>{favorites>0&&<sup>{favorites}</sup>}</button>
      <button type="button" className="market-icon" aria-label={t.cart} onClick={()=>onModal('cart')}><MarketIcon name="cart"/>{cart>0&&<sup>{cart}</sup>}</button>
      <button type="button" className="market-icon market-account" aria-label={user?.name||t.login} title={user?.name||t.login} onClick={()=>user?onModal(user.role==='admin'?'admin':'account'):navigate('/login')}><MarketIcon name="user"/></button>
      <button type="button" className={`market-burger ${menu?'is-open':''}`} aria-label={menu?'Закрыть меню':'Открыть меню'} aria-controls="market-menu" aria-expanded={menu} onClick={()=>setMenu(!menu)}><i/><i/><i/></button>
    </div>
    {menu&&<><button className="market-backdrop" aria-label="Закрыть меню" onClick={()=>setMenu(false)}/><nav id="market-menu" className="market-menu" aria-label="Меню">
      {links.map((link,i)=><a key={i} href={link.href} onClick={event=>{setMenu(false);if(link.action){event.preventDefault();link.action();}}}>{labels[i]}</a>)}
      {[[t.about,'#story'],[t.reviews,'#reviews'],[t.contact,'#contact']].map(([label,href])=><a key={href} href={href} onClick={()=>setMenu(false)}>{label}</a>)}
      <a href="/booking" onClick={event=>{event.preventDefault();navigate('/booking');}}>{t.book}</a><a href="/tracking" onClick={event=>{event.preventDefault();navigate('/tracking');}}>{lang==='en'?'Track order':lang==='kg'?'Буйрутманы көзөмөлдөө':'Отследить заказ'}</a>
    </nav></>}
  </header>;
}
