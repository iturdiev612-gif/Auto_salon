import React from 'react';

const paths = {
  car: <><path d="m5 10 2-5h10l2 5M3 10h18v8H3zM5 18v3m14-3v3M6 14h2m8 0h2"/></>,
  commercial: <><path d="M2 5h12v12H2zM14 9h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  moto: <><circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-8 5 8H5l4-5h8M14 5h3l2 12M7 8h4"/></>,
  services: <path d="M14 6a5 5 0 0 0-6 6l-6 6a2.8 2.8 0 0 0 4 4l6-6a5 5 0 0 0 6-6l-4 3-3-3 3-4Z"/>,
  parts: <><path d="m10 2-1 3-3 1-3-1-2 4 2 2v3l-2 2 2 4 3-1 3 1 1 3h4l1-3 3-1 3 1 2-4-2-2v-3l2-2-2-4-3 1-3-1-1-3z" transform="translate(0 -1) scale(.96)"/><circle cx="12" cy="12" r="4"/></>,
  heart: <path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-5 5 3 11 8 15 5-4 13-10 8-15Z"/>,
  user: <><circle cx="12" cy="7" r="4"/><path d="M4 22v-3c0-7 16-7 16 0v3"/></>,
  cart: <><path d="M2 3h3l3 13h11l3-10H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></>,
  moon: <path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
};
export default function MarketIcon({name,...props}) { return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]||paths.car}</svg>; }
