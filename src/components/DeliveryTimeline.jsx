export default function DeliveryTimeline({ stages, currentIndex }) {
  return (
    <div className="tracking-timeline">
      {stages.map((stage, index) => (
        <div
          className={`tracking-step ${index < currentIndex ? 'done' : ''} ${index === currentIndex ? 'current' : ''}`}
          key={stage.id}
        >
          <span className="tracking-step-dot">
            {index < currentIndex ? '✓' : String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <b>{stage.label}</b>
            <small>{stage.note}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
