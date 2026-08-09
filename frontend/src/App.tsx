import "./App.css";

function App() {
    return (
        <div className="app">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-mark">CA</div>

                    <div>
                        <h1>Course Allocation</h1>
                        <span>Admin Portal</span>
                    </div>
                </div>

                <nav className="navigation">
                    <button className="nav-item active">
                        <span>Dashboard</span>
                    </button>

                    <button className="nav-item">
                        <span>Students</span>
                    </button>

                    <button className="nav-item">
                        <span>Courses</span>
                    </button>

                    <button className="nav-item">
                        <span>Preferences</span>
                    </button>

                    <button className="nav-item">
                        <span>Allocation</span>
                    </button>

                    <button className="nav-item">
                        <span>Simulation</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-avatar">A</div>

                    <div>
                        <strong>Administrator</strong>
                        <span>System Admin</span>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <p className="eyebrow">ADMINISTRATION</p>
                        <h2>Dashboard</h2>
                    </div>

                    <div className="topbar-actions">
                        <span className="status">
                            <span className="status-dot"></span>
                            System operational
                        </span>

                        <button className="profile-button">
                            A
                        </button>
                    </div>
                </header>

                <section className="dashboard-content">
                    <div className="welcome-section">
                        <div>
                            <h3>Allocation Overview</h3>
                            <p>
                                Monitor students, courses and the latest
                                allocation results.
                            </p>
                        </div>

                        <button className="primary-button">
                            Run Allocation
                        </button>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-label">
                                Total Students
                            </span>

                            <strong className="stat-value">1</strong>

                            <span className="stat-description">
                                Registered students
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">
                                Active Courses
                            </span>

                            <strong className="stat-value">3</strong>

                            <span className="stat-description">
                                Available courses
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">
                                Allocated
                            </span>

                            <strong className="stat-value">1</strong>

                            <span className="stat-description">
                                Successful allocations
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">
                                Avg. Preference
                            </span>

                            <strong className="stat-value">1.0</strong>

                            <span className="stat-description">
                                Average assigned rank
                            </span>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <section className="panel">
                            <div className="panel-header">
                                <div>
                                    <h3>Course Capacity</h3>
                                    <p>
                                        Current demand versus available seats.
                                    </p>
                                </div>

                                <button className="text-button">
                                    View courses
                                </button>
                            </div>

                            <div className="course-list">
                                <div className="course-row">
                                    <div>
                                        <strong>CS301</strong>
                                        <span>Operating Systems</span>
                                    </div>

                                    <div className="capacity">
                                        <span>1 / 2</span>

                                        <div className="progress">
                                            <div
                                                className="progress-fill"
                                                style={{ width: "50%" }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="course-row">
                                    <div>
                                        <strong>CS302</strong>
                                        <span>Computer Networks</span>
                                    </div>

                                    <div className="capacity">
                                        <span>0 / 2</span>

                                        <div className="progress">
                                            <div
                                                className="progress-fill"
                                                style={{ width: "0%" }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="course-row">
                                    <div>
                                        <strong>CS303</strong>
                                        <span>Database Systems</span>
                                    </div>

                                    <div className="capacity">
                                        <span>0 / 2</span>

                                        <div className="progress">
                                            <div
                                                className="progress-fill"
                                                style={{ width: "0%" }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="panel">
                            <div className="panel-header">
                                <div>
                                    <h3>Latest Allocations</h3>
                                    <p>
                                        Results from the latest solver run.
                                    </p>
                                </div>

                                <button className="text-button">
                                    View all
                                </button>
                            </div>

                            <div className="allocation-list">
                                <div className="allocation-row">
                                    <div className="student-avatar">
                                        A
                                    </div>

                                    <div className="allocation-info">
                                        <strong>Alice</strong>
                                        <span>
                                            Operating Systems
                                        </span>
                                    </div>

                                    <span className="rank-badge">
                                        Rank #1
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default App;