export function EventRibbon() {
  return (
    <div className="event-ribbon" aria-label="Información de los servicios">
      <div className="event-ribbon-track">
        <div className="event-ribbon-group">
          <span>Eventos en Miami</span><i />
          <span>Bartender &amp; Waiter</span><i />
          <span>Reserva con 2 semanas de anticipación</span><i />
          <span>Cumpleaños · Bodas · Graduaciones · Reuniones</span><i />
        </div>
        <div className="event-ribbon-group" aria-hidden="true">
          <span>Eventos en Miami</span><i />
          <span>Bartender &amp; Waiter</span><i />
          <span>Reserva con 2 semanas de anticipación</span><i />
          <span>Cumpleaños · Bodas · Graduaciones · Reuniones</span><i />
        </div>
      </div>
    </div>
  );
}
