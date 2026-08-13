import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { apiFetch } from "../api";

interface Course {
    id: number;
    code: string;
    name: string;
    capacity: number;
}

function Courses() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState<Course[]>([]);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadCourses = async () => {
        try {
            setLoading(true);

            const response = await apiFetch("/api/courses");

            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }

            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error(error);
            setError("Could not load courses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCourses();
    }, []);

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (!code.trim() || !name.trim() || !capacity) {
            setError(
                "Course code, name and capacity are required."
            );
            return;
        }

        const numericCapacity = Number(capacity);

        if (
            !Number.isInteger(numericCapacity) ||
            numericCapacity <= 0
        ) {
            setError(
                "Capacity must be a positive whole number."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response = await apiFetch(
                "/api/courses",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        code: code.trim(),
                        name: name.trim(),
                        capacity: numericCapacity,
                    }),
                }
            );

            if (!response.ok) {
                const data = await response.json();

                throw new Error(
                    data.error || "Failed to create course"
                );
            }

            setCode("");
            setName("");
            setCapacity("");
            setShowForm(false);

            await loadCourses();
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to create course.");
            }
        } finally {
            setSaving(false);
        }
    };

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
                        onClick={() =>
                            navigate("/admin")
                        }
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

                    <button className="nav-item active">
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

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/admin/allocation")
                        }
                    >
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
                            ADMINISTRATION
                        </p>
                        <h2>Courses</h2>
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

                <section className="page-content">
                    <div className="page-header">
                        <div>
                            <h3>Course Management</h3>

                            <p>
                                Configure courses and available
                                seat capacities.
                            </p>
                        </div>

                        <button
                            className="primary-button"
                            onClick={() => {
                                setShowForm(!showForm);
                                setError("");
                            }}
                        >
                            {showForm
                                ? "Cancel"
                                : "+ Add Course"}
                        </button>
                    </div>

                    {showForm && (
                        <form
                            className="form-panel"
                            onSubmit={handleSubmit}
                        >
                            <h3>Add Course</h3>

                            <div className="form-grid">
                                <div className="form-field">
                                    <label htmlFor="course-code">
                                        Course Code
                                    </label>

                                    <input
                                        id="course-code"
                                        type="text"
                                        value={code}
                                        onChange={(event) =>
                                            setCode(
                                                event.target.value
                                            )
                                        }
                                        placeholder="CS301"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="course-name">
                                        Course Name
                                    </label>

                                    <input
                                        id="course-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) =>
                                            setName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Operating Systems"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="course-capacity">
                                        Capacity
                                    </label>

                                    <input
                                        id="course-capacity"
                                        type="number"
                                        min="1"
                                        value={capacity}
                                        onChange={(event) =>
                                            setCapacity(
                                                event.target.value
                                            )
                                        }
                                        placeholder="60"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="form-error">
                                    {error}
                                </p>
                            )}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setError("");
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Course"}
                                </button>
                            </div>
                        </form>
                    )}

                    {!showForm && error && (
                        <p className="form-error">
                            {error}
                        </p>
                    )}

                    <section className="table-panel">
                        <div className="table-header">
                            <div>
                                <h3>Available Courses</h3>

                                <p>
                                    {courses.length} course
                                    {courses.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    configured
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="table-message">
                                Loading courses...
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="table-message">
                                No courses configured yet.
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Code</th>
                                            <th>Course</th>
                                            <th>Capacity</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {courses.map(
                                            (course) => (
                                                <tr
                                                    key={
                                                        course.id
                                                    }
                                                >
                                                    <td>
                                                        #
                                                        {
                                                            course.id
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                course.code
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            course.name
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            course.capacity
                                                        }{" "}
                                                        seats
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

export default Courses;