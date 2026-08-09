import { useEffect, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Course {
    id: number;
    code: string;
    name: string;
    capacity: number;
}

interface Allocation {
    id: number;
    preferenceRank: number;
    score: number;
    studentId: number;
    courseId: number;
    student: Student;
    course: Course;
}

function Dashboard() {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [allocations, setAllocations] = useState<Allocation[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [studentsResponse, coursesResponse, allocationsResponse] =
                    await Promise.all([
                        fetch("http://127.0.0.1:5000/api/students"),
                        fetch("http://127.0.0.1:5000/api/courses"),
                        fetch("http://127.0.0.1:5000/api/allocations"),
                    ]);

                if (
                    !studentsResponse.ok ||
                    !coursesResponse.ok ||
                    !allocationsResponse.ok
                ) {
                    throw new Error("Failed to load dashboard data");
                }

                const studentsData = await studentsResponse.json();
                const coursesData = await coursesResponse.json();
                const allocationsData = await allocationsResponse.json();

                setStudents(studentsData);
                setCourses(coursesData);
                setAllocations(allocationsData);
            } catch (error) {
                console.error("Dashboard loading error:", error);
                setError("Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    const averagePreference =
        allocations.length > 0
            ? (
                  allocations.reduce(
                      (total, allocation) =>
                          total + allocation.preferenceRank,
                      0
                  ) / allocations.length
              ).toFixed(1)
            : "—";

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
                    <button className="nav-item active" onClick={() => navigate("/admin")}>
                        <span>Dashboard</span>
                    </button>

                    <button className="nav-item" onClick={() => navigate("/admin/students")}>
                        <span>Students</span>
                    </button>

                    <button className="nav-item" onClick={() => navigate("/admin/courses")}>
                        <span>Courses</span>
                    </button>

                    <button className="nav-item" onClick={() => navigate("/admin/preferences")}>
                        <span>Preferences</span>
                    </button>

                    <button className="nav-item" onClick={() => navigate("/admin/allocation")}>
                        <span>Allocation</span>
                    </button>

                    <button className="nav-item" onClick={() => navigate("/admin/simulation")}>
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
                    {loading && (
                        <div className="loading-message">
                            Loading dashboard...
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="welcome-section">
                                <div>
                                    <h3>Allocation Overview</h3>
                                    <p>
                                        Monitor students, courses and the
                                        latest allocation results.
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

                                    <strong className="stat-value">
                                        {students.length}
                                    </strong>

                                    <span className="stat-description">
                                        Registered students
                                    </span>
                                </div>

                                <div className="stat-card">
                                    <span className="stat-label">
                                        Active Courses
                                    </span>

                                    <strong className="stat-value">
                                        {courses.length}
                                    </strong>

                                    <span className="stat-description">
                                        Available courses
                                    </span>
                                </div>

                                <div className="stat-card">
                                    <span className="stat-label">
                                        Allocated
                                    </span>

                                    <strong className="stat-value">
                                        {allocations.length}
                                    </strong>

                                    <span className="stat-description">
                                        Successful allocations
                                    </span>
                                </div>

                                <div className="stat-card">
                                    <span className="stat-label">
                                        Avg. Preference
                                    </span>

                                    <strong className="stat-value">
                                        {averagePreference}
                                    </strong>

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
                                                Current demand versus available
                                                seats.
                                            </p>
                                        </div>

                                        <button className="text-button">
                                            View courses
                                        </button>
                                    </div>

                                    <div className="course-list">
                                        {courses.map((course) => {
                                            const allocated =
                                                allocations.filter(
                                                    (allocation) =>
                                                        allocation.courseId ===
                                                        course.id
                                                ).length;

                                            const percentage =
                                                course.capacity > 0
                                                    ? Math.min(
                                                          (allocated /
                                                              course.capacity) *
                                                              100,
                                                          100
                                                      )
                                                    : 0;

                                            return (
                                                <div
                                                    className="course-row"
                                                    key={course.id}
                                                >
                                                    <div>
                                                        <strong>
                                                            {course.code}
                                                        </strong>

                                                        <span>
                                                            {course.name}
                                                        </span>
                                                    </div>

                                                    <div className="capacity">
                                                        <span>
                                                            {allocated} /{" "}
                                                            {course.capacity}
                                                        </span>

                                                        <div className="progress">
                                                            <div
                                                                className="progress-fill"
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                <section className="panel">
                                    <div className="panel-header">
                                        <div>
                                            <h3>Latest Allocations</h3>
                                            <p>
                                                Results from the latest solver
                                                run.
                                            </p>
                                        </div>

                                        <button className="text-button">
                                            View all
                                        </button>
                                    </div>

                                    <div className="allocation-list">
                                        {allocations.length === 0 ? (
                                            <p className="empty-message">
                                                No allocations yet.
                                            </p>
                                        ) : (
                                            allocations
                                                .slice(0, 5)
                                                .map((allocation) => (
                                                    <div
                                                        className="allocation-row"
                                                        key={allocation.id}
                                                    >
                                                        <div className="student-avatar">
                                                            {allocation.student.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="allocation-info">
                                                            <strong>
                                                                {
                                                                    allocation
                                                                        .student
                                                                        .name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    allocation
                                                                        .course
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>

                                                        <span className="rank-badge">
                                                            Rank #
                                                            {
                                                                allocation.preferenceRank
                                                            }
                                                        </span>
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                </section>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Dashboard;