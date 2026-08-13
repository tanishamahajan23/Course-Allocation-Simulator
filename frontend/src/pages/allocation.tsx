import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { apiFetch } from "../api";


interface Allocation {
    id: number;
    preferenceRank: number;
    score: number;
    studentId: number;
    courseId: number;
    student: {
        id: number;
        name: string;
        email: string;
    };
    course: {
        id: number;
        code: string;
        name: string;
        capacity: number;
    };
}

function Allocation() {
    const navigate = useNavigate();

    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [running, setRunning] = useState(false);
const [resetting, setResetting] = useState(false);
const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

    const loadAllocations = async () => {
        try {
            setLoading(true);
            const response = await apiFetch(
                "/api/allocations"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch allocations");
            }

            const data = await response.json();
            setAllocations(data);
        } catch (error) {
            console.error(error);
            setError("Could not load allocations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAllocations();
    }, []);

    const runAllocation = async () => {
        try {
            setRunning(true);
            setMessage("");
            setError("");

            const response = await apiFetch(
                "/api/allocations/run",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Allocation failed"
                );
            }

            setMessage("Allocation completed successfully.");

            await loadAllocations();
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Allocation failed.");
            }
        } finally {
            setRunning(false);
        }
    };

    const resetAllocation = async () => {
        const confirmed = window.confirm(
            "Reset the current allocation? This will remove all allocation results and allow students to edit their preferences again."
        );
    
        if (!confirmed) {
            return;
        }
    
        try {
            setResetting(true);
            setMessage("");
            setError("");
    
            const response = await apiFetch(
                "/api/allocations",
                {
                    method: "DELETE",
                }
            );
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Failed to reset allocation."
                );
            }
    
            setMessage(
                "Allocation reset successfully. Students can now edit their preferences."
            );
    
            await loadAllocations();
        } catch (error) {
            console.error(error);
    
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to reset allocation."
                );
            }
        } finally {
            setResetting(false);
        }
    };

    const averageRank =
        allocations.length > 0
            ? (
                  allocations.reduce(
                      (total, allocation) =>
                          total + allocation.preferenceRank,
                      0
                  ) / allocations.length
              ).toFixed(2)
            : "—";

    const firstChoiceCount = allocations.filter(
        (allocation) => allocation.preferenceRank === 1
    ).length;

    const firstChoicePercentage =
        allocations.length > 0
            ? Math.round(
                  (firstChoiceCount / allocations.length) * 100
              )
            : 0;

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
                    <button
                        className="nav-item"
                        onClick={() => navigate("/admin")}
                    >
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span>Students</span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/admin/courses")
                        }
                    >
                        <span>Courses</span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/admin/preferences")
                        }
                    >
                        <span>Preferences</span>
                    </button>

                    <button className="nav-item active">
                        <span>Allocation</span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/admin/simulation")
                        }
                    >
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
                        <p className="eyebrow">
                            OPTIMIZATION ENGINE
                        </p>

                        <h2>Allocation</h2>
                    </div>

                    <div className="topbar-actions">
                        <span className="status">
                            <span className="status-dot"></span>
                            Solver ready
                        </span>

                        <button className="profile-button">
                            A
                        </button>
                    </div>
                </header>

                <section className="page-content">
                    <div className="page-header">
                        <div>
                            <h3>Course Allocation</h3>

                            <p>
                                Run the CP-SAT optimization engine
                                against the current student
                                preferences.
                            </p>
                        </div>

                        <div className="allocation-actions">
    <button
        className="primary-button run-button"
        onClick={runAllocation}
        disabled={running || resetting}
    >
        {running
            ? "Running Solver..."
            : "Run Allocation"}
    </button>

    {allocations.length > 0 && (
        <button
            className="reset-allocation-button"
            onClick={resetAllocation}
            disabled={running || resetting}
        >
            {resetting
                ? "Resetting..."
                : "Reset Allocation"}
        </button>
    )}
</div>
                    </div>

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}

                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-label">
                                Allocated Students
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
                                First Choice
                            </span>

                            <strong className="stat-value">
                                {firstChoicePercentage}%
                            </strong>

                            <span className="stat-description">
                                Students receiving rank #1
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">
                                Average Rank
                            </span>

                            <strong className="stat-value">
                                {averageRank}
                            </strong>

                            <span className="stat-description">
                                Lower is better
                            </span>
                        </div>

                        <div className="stat-card">
                            <span className="stat-label">
                                Solver Status
                            </span>

                            <strong className="stat-value">
                                {running
                                    ? "Running"
                                    : "Ready"}
                            </strong>

                            <span className="stat-description">
                                CP-SAT optimization engine
                            </span>
                        </div>
                    </div>

                    <section className="table-panel">
                        <div className="table-header">
                            <div>
                                <h3>Allocation Results</h3>

                                <p>
                                    Students assigned to their
                                    optimized courses.
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="table-message">
                                Loading allocations...
                            </div>
                        ) : allocations.length === 0 ? (
                            <div className="allocation-empty">
                                <h3>No allocation has been run yet</h3>

                                <p>
                                    Configure students, courses and
                                    preferences, then run the
                                    optimization engine.
                                </p>

                                <button
                                    className="primary-button"
                                    onClick={runAllocation}
                                    disabled={running}
                                >
                                    {running
                                        ? "Running Solver..."
                                        : "Run First Allocation"}
                                </button>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Course</th>
                                            <th>Preference</th>
                                            <th>Score</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {allocations.map(
                                            (allocation) => (
                                                <tr
                                                    key={
                                                        allocation.id
                                                    }
                                                >
                                                    <td>
                                                        <div className="student-cell">
                                                            <div className="student-avatar">
                                                                {allocation.student.name
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>

                                                            <strong>
                                                                {
                                                                    allocation
                                                                        .student
                                                                        .name
                                                                }
                                                            </strong>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                allocation
                                                                    .course
                                                                    .code
                                                            }
                                                        </strong>

                                                        <div className="table-secondary">
                                                            {
                                                                allocation
                                                                    .course
                                                                    .name
                                                            }
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="rank-badge">
                                                            Rank #
                                                            {
                                                                allocation.preferenceRank
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {
                                                            allocation.score
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </section>
            </main>
        </div>
    );
}

export default Allocation;