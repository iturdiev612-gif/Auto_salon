import React,{useEffect,useState} from 'react';
export default function GarageEntrance({lang}) {
  const [visible,setVisible]=useState(()=>{try{return !sessionStorage.getItem('tfa-garage-seen')&&!matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}});
  const finish=()=>{setVisible(false);try{sessionStorage.setItem('tfa-garage-seen','1');}catch{}};
  useEffect(()=>{if(!visible)return;const timer=setTimeout(finish,3300);return()=>clearTimeout(timer);},[visible]);
  useEffect(()=>{if(!visible)return;const skip=event=>{if(event.key==='Escape')finish();};window.addEventListener('keydown',skip);return()=>window.removeEventListener('keydown',skip);},[visible]);
  if(!visible)return null;
  return <div className="garage-entrance" role="region" aria-label={lang==='en'?'Welcome to The Family Auto':lang==='kg'?'The Family Auto сайтына кош келиңиз':'Добро пожаловать в The Family Auto'} onAnimationEnd={event=>{if(event.animationName==='garage-exit')finish();}}>
    <div className="garage-frame"><div className="garage-light"/><div className="garage-shutter"><div className="garage-sign"><span>THE FAMILY <b>AUTO</b></span><small>YOUR NEXT JOURNEY STARTS HERE</small></div><div className="garage-handle"/></div><div className="garage-floor"/></div>
    <button type="button" className="garage-skip" onClick={finish}>{lang==='en'?'Skip intro':lang==='kg'?'Өткөрүп жиберүү':'Пропустить заставку'}</button>
  </div>;
}
