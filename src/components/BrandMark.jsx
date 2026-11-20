import React from 'react';

export default function BrandMark() {
  return <span className="brand-symbol" aria-hidden="true">
    <svg viewBox="0 0 96 96" focusable="false">
      <path className="brand-mark-roof" d="M12 40 48 12l36 28v39a5 5 0 0 1-5 5H17a5 5 0 0 1-5-5V40Z"/>
      <path className="brand-mark-door" d="m24 45 24-19 24 19v29H24V45Z"/>
      <path className="brand-mark-car" d="m32 62 6-10h20l8 10v8H32v-8Z"/>
      <path className="brand-mark-window" d="M42 55h14l5 7H38l4-7Z"/>
      <circle className="brand-mark-wheel" cx="40" cy="71" r="4"/>
      <circle className="brand-mark-wheel" cx="59" cy="71" r="4"/>
      <path className="brand-mark-ground" d="M15 83h66"/>
    </svg>
  </span>;
}
