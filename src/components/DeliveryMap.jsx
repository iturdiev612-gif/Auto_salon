const routePoints = [[55, 285], [135, 250], [215, 265], [292, 195], [365, 211], [442, 135], [545, 75]];
const routePath = 'M55 285 135 250 215 265 292 195 365 211 442 135 545 75';

function getMarkerPosition(progress) {
  const position = (progress / 100) * (routePoints.length - 1);
  const segment = Math.min(routePoints.length - 2, Math.floor(position));
  const blend = position - segment;
  const [x1, y1] = routePoints[segment];
  const [x2, y2] = routePoints[segment + 1];

  return { x: x1 + (x2 - x1) * blend, y: y1 + (y2 - y1) * blend };
}

export default function DeliveryMap({ progress }) {
  const marker = getMarkerPosition(progress);

  return (
    <div className="tracking-map">
      <svg viewBox="0 0 600 360" role="img" aria-label="Схема этапа доставки по Бишкеку" preserveAspectRatio="xMidYMid slice">
        <rect width="600" height="360" rx="12" fill="#e9eee5" />
        <path className="map-park" d="M0 0h160l-22 68 50 42-45 60-68-18L0 178zm440 190 160-42v212H410l8-76-42-35zM239 0h116l-22 66-89-8z" />
        <path className="map-road" d="M-20 105 620 285M-20 315 610 35M80-20l180 410M350-20l-60 410M520-20 380 380M-20 205 620 145M170-20 0 360M440-20 600 340" />
        <path className="map-route-bg" d={routePath} />
        <path className="map-route-progress" pathLength="100" strokeDasharray={`${progress} 100`} d={routePath} />
        <circle cx="55" cy="285" r="9" className="map-start" />
        <circle cx="545" cy="75" r="11" className="map-destination" />
        <circle cx={marker.x} cy={marker.y} r="17" className="map-car-halo" />
        <text x={marker.x} y={marker.y + 6} textAnchor="middle" className="map-car-icon">🚘</text>
      </svg>
      <span className="map-label map-label-start">Автосалон</span>
      <span className="map-label map-label-end">Вы</span>
    </div>
  );
}
