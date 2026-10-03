import { useMemo, useRef, useState } from 'react';

const defaultAdmin = {
  id: 'admin-1',
  name: 'Makerspace Admin',
  email: 'admin@dnhs.com',
  studentId: 'ADMIN-001',
  password: 'admin123',
  role: 'admin',
};

const seedRequests = [
  {
    id: 1,
    title: 'Custom Keychain.stl',
    status: 'Queued',
    date: 'Oct 2',
    material: 'PLA',
    ownerEmail: 'alex@dnhs.com',
    studentName: 'Alex Johnson',
    studentId: '21047',
  },
  {
    id: 2,
    title: 'Desk Organizer.3mf',
    status: 'Printing',
    date: 'Oct 1',
    material: 'PETG',
    ownerEmail: 'sam@dnhs.com',
    studentName: 'Sam Lee',
    studentId: '20612',
  },
  {
    id: 3,
    title: 'Phone Stand.stl',
    status: 'Completed',
    date: 'Sep 28',
    material: 'PLA',
    ownerEmail: 'maya@dnhs.com',
    studentName: 'Maya Patel',
    studentId: '21544',
  },
];

const seedHistory = [
  {
    id: 101,
    title: 'Name Plate.stl',
    date: 'Sep 22',
    material: 'PLA',
    result: 'Completed',
  },
  {
    id: 102,
    title: 'Cable Clip.3mf',
    date: 'Sep 18',
    material: 'PETG',
    result: 'Completed',
  },
  {
    id: 103,
    title: 'Mini Trophy.stl',
    date: 'Sep 10',
    material: 'PLA',
    result: 'Completed',
  },
];

const allowedTypes = ['.stl', '.3mf'];

