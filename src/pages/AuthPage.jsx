import React, {useEffect,useState} from 'react';
import BrandMark from '../components/BrandMark.jsx';
import PhoneInput from '../components/PhoneInput.jsx';
import LanguageSwitch from '../components/LanguageSwitch.jsx';

const authText = {
  ru: { login: 'Вход в THE FAMILY AUTO', register: 'Создать аккаунт', intro: 'Сохраняйте автомобили, бронируйте просмотр и оформляйте заказы.', name: 'Ваше имя', phone: 'Номер телефона', email: 'Электронная почта', password: 'Пароль', submitLogin: 'Войти', submitRegister: 'Зарегистрироваться', switchLogin: 'Уже есть аккаунт? Войти', switchRegister: 'Нет аккаунта? Зарегистрироваться', error: 'Не удалось выполнить вход', back: '← Вернуться в автосалон', social: 'Или войдите через', terms: 'Я принимаю условия использования и политику конфиденциальности', note: 'Вход по SMS и Telegram ещё не подключён. Номер сохранится для связи по заказу. Google/GitHub требуют настройки ключей.' },
  kg: { login: 'THE FAMILY AUTO аккаунты', register: 'Аккаунт түзүү', intro: 'Унааларды сактап, көрүүгө жазылып, буйрутма бериңиз.', name: 'Атыңыз', phone: 'Телефон номери', email: 'Электрондук почта', password: 'Сырсөз', submitLogin: 'Кирүү', submitRegister: 'Катталуу', switchLogin: 'Аккаунтуңуз барбы? Кириңиз', switchRegister: 'Аккаунт жокпу? Катталыңыз', error: 'Кирүү ишке ашкан жок', back: '← Автосалонго кайтуу', social: 'Же бул аркылуу кириңиз', terms: 'Колдонуу шарттарын жана купуялык саясатын кабыл алам', note: 'SMS жана Telegram аркылуу кирүү азырынча туташтырыла элек. Телефон буйрутма боюнча байланыш үчүн сакталат.' },
  en: { login: 'Sign in to THE FAMILY AUTO', register: 'Create an account', intro: 'Save cars, book a viewing and place orders.', name: 'Your name', phone: 'Phone number', email: 'Email address', password: 'Password', submitLogin: 'Sign in', submitRegister: 'Create account', switchLogin: 'Already registered? Sign in', switchRegister: 'New here? Create an account', error: 'Could not sign in', back: '← Back to the showroom', social: 'Or continue with', terms: 'I accept the terms of use and privacy policy', note: 'SMS and Telegram sign-in are not connected yet. Your phone number is saved for order contact.' },
};

