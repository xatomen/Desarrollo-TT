export default function Footer() {
  return (
    <footer className="content-always-on-display">
        <div className="container">
          <div className="line"></div>
          <div className="row">
            <div className="col-md-3 a11y-fonts-col-12"><img className="mw-100 mb-3" src="/../img/favicon/ms-icon-150x150.png"/>
              <p>La alternativa para digitalizar los trámites de la ciudadanía.</p>
              <p>Esta plataforma es administrada:</p><img className="mw-100 mb-3" src="/../img/gob-footer.svg"/><a className="py-0" href="www.digital.gob.cl">www.digital.gob.cl</a>
            </div>
            <div className="col-md-3 a11y-fonts-col-12">
              <div className="text-uppercase mb-3">Secciones</div><a href="#">Conjuntos de Datos</a><a href="#">Organizaciones</a><a href="#">Categorías</a><a href="#">Documentos</a><a href="#">Ayuda</a><a href="#">Iniciativas Destacadas</a>
            </div>
            <div className="col-md-3 a11y-fonts-col-12">
              <div className="text-uppercase mb-3">Enlaces internos</div><a href="#">Políticas de Privacidad</a><a href="#">Normativas</a><a href="#">Términos y Condiciones</a><a href="#">Sitios relacinados</a><a href="#">Licenciamiento</a><a href="#">Notificar error</a>
            </div>
            <div className="col-md-3 a11y-fonts-col-12">
              <div className="text-uppercase mb-3">Ayuda institucional</div><a href="#">Ingreso de solicitud de ayuda</a><b className="d-block mt-3">Mesa de Ayuda</b>
              <p className="mb-0">
                Horario Lu - Vi / 9:00hrs -
                18:00hrs
              </p><a className="py-0" href="tel:6003970000">600 397 0000</a>
            </div>
          </div>
        </div>
      </footer>
  );
}
