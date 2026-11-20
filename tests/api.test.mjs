import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import handler, { setLocalStoreAdapter } from '../api/router.js';
import { seedCars, repairSeedCars, addCatalogSamples } from '../src/data.js';

process.env.ADMIN_EMAIL='owner@example.test';
process.env.ADMIN_BOOTSTRAP_SECRET='test-only-bootstrap-code';
process.env.JWT_SECRET='test-only-secret-at-least-thirty-two-characters';
let store;
function fresh() { store={cars:structuredClone(seedCars),users:[],orders:[],reviews:[]};setLocalStoreAdapter({read:async()=>structuredClone(store),write:async value=>{store=structuredClone(value)}}); }
async function request(path,body,token,method=body?'POST':'GET') {
  const req={url:'/api/'+path,method,body,headers:{host:'localhost',...(token?{authorization:'Bearer '+token}:{})}};
  const res={statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.statusCode=code;return this},json(data){this.data=data;return this},end(){}};
  await handler(req,res);return {status:res.statusCode,data:res.data,headers:res.headers};
}
const customer={mode:'register',name:'Test Customer',email:'customer@example.test',phone:'+996700000001',password:'Test-password-1234',terms:'on',role:'admin'};

test('catalog has 20 cars, five motorcycles, three commercial vehicles, local photos and safe migration',async()=>{
 assert.equal(seedCars.length,28);assert.equal(new Set(seedCars.map(car=>car.name)).size,28);
 const passenger=seedCars.filter(car=>car.category==='passenger');assert.equal(passenger.length,20);
 assert.equal(seedCars.filter(car=>car.category==='moto').length,5);assert.equal(seedCars.filter(car=>car.category==='commercial').length,3);
 for(const brand of new Set(passenger.map(car=>car.brand)))assert.equal(passenger.filter(car=>car.brand===brand).length,5);
 for(const car of seedCars){const bytes=await readFile(new URL('../public'+car.image,import.meta.url));assert.ok(bytes.length>5000,car.name);if(car.category!=='commercial')assert.ok(car.fuel&&car.transmission);assert.equal(car.name,`${car.brand} ${car.model}`);}
 const customStock=[...passenger,{id:21,name:'Owner custom motorcycle',image:'/stock.jpg',price:12345}];
 const migrated=addCatalogSamples(customStock);assert.equal(migrated.length,29);assert.equal(new Set(migrated.map(car=>car.id)).size,29);assert.deepEqual(migrated[20],customStock[20]);assert.deepEqual(addCatalogSamples(migrated),migrated);
 const old={id:1,brand:'Toyota',model:'Camry Comfort',image:'https://images.unsplash.com/old',price:35001,purchaseCost:23000};
 const repaired=repairSeedCars([old])[0];assert.equal(repaired.model,'Camry SE');assert.equal(repaired.price,35001);assert.equal(repaired.purchaseCost,23000);
 const custom={...old,image:'/actual-stock.jpg'};assert.deepEqual(repairSeedCars([custom]),[custom]);
});
test('customer registration, protected owner setup and server-side authorization',async()=>{
 fresh();const customerResult=await request('auth',customer);assert.equal(customerResult.status,200);assert.equal(customerResult.data.user.role,'user');
 assert.equal((await request('admin/orders',null,customerResult.data.token)).status,403);
 assert.equal((await request('auth',{...customer,email:process.env.ADMIN_EMAIL,adminSecret:process.env.ADMIN_BOOTSTRAP_SECRET})).status,403);
 assert.equal((await request('auth/owner/setup',{email:process.env.ADMIN_EMAIL,password:'Owner-password-1234',adminSecret:'wrong'})).status,403);
 assert.equal((await request('auth/owner/setup',{email:process.env.ADMIN_EMAIL,password:'Owner-password-1234',adminSecret:process.env.ADMIN_BOOTSTRAP_SECRET})).status,201);
 assert.equal((await request('auth/owner/setup',{email:process.env.ADMIN_EMAIL,password:'Owner-password-1234',adminSecret:process.env.ADMIN_BOOTSTRAP_SECRET})).status,409);
 const owner=await request('auth',{email:process.env.ADMIN_EMAIL,password:'Owner-password-1234'});assert.equal(owner.data.user.role,'admin');
 assert.equal((await request('admin/orders',null,owner.data.token)).status,200);
});
test('checkout rejects invalid/empty carts and saves a trackable order using server prices',async()=>{
 fresh();const user=(await request('auth',customer)).data;
 const order={name:customer.name,phone:customer.phone,email:customer.email,address:'Test delivery address',items:[1,12],payment:'cash',total:1};
 assert.equal((await request('orders',order)).status,401);
 assert.equal((await request('orders',{...order,items:[]},user.token)).status,400);
 assert.equal((await request('orders',{...order,items:[1,999]},user.token)).status,400);
 assert.equal((await request('orders',{...order,phone:'1'},user.token)).status,400);
 const saved=await request('orders',order,user.token);assert.equal(saved.status,201);assert.equal(saved.data.total,seedCars[0].price+seedCars[11].price);
 const tracked=await request('orders/'+saved.data.reference,null,user.token);assert.equal(tracked.status,200);assert.equal(tracked.data.items.length,2);
 const other=(await request('auth',{...customer,email:'other@example.test'})).data;
 assert.equal((await request('orders/'+saved.data.reference,null,other.token)).status,404);
});
test('new and concurrent reviews preserve previous reviews and are returned without stale cache',async()=>{
 fresh();await request('reviews',{name:'First',text:'First review',rating:5});
 await Promise.all([request('reviews',{name:'Second',text:'Second review',rating:4}),request('reviews',{name:'Third',text:'Third review',rating:5})]);
 const result=await request('reviews');assert.equal(result.data.length,3);assert.equal(new Set(result.data.map(x=>x.id)).size,3);assert.equal(result.headers['Cache-Control'],'no-store');
});
test('email reset sends code, rejects invalid code, changes password and invalidates old sessions',async()=>{
 fresh();const old=(await request('auth',customer)).data;
 process.env.RESEND_API_KEY='test-key';process.env.MAIL_FROM='showroom@example.test';
 const originalFetch=globalThis.fetch;let email;
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');email=JSON.parse(options.body);return {ok:true}};
 try {
  assert.equal((await request('auth/reset/request',{email:customer.email})).status,200);assert.equal(email.to[0],customer.email);
  const code=email.text.match(/\d{6}/)[0];
  assert.equal((await request('auth/reset/confirm',{email:customer.email,code:'invalid',password:'Changed-password-1234'})).status,400);
  assert.equal((await request('auth/reset/confirm',{email:customer.email,code,password:'Changed-password-1234'})).status,200);
  assert.equal((await request('me',null,old.token)).status,401);
  assert.equal((await request('auth',{email:customer.email,password:customer.password})).status,401);
  assert.equal((await request('auth',{email:customer.email,password:'Changed-password-1234'})).status,200);
  assert.equal((await request('auth/reset/confirm',{email:customer.email,code,password:'Another-password-1234'})).status,400);
 } finally {globalThis.fetch=originalFetch;delete process.env.RESEND_API_KEY;delete process.env.MAIL_FROM;}
});
test('Vercel rewritten routes use Redis persistence in production',async()=>{
 const previous=process.env.NODE_ENV;process.env.NODE_ENV='production';
 process.env.TFA_STORE_URL='https://redis.example.test';process.env.TFA_STORE_TOKEN='test-only-token';setLocalStoreAdapter(null);
 const originalFetch=globalThis.fetch;let raw;
 globalThis.fetch=async(url,options)=>{assert.equal(url,process.env.TFA_STORE_URL);const command=JSON.parse(options.body);let result;
  if(command[0]==='GET')result=raw||null;
  else if(command[0]==='SET'){raw=command[2];result='OK'}
  else if(command[0]==='EVAL'){const current=JSON.parse(raw);if(Number(current._revision||0)===Number(command[4])){raw=command[5];result=1}else result=0;}
  else assert.fail('Unknown Redis command');
  return {ok:true,json:async()=>({result})};
 };
 try {
  const catalog=await request('router?path=cars');assert.equal(catalog.status,200);assert.equal(catalog.data.length,28);
  const user=await request('router?path=auth',customer);assert.equal(user.status,200);
  const order=await request('router?path=orders',{items:[1],phone:customer.phone,address:'Test address',payment:'cash'},user.data.token);assert.equal(order.status,201);
  const tracked=await request('router?path=orders/'+order.data.reference,null,user.data.token);assert.equal(tracked.status,200);
  assert.equal(JSON.parse(raw).orders.length,1);
 }finally{globalThis.fetch=originalFetch;process.env.NODE_ENV=previous||'test';delete process.env.TFA_STORE_URL;delete process.env.TFA_STORE_TOKEN;}
});

