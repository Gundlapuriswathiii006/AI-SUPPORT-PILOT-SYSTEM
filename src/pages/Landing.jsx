import { Link } from 'react-router-dom';


const LandingPage = () => {
  return (
    <div className="sp-landing">
      <nav className="sp-landing-nav d-flex align-items-center justify-content-between px-4 py-3">
        <span className="sp-sidebar-kicker fs-4">SupportPilot</span>
        <div className="d-flex gap-2 align-items-center">
         
          <Link to="/login" className="btn btn-outline-info">Login</Link>
          <Link to="/register" className="btn btn-info">Get Started</Link>
        </div>
      </nav>

      <header className="sp-landing-hero text-center px-4 py-5">
        <span className="badge text-bg-info mb-3">AI-Powered Support Desk</span>
        <h1 className="sp-hero-title mb-3">Ticket management that thinks ahead.</h1>
        <p className="sp-hero-copy mx-auto" style={{ maxWidth: '640px' }}>
          SupportPilot helps employees raise issues, support engineers resolve them faster with
          AI-assisted classification, and admins stay in control with role-based oversight.
        </p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Link to="/register" className="btn btn-info btn-lg fw-semibold">Create an account</Link>
          <Link to="/login" className="btn btn-outline-light btn-lg fw-semibold">I already have one</Link>
        </div>
      </header>

      <section className="sp-landing-features row g-4 px-4 py-5 mx-0">
        <div className="col-md-4">
          <div className="sp-feature-card p-4 h-100">
            <h3 className="sp-section-title">For Employees</h3>
            <p className="sp-page-copy">Raise tickets in seconds and track their status from a single dashboard.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="sp-feature-card p-4 h-100">
            <h3 className="sp-section-title">For Support Engineers</h3>
            <p className="sp-page-copy">AI-assisted classification and knowledge base retrieval speed up resolutions.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="sp-feature-card p-4 h-100">
            <h3 className="sp-section-title">For Admins</h3>
            <p className="sp-page-copy">Role-based access, analytics, and reporting keep the whole operation visible.</p>
          </div>
        </div>
      </section>

      <footer className="text-center py-4">
        <small className="text-secondary">&copy; {new Date().getFullYear()} SupportPilot. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default LandingPage;
