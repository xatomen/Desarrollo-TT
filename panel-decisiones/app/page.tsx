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

      {/* Footer ancho completo */}
      <footer className="bg-dark text-light py-4 mt-auto">
        {/* El color de fondo ocupa todo el ancho;
            el contenido interno se limita con .container */}
        <div className="container">
          <div className="row">
            {/* Secciones */}
            <div className="col-12 col-md-4 mb-4 mb-md-0">
              <h6 className="text-uppercase">Secciones</h6>
              <ul className="list-unstyled mb-0">
                <li><a href="#" className="text-light">Activa</a></li>
                <li><a href="#" className="text-light">Instituciones públicas</a></li>
                <li><a href="#" className="text-light">Términos y condiciones</a></li>
              </ul>
            </div>

            {/* Ayuda a ciudadanos */}
            <div className="col-12 col-md-4 mb-4 mb-md-0">
              <h6 className="text-uppercase">Ayuda a ciudadanos</h6>
              <ul className="list-unstyled mb-0">
                <li><a href="#" className="text-reset">Preguntas frecuentes</a></li>
                <li>Horario: Lu - Vi / 9:00hrs - 18:00hrs</li>
                <li>600 397 0000</li>
              </ul>
            </div>

            {/* Ayuda a instituciones */}
            <div className="col-12 col-md-4">
              <h6 className="text-uppercase">Ayuda a instituciones</h6>
              <ul className="list-unstyled mb-0">
                <li><a href="#" className="text-reset">Ingreso de solicitud de ayuda</a></li>
                <li>Horario: Lu - Vi / 9:00hrs - 18:00hrs</li>
                <li>600 397 0000</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