test('password reset handles missing provider, resend cooldown, expiry, lockout and delivery errors',async()=>{
 fresh();await request('auth',customer);
 const keys=['RESEND_API_KEY','MAIL_FROM','SMTP_HOST','SMTP_FROM','SMTP_USER'];const before=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
 const originalFetch=globalThis.fetch;let deliveries=0;
 try {
  keys.forEach(key=>delete process.env[key]);
  const unavailable=await request('auth/reset/request',{email:customer.email});assert.equal(unavailable.status,503);assert.equal(unavailable.data.code,'MAIL_NOT_CONFIGURED');assert.equal(store.resetTokens.length,0);
  process.env.RESEND_API_KEY='test-key';process.env.MAIL_FROM='showroom@example.test';
  globalThis.fetch=async()=>{deliveries++;return {ok:true}};
  const first=await request('auth/reset/request',{email:customer.email});assert.equal(first.status,200);assert.equal(first.data.retryAfter,60);assert.equal(first.data.expiresIn,900);
  assert.equal((await request('auth/reset/request',{email:customer.email})).status,200);assert.equal(deliveries,1);
  const unknown=await request('auth/reset/request',{email:'unknown@example.test'});assert.deepEqual(unknown.data,first.data);assert.equal(deliveries,1);
  for(let i=0;i<5;i++)assert.equal((await request('auth/reset/confirm',{email:customer.email,code:'999999',password:'Changed-password-1234'})).status,400);
  const blocked=await request('auth/reset/confirm',{email:customer.email,code:'999999',password:'Changed-password-1234'});assert.equal(blocked.data.code,'RESET_BLOCKED');assert.equal(store.resetTokens.length,0);
  await request('auth/reset/request',{email:customer.email});store.resetTokens[0].expiresAt=Date.now()-1;
  assert.equal((await request('auth/reset/confirm',{email:customer.email,code:'999999',password:'Changed-password-1234'})).data.code,'RESET_INVALID');
  store.resetTokens=[];globalThis.fetch=async()=>({ok:false});
  const failed=await request('auth/reset/request',{email:customer.email});assert.equal(failed.status,503);assert.equal(failed.data.code,'MAIL_SEND_FAILED');assert.equal(store.resetTokens.length,0);
 } finally {globalThis.fetch=originalFetch;keys.forEach(key=>{if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key];});}
});