const resetText={
 ru:{title:'Восстановление пароля',intro:'Укажите почту вашего аккаунта. Мы отправим шестизначный код для создания нового пароля.',step1:'Шаг 1 из 2 · Электронная почта',step2:'Шаг 2 из 2 · Проверка кода',code:'Код из письма',password:'Новый пароль',confirm:'Повторите новый пароль',send:'Отправить код',save:'Сохранить пароль',resend:'Отправить код ещё раз',change:'Изменить email',wait:'Повторная отправка через',seconds:'с',hint:'Код действует 15 минут. Проверьте также папку «Спам».',sent:'Если аккаунт с такой почтой существует, код отправлен. Введите его ниже.',success:'Пароль изменён. Войдите с новым паролем.',forgot:'Забыли пароль?',help:'Помощь со входом',mismatch:'Пароли не совпадают.',notConfigured:'Восстановление по почте пока недоступно. Попробуйте позже или обратитесь за помощью.',invalid:'Код неверный или срок его действия истёк. Проверьте код или запросите новый.',blocked:'Слишком много попыток. Запросите новый код.',sendError:'Не удалось отправить письмо. Попробуйте ещё раз позже.'},
 kg:{title:'Сырсөздү калыбына келтирүү',intro:'Аккаунтуңуздун почтасын жазыңыз. Жаңы сырсөз түзүү үчүн алты орундуу код жөнөтөбүз.',step1:'1-кадам · Электрондук почта',step2:'2-кадам · Кодду текшерүү',code:'Каттагы код',password:'Жаңы сырсөз',confirm:'Жаңы сырсөздү кайталаңыз',send:'Код жөнөтүү',save:'Сырсөздү сактоо',resend:'Кодду кайра жөнөтүү',change:'Почтаны өзгөртүү',wait:'Кайра жөнөтүүгө чейин',seconds:'сек',hint:'Код 15 мүнөт жарактуу. «Спам» папкасын да текшериңиз.',sent:'Ушул почта менен аккаунт бар болсо, код жөнөтүлдү. Төмөндө кодду жазыңыз.',success:'Сырсөз өзгөртүлдү. Жаңы сырсөз менен кириңиз.',forgot:'Сырсөздү унуттуңузбу?',help:'Кирүү боюнча жардам',mismatch:'Сырсөздөр дал келбейт.',notConfigured:'Почта аркылуу калыбына келтирүү азырынча жеткиликсиз. Кийинчерээк аракет кылыңыз же жардам сураңыз.',invalid:'Код туура эмес же мөөнөтү бүттү. Кодду текшериңиз же жаңысын сураңыз.',blocked:'Аракеттер өтө көп. Жаңы код сураңыз.',sendError:'Кат жөнөтүлгөн жок. Кийинчерээк кайра аракет кылыңыз.'},
 en:{title:'Reset your password',intro:'Enter your account email. We will send a six-digit code to create a new password.',step1:'Step 1 of 2 · Email',step2:'Step 2 of 2 · Verify code',code:'Email verification code',password:'New password',confirm:'Confirm new password',send:'Send code',save:'Save password',resend:'Resend code',change:'Change email',wait:'Resend available in',seconds:'s',hint:'Your code expires in 15 minutes. Please also check your spam folder.',sent:'If an account exists with this email, a code has been sent. Enter it below.',success:'Your password has been changed. Sign in with your new password.',forgot:'Forgot password?',help:'Help signing in',mismatch:'Passwords do not match.',notConfigured:'Email recovery is not available yet. Please try again later or contact us for help.',invalid:'The code is incorrect or expired. Check it or request a new one.',blocked:'Too many attempts. Request a new code.',sendError:'The email could not be sent. Please try again later.'},
};

