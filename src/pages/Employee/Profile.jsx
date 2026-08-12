function Profile({ employee }) {
  if (!employee) {
    return (
      <section>
        <h2 className="page-title">Profile</h2>
        <div className="panel">
          <p>No profile loaded yet</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="page-title">Profile</h2>
      <div className="panel profile-grid">
        <div className="profile-item">
          <span>Name</span>
          <strong>{employee.name}</strong>
        </div>
        <div className="profile-item">
          <span>Role</span>
          <strong>{employee.role}</strong>
        </div>
        <div className="profile-item">
          <span>Department</span>
          <strong>{employee.department}</strong>
        </div>
        <div className="profile-item">
          <span>Email</span>
          <strong>{employee.email}</strong>
        </div>
        <div className="profile-item">
          <span>About</span>
          <p>
            This employee portal helps track tickets, create new service requests, and view the ticket lifecycle from
            a single dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Profile;
