import React from 'react';
export default function LanguageSwitch({lang,onChange}) {
  return <div className="language-switch" role="group" aria-label={lang==='kg'?'Тилди тандоо':lang==='en'?'Choose language':'Выбор языка'}>
    {[['ru','Рус'],['kg','Кыр'],['en','Eng']].map(([value,label])=><button key={value} type="button" lang={value==='kg'?'ky':value} aria-pressed={lang===value} onClick={()=>onChange(value)}>{label}</button>)}
  </div>;
}