test('SMTP delivers a real reset message to a local test mailbox and confirms its code',async()=>{
 fresh();await request('auth',customer);let message='';const clients=new Set();
 const smtp=createServer(socket=>{clients.add(socket);socket.on('close',()=>clients.delete(socket));socket.setEncoding('utf8');socket.write('220 localhost test SMTP\r\n');let pending='',data=false;
  socket.on('data',chunk=>{pending+=chunk;let end;while((end=pending.indexOf('\r\n'))>=0){const line=pending.slice(0,end);pending=pending.slice(end+2);if(data){if(line==='.'){data=false;socket.write('250 Message accepted\r\n');}else message+=line+'\n';continue;}
   if(/^EHLO|^HELO/.test(line))socket.write('250-localhost\r\n250 AUTH PLAIN\r\n');else if(/^AUTH/.test(line))socket.write('235 Authenticated\r\n');else if(/^DATA/.test(line)){data=true;socket.write('354 End with a dot\r\n');}else if(/^QUIT/.test(line))socket.end('221 Bye\r\n');else socket.write('250 OK\r\n');
  }});
 });
 await new Promise(resolve=>smtp.listen(0,'127.0.0.1',resolve));
 const values={RESEND_API_KEY:'',MAIL_FROM:'',SMTP_HOST:'127.0.0.1',SMTP_PORT:String(smtp.address().port),SMTP_SECURE:'false',SMTP_FROM:'',SMTP_USER:'sender@example.test',SMTP_PASS:'test-only-password'};
 const before=Object.fromEntries(Object.keys(values).map(key=>[key,process.env[key]]));Object.assign(process.env,values);
 try {
  assert.equal((await request('auth/reset/request',{email:customer.email})).status,200);
  assert.match(message,/From: sender@example.test/);assert.match(message,/To: customer@example.test/);
  const [headers,...bodyParts]=message.split('\n\n');
  const rawBody=bodyParts.join('\n\n');
  const text=/Content-Transfer-Encoding: base64/i.test(headers)?Buffer.from(rawBody.replace(/\s/g,''),'base64').toString('utf8'):rawBody.replace(/=\n/g,'').replace(/=([0-9A-F]{2})/g,(_,hex)=>String.fromCharCode(parseInt(hex,16)));
  const code=text.match(/\b\d{6}\b/)?.[0];assert.ok(code,'message contains a six-digit code');
  assert.equal((await request('auth/reset/confirm',{email:customer.email,code,password:'SMTP-changed-password-1234'})).status,200);
 } finally {Object.keys(values).forEach(key=>{if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key];});for(const socket of clients)socket.destroy();await new Promise(resolve=>smtp.close(resolve));}
});

test('sample migration preserves owner edits and deleted motorcycles are not recreated after saving',async()=>{
 fresh();store.cars=structuredClone(seedCars.slice(0,20));store.cars[0].price=1;
 const first=await request('cars');assert.equal(first.data.length,28);assert.equal(first.data[0].price,1);
 await request('reviews',{name:'Test',text:'Persists catalogue migration',rating:5});assert.equal(store._catalogAdditionsVersion,3);
 store.cars=store.cars.filter(car=>car.id!==21);assert.equal((await request('cars')).data.length,27);
});
