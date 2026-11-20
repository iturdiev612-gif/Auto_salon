import React,{useEffect,useRef,useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerUrl from 'leaflet/dist/images/marker-icon.png';
import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import {demoLocations} from '../data/marketplace.js';

const key=import.meta.env.VITE_2GIS_API_KEY||'';
const icon=L.icon({iconUrl:markerUrl,iconRetinaUrl:markerRetinaUrl,shadowUrl,iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]});
export default function LocationMapCanvas({lang,selected}) {
 const container=useRef(null),map=useRef(null),markers=useRef(new Map());
 const [fallback,setFallback]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{
  if(!container.current)return;
  const view=L.map(container.current,{scrollWheelZoom:false}).setView([42.877,74.584],11);map.current=view;
  let layer,disposed=false,loaded=false,timer;
  const addOsm=()=>{
   layer=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'});
   layer.on('tileload',()=>{loaded=true;if(!disposed)setFailed(false);});layer.on('tileerror',()=>{if(!loaded&&!disposed)setFailed(true);});layer.addTo(view);
  };
  if(key){
   layer=L.tileLayer('https://tile0.maps.2gis.com/v2/tiles/online_sd/{z}/{x}/{y}.png?key='+encodeURIComponent(key),{maxZoom:18,attribution:'&copy; <a href="https://2gis.kg/bishkek" target="_blank" rel="noreferrer">2ГИС</a>'});
   const useFallback=()=>{if(disposed||loaded)return;layer.off();layer.remove();setFallback(true);addOsm();};
   layer.on('tileload',()=>{loaded=true;clearTimeout(timer);});layer.once('tileerror',useFallback);layer.addTo(view);timer=setTimeout(useFallback,10000);
  }else addOsm();
  demoLocations.forEach(point=>{const popup=document.createElement('div'),title=document.createElement('strong'),note=document.createElement('p');title.textContent=point[lang]||point.ru;note.textContent=lang==='en'?'Example location — not an operating showroom.':lang==='kg'?'Демонстрациялык жер.':'Демонстрационная точка, не действующий автосалон.';popup.append(title,note);const marker=L.marker([point.lat,point.lng],{icon,title:point[lang]||point.ru,alt:point[lang]||point.ru}).bindPopup(popup).addTo(view);markers.current.set(point.id,marker);});
  const observer=new ResizeObserver(()=>view.invalidateSize());observer.observe(container.current);
  return()=>{disposed=true;clearTimeout(timer);observer.disconnect();markers.current.clear();view.remove();map.current=null;};
 },[lang]);
 useEffect(()=>{const point=demoLocations.find(p=>p.id===selected);if(!point||!map.current)return;map.current.setView([point.lat,point.lng],13,{animate:false});markers.current.get(selected)?.openPopup();},[selected,lang]);
 return <><div className="location-map-canvas" ref={container} role="region" aria-label={lang==='en'?'Interactive map of Bishkek':lang==='kg'?'Бишкектин интерактивдүү картасы':'Интерактивная карта Бишкека'}/>{(fallback||failed)&&<p className="map-connection-note" role="status">{failed?(lang==='en'?'The map is unavailable. Use the 2GIS link.':lang==='kg'?'Карта жеткиликсиз. 2ГИС шилтемесин колдонуңуз.':'Карта недоступна. Откройте её по ссылке 2ГИС.'):(lang==='en'?'A backup map is displayed.':lang==='kg'?'Кошумча карта көрсөтүлдү.':'Показана резервная карта.')}</p>}</>;
}