export default function AuthPage({mode='login',lang='ru',onLanguageChange,onAuth,onNavigate}) {
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [forgot,setForgot]=useState(false),[sent,setSent]=useState(false),[email,setEmail]=useState(''),[code,setCode]=useState('');
 const [until,setUntil]=useState(0),[remaining,setRemaining]=useState(0);
 const t=authText[lang]||authText.ru,r=resetText[lang]||resetText.ru,isRegister=mode==='register';
 const providers=['google','github'].filter(provider=>(provider==='google'?import.meta.env.VITE_GOOGLE_OAUTH_ENABLED:import.meta.env.VITE_GITHUB_OAUTH_ENABLED)==='true');
 useEffect(()=>{if(!until){setRemaining(0);return;}const tick=()=>setRemaining(Math.max(0,Math.ceil((until-Date.now())/1000)));tick();const timer=setInterval(tick,1000);return()=>clearInterval(timer);},[until]);
 const resetError=result=>({MAIL_NOT_CONFIGURED:'notConfigured',RESET_INVALID:'invalid',RESET_BLOCKED:'blocked',MAIL_SEND_FAILED:'sendError'}[result.code]||'sendError');
 const sendCode=async()=>{
  const response=await fetch('/api/auth/reset/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email.trim().toLowerCase(),lang})});
  const result=await response.json();if(!response.ok){const error=new Error(result.error||r.sendError);error.resetKey=resetError(result);throw error;}
  setEmail(email.trim().toLowerCase());setSent(true);setCode('');setNotice('sent');setUntil(Date.now()+(result.retryAfter||60)*1000);
 };
 const submit=async event=>{
  event.preventDefault();if(busy)return;const form=new FormData(event.currentTarget);setError('');setNotice('');
  if(forgot&&sent&&form.get('password')!==form.get('confirmPassword')){setError('mismatch');return;}
  setBusy(true);
  try{
   if(forgot){
    if(!sent){await sendCode();return;}
    const response=await fetch('/api/auth/reset/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,code,password:form.get('password')})});
    const result=await response.json();if(!response.ok){setError(result.code==='RESET_BLOCKED'?'blocked':'invalid');return;}
    localStorage.removeItem('tfa-token');setForgot(false);setSent(false);setCode('');setUntil(0);setNotice('success');return;
   }
   const payload={...Object.fromEntries(form),email:email.trim().toLowerCase(),mode:isRegister?'register':'login',terms:form.get('terms')||''};
   const response=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok)throw new Error(result.error||t.error);onAuth(result);
  }catch(e){setError(e.resetKey||e.message||t.error);}finally{setBusy(false);}
 };
 return <main className="auth-page"><div className="auth-toolbar"><a className="auth-back" href="/" onClick={event=>{event.preventDefault();onNavigate('/');}}>{t.back}</a><LanguageSwitch lang={lang} onChange={onLanguageChange}/></div>
  <section className="auth-panel"><div className="auth-box">
   <a className="auth-brand" href="/" onClick={event=>{event.preventDefault();onNavigate('/');}}><BrandMark/><span>THE FAMILY <b>AUTO</b><small>PREMIUM AUTOMOBILES · BISHKEK</small></span></a>
   {forgot&&<span className="reset-step">{sent?r.step2:r.step1}</span>}
   <h1>{forgot?r.title:isRegister?t.register:t.login}</h1><p className="reset-intro">{forgot?r.intro:t.intro}</p>
   {!forgot&&providers.length>0&&<><div className="auth-providers">{providers.map(provider=><button key={provider} type="button" onClick={()=>{location.href='/api/oauth/'+provider;}} disabled={busy}>{provider==='google'?'Google':'GitHub'}</button>)}</div><div className="auth-divider"><span/>{t.social}<span/></div></>}
   <form className="auth-form" onSubmit={submit}><fieldset disabled={busy}>
    {!forgot&&isRegister&&<label>{t.name}<input name="name" required autoComplete="name"/></label>}
    {!forgot&&isRegister&&<label>{t.phone}<PhoneInput/></label>}
    <label>{t.email}<input name="email" type="email" required value={email} onChange={event=>setEmail(event.target.value)} autoComplete="email" readOnly={forgot&&sent} placeholder="name@example.com"/></label>
    {forgot&&sent&&<><label>{r.code}<input className="reset-code" name="code" value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" pattern="[0-9]{6}" minLength="6" maxLength="6" required autoComplete="one-time-code" autoFocus placeholder="000000"/></label><p className="reset-hint">{r.hint}</p></>}
    {(!forgot||sent)&&<label>{forgot?r.password:t.password}<input key={forgot?'reset-password':mode} name="password" type="password" required minLength="8" autoComplete={isRegister||forgot?'new-password':'current-password'} placeholder="••••••••"/></label>}
    {forgot&&sent&&<label>{r.confirm}<input name="confirmPassword" type="password" required minLength="8" autoComplete="new-password" placeholder="••••••••"/></label>}
    {!forgot&&isRegister&&<label className="auth-terms"><input name="terms" type="checkbox" required value="on"/><span>{t.terms}</span></label>}
    {error&&<div className="auth-error" role="alert">{r[error]||error}</div>}
    {notice&&<div className="auth-success" role="status">{r[notice]}</div>}
    <button className="button button-lime auth-submit" type="submit" disabled={busy}>{busy?'…':forgot?sent?r.save:r.send:isRegister?t.submitRegister:t.submitLogin}</button>
    {forgot&&sent&&<div className="reset-actions"><button type="button" disabled={remaining>0||busy} onClick={async()=>{if(busy||remaining>0)return;setBusy(true);setError('');try{await sendCode();}catch(e){setError(e.resetKey||'sendError');}finally{setBusy(false);}}}>{remaining>0?r.wait+' '+remaining+' '+r.seconds:r.resend}</button><button type="button" onClick={()=>{setSent(false);setNotice('');setError('');setCode('');}}>{r.change}</button></div>}
   </fieldset></form>
   {!forgot&&<button type="button" className="auth-switch" onClick={()=>{setForgot(true);setError('');setNotice('');}}>{r.forgot}</button>}
   {forgot&&<button type="button" className="auth-switch" onClick={()=>{setForgot(false);setSent(false);setError('');setNotice('');}}>← {t.submitLogin}</button>}
   {!forgot&&<button type="button" className="auth-switch" onClick={()=>onNavigate((isRegister?'/login':'/register')+location.search)}>{isRegister?t.switchLogin:t.switchRegister}</button>}
   {forgot&&<a className="auth-help" href="https://api.whatsapp.com/send?phone=996999425453" target="_blank" rel="noreferrer">{r.help}</a>}
  </div></section></main>;
}
