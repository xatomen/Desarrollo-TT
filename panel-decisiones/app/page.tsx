export default function Home() {
  return (
    // Wrapper: hace sticky footer y ocupa alto completo
    <div className="d-flex flex-column min-vh-100">
      {/* Contenido centrado */}
      <main className="container flex-grow-1 d-flex justify-content-center align-items-center">
        <div className="card shadow-sm p-4 mb-5" style={{ maxWidth: "480px", width: "100%" }}>
                  <div className="text-center mb-4">
            <img src="/img/gob-header.svg" alt="Gobierno de Chile" height={70} />
            <h1 className="h4 mt-3 font-weight-bold">Permiso de Circulación</h1>
          </div>

          <form>
            {/* Rut */}
            <div className="form-group">
              <label htmlFor="rut">Ingrese su Rut</label>
              <div className="input-group">
                <input id="rut" name="rut" className="form-control" type="text" placeholder="12.345.678-9" />
                <div className="input-group-append">
                  <span className="input-group-text"><i className="cl cl-user"></i></span>
                </div>
              </div>
              <small className="form-text text-muted">Formato: 12.345.678-9</small>
            </div>

            {/* Clave Única */}
            <div className="form-group">
              <label htmlFor="claveUnica">Ingrese su Clave única</label>
              <div className="input-group">
                <input id="claveUnica" name="claveUnica" className="form-control" type="password" placeholder="Clave Única" />
                <div className="input-group-append">
                  <span className="input-group-text"><i className="cl cl-key"></i></span>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              <i className="cl cl-login mr-2"></i> Iniciar sesión
            </button>
          </form>
        </div>
      </main>
      <footer className="content-always-on-display">
        <div className="container">
          <div className="line"></div>
          <div className="row">
            <div className="col-md-3 a11y-fonts-col-12"><img className="mw-100 mb-3" src="/img/favicon/ms-icon-150x150.png"/>
              <p>La alternativa para digitalizar los trámites de la ciudadanía.</p>
              <p>Esta plataforma es administrada:</p><img className="mw-100 mb-3" src="/img/gob-footer.svg"/><a className="py-0" href="www.digital.gob.cl">www.digital.gob.cl</a>
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
    </div>
  );
}

