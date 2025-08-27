"use client";

export default function Navbar() {
  return (
   <nav className="navbar navbar-dark navbar-expand-lg">
  <div className="container"><a className="navbar-brand" href="/"><i className="fa fa-spinner fa-spin page-loading-icon"></i><img src="/../img/gob-header.svg"/></a>
    <button className="navbar-toggler collapsed" type="button" data-toggle="collapse" data-target="#navbarDarkExampleCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation"><span className="navbar-toggler-icon"></span></button>
    <div className="navbar-collapse collapse" id="navbarDarkExampleCollapse">
      <ul className="navbar-nav ml-auto">
        <li className="nav-item"><a className="nav-link contingency-behavior-open" href="#">¿Contingencia?</a></li>
        <li className="nav-item"><a className="nav-link redirecting-behavior-link" href="https://www.chileatiende.gob.cl/" data-target="#to-chile-atiende" data-timeout="5000">Chile Atiende</a></li>
        <li className="nav-item"><a className="nav-link" href="#">Link</a></li>
        <li className="nav-item"><a className="nav-link" href="#">Link</a></li>
        <li className="nav-item"><a className="btn btn-block btn-primary" href="#">Iniciar sesión</a></li>
        <li className="nav-behavior"><a className="nav-link text-uppercase text-underline" href="#">en</a></li>
        <li className="nav-separator"></li>
        <li className="nav-behavior"><a className="nav-link" href="#"><i className="cl cl-login"></i></a></li>
      </ul>
    </div>
  </div>
</nav>
  );
}