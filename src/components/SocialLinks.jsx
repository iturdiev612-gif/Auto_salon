import React,{useState} from 'react';
const socials=[['threads','Threads','VITE_SOCIAL_THREADS'],['tiktok','TikTok','VITE_SOCIAL_TIKTOK'],['facebook','Facebook','VITE_SOCIAL_FACEBOOK'],['instagram','Instagram','VITE_SOCIAL_INSTAGRAM'],['telegram','Telegram','VITE_SOCIAL_TELEGRAM'],['youtube','YouTube KG','VITE_SOCIAL_YOUTUBE_KG'],['youtube','YouTube RU','VITE_SOCIAL_YOUTUBE_RU']];
function SocialIcon({name}) {
 const icons={
  threads:<><path d="M18 8c-1-7-14-7-14 4 0 13 19 11 16 1-2-6-13-3-10 2 3 4 8-2 5-7-1-2-5-2-6 0"/></>,
  tiktok:<path d="M14 3v13a5 5 0 1 1-4-5M14 3c1 4 3 6 7 6V5c-2 0-3-1-3-2Z"/>,
  facebook:<path d="M14 22V12h4l1-4h-5V6c0-2 1-2 5-2V1h-4c-5 0-6 2-6 6v1H6v4h3v10"/>,
  instagram:<><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r=".8" fill="currentColor" stroke="none"/></>,
  telegram:<><path d="m2 10 20-8-4 20-6-7-5 3v-6zM7 12l11-6-6 9"/></>,
  youtube:<><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3Z" fill="currentColor" stroke="none"/></>,
 };
 return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}
export default function SocialLinks({lang}) {
 const [notice,setNotice]=useState('');
 return <div className="social-block"><div className="social-links" aria-label={lang==='en'?'Social media':'Социальные сети'}>{socials.map(([icon,label,key])=>{let href=import.meta.env[key]||'';try{if(new URL(href).protocol!=='https:')href='';}catch{href='';}const content=<><SocialIcon name={icon}/>{label.startsWith('YouTube')&&<small>{label.slice(-2).toLowerCase()}</small>}</>;return href?<a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>{content}</a>:<button key={key} type="button" aria-label={label} title={label} onClick={()=>setNotice(lang==='en'?`${label}: a profile link will be added soon.`:lang==='kg'?`${label}: баракчанын шилтемеси кийин кошулат.`:`${label}: ссылка на страницу появится позже.`)}>{content}</button>;})}</div>{notice&&<p className="social-notice" role="status">{notice}</p>}</div>;
}