function App() {
  const [users, setUsers] = useState([defaultAdmin]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
  });
  const [requests, setRequests] = useState(seedRequests);
  const [history, setHistory] = useState(seedHistory);
  const [uploadError, setUploadError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const visibleRequests = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return requests;
    return requests.filter((request) => request.ownerEmail === currentUser.email);
  }, [requests, currentUser]);

  const visibleHistory = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return history;
    return history.filter((item) => item.ownerEmail === currentUser.email || item.studentId === currentUser.studentId);
  }, [history, currentUser]);

  const stats = useMemo(() => {
    const active = requests.filter((item) => item.status !== 'Completed');
    return {
      total: requests.length,
      printing: requests.filter((item) => item.status === 'Printing').length,
      completed: requests.filter((item) => item.status === 'Completed').length,
      active: active.length,
    };
  }, [requests]);

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      return;
    }

    if (authMode === 'create') {
      if (!form.name || !form.studentId) {
        return;
      }

      const newUser = {
        id: `student-${Date.now()}`,
        name: form.name,
        email: form.email.trim().toLowerCase(),
        studentId: form.studentId.trim(),
        password: form.password,
        role: 'student',
      };

      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      setForm({ name: '', email: '', studentId: '', password: '' });
      return;
    }

    const foundUser = users.find(
      (user) =>
        user.email.toLowerCase() === form.email.trim().toLowerCase() &&
        user.password === form.password
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      setIsLoggedIn(true);
      setForm({ name: '', email: '', studentId: '', password: '' });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setUploadError('');
      return;
    }

    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedTypes.includes(extension)) {
      setSelectedFile(null);
      setUploadError('Only STL and 3MF files are allowed.');
      return;
    }

    setSelectedFile(file);
    setUploadError('');
  };

  const handleUpload = () => {
    if (!selectedFile || !currentUser) {
      setUploadError('Please choose a file before uploading.');
      return;
    }

    const newRequest = {
      id: Date.now(),
      title: selectedFile.name,
      status: 'Queued',
      date: 'Today',
      material: 'PLA',
      ownerEmail: currentUser.email,
      studentName: currentUser.name,
      studentId: currentUser.studentId,
    };

    setRequests((prev) => [newRequest, ...prev]);
    setSelectedFile(null);
    setUploadError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateRequestStatus = (id, nextStatus) => {
    const matchingRequest = requests.find((request) => request.id === id);
    if (!matchingRequest) return;

    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status: nextStatus } : request
      )
    );

    if (nextStatus === 'Completed') {
      const newHistoryItem = {
        id: Date.now(),
        title: matchingRequest.title,
        date: 'Today',
        material: matchingRequest.material,
        result: 'Completed',
        ownerEmail: matchingRequest.ownerEmail,
        studentId: matchingRequest.studentId,
      };

      setHistory((prev) => [newHistoryItem, ...prev]);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setForm({ name: '', email: '', studentId: '', password: '' });
  };

  return (
    <div className="page-shell">
      {!isLoggedIn ? (
        <div className="auth-layout">
          <div className="brand-panel">
            <div className="brand-block">
              <p className="brand-kicker">DNHS</p>
              <h1>MAKERSPACE</h1>
              <p className="brand-subtext">
                3D print designs for the school community and help bring ideas to life.
              </p>
            </div>
            <div className="feature-list">
              <span>Model Uploads</span>
              <span>3D Print Requests</span>
              <span>Club Dashboard</span>
            </div>
          </div>

          <div className="auth-card">
            <div className="auth-toggle">
              <button
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => setAuthMode('login')}
                type="button"
              >
                Sign in
              </button>
              <button
                className={authMode === 'create' ? 'active' : ''}
                onClick={() => setAuthMode('create')}
                type="button"
              >
                Create account
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {authMode === 'create' && (
                <label>
                  Full name
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleAuthChange}
                    placeholder="Student name"
                  />
                </label>
              )}

              {authMode === 'create' && (
                <label>
                  Student ID
                  <input
                    type="text"
                    name="studentId"
                    value={form.studentId}
                    onChange={handleAuthChange}
                    placeholder="12345"
                  />
                </label>
              )}

              <label>
                {authMode === 'create' ? 'Student email' : 'Email'}
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleAuthChange}
                  placeholder="student@dnhs.com"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleAuthChange}
                  placeholder="••••••••"
                />
              </label>

              <button className="primary-btn" type="submit">
                {authMode === 'create' ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="dashboard-shell">
          <aside className="sidebar">
            <div className="logo-wrap">
              <div className="mini-logo">M</div>
              <div>
                <p className="tiny-label">DNHS</p>
                <h2>MAKERSPACE</h2>
              </div>
            </div>

            <nav className="nav-links">
              <button className="nav-item active">Dashboard</button>
              <button className="nav-item">Current Requests</button>
              <button className="nav-item">Print History</button>
              {currentUser.role === 'admin' && <button className="nav-item">Admin Queue</button>}
            </nav>

            <div className="user-badge">
              <span>{currentUser.role === 'admin' ? 'Admin' : 'Student'}</span>
              <strong>{currentUser.name}</strong>
            </div>

            <button className="logout-btn" onClick={handleLogout} type="button">
              Sign out
            </button>
          </aside>

          <main className="main-panel">
            <header className="topbar">
              <div>
                <p className="tiny-label">Welcome back</p>
                <h3>{currentUser.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}</h3>
              </div>
              <button className="primary-btn" type="button">Create Project</button>
            </header>

            <section className="stats-grid">
              <article className="stat-card">
                <span>Total uploads</span>
                <strong>{stats.total}</strong>
              </article>
              <article className="stat-card">
                <span>Printing now</span>
                <strong>{stats.printing}</strong>
              </article>
              <article className="stat-card">
                <span>Completed</span>
                <strong>{stats.completed}</strong>
              </article>
            </section>

            <section className="content-grid">
              <div className="upload-panel">
                <div className="panel-header">
                  <h4>Upload design</h4>
                  <span>Accepts STL or 3MF</span>
                </div>

                <label className="upload-box">
                  <input ref={fileInputRef} type="file" accept=".stl,.3mf" onChange={handleFileChange} />
                  <span className="upload-icon">⇪</span>
                  <strong>{selectedFile ? selectedFile.name : 'Drag and drop a file here'}</strong>
                  <small>Supported formats: .stl, .3mf</small>
                </label>

                {uploadError && <p className="error-msg">{uploadError}</p>}

                <button className="primary-btn upload-btn" type="button" onClick={handleUpload}>
                  Upload file
                </button>
              </div>

              <div className="queue-panel">
                <div className="panel-header">
                  <h4>{currentUser.role === 'admin' ? 'Current print requests' : 'Your current print requests'}</h4>
                  <span>Live queue</span>
                </div>

                <div className="queue-list">
                  {visibleRequests.length === 0 ? (
                    <p className="empty-state">No current requests.</p>
                  ) : (
                    visibleRequests.map((item) => (
                      <div className="queue-item" key={item.id}>
                        <div>
                          <strong>{item.title}</strong>
                          <small>
                            {item.studentName || currentUser.name} • {item.date}
                          </small>
                        </div>
                        <div className="item-meta">
                          <span className={`status ${item.status.toLowerCase().replace(/\s/g, '-')}`}>
                            {item.status}
                          </span>
                          <small>{item.material}</small>
                          {currentUser.role === 'admin' && item.status !== 'Completed' && (
                            <div className="admin-actions">
                              <button type="button" onClick={() => updateRequestStatus(item.id, 'Printing')}>
                                Print
                              </button>
                              <button type="button" onClick={() => updateRequestStatus(item.id, 'Completed')}>
                                Done
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="history-panel">
              <div className="panel-header">
                <h4>Print history</h4>
                <span>Completed</span>
              </div>

              <div className="history-list">
                {visibleHistory.length === 0 ? (
                  <p className="empty-state">No print history yet.</p>
                ) : (
                  visibleHistory.map((item) => (
                    <div key={item.id} className="history-item">
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.date}</small>
                      </div>
                      <span className="history-tag">{item.result || 'Completed'}</span>
                      <small>{item.material}</small>
                    </div>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
