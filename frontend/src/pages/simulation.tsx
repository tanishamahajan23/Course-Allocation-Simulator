import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

interface Course {
    id: number;
    code: string;
    name: string;
    capacity: number;
}

interface SimulationAllocation {
    student: string;
    course: string;
    preferenceRank: number;
    score: number;
}

interface SimulationResult {
    allocations: SimulationAllocation[];
    totalScore: number;
    status: string;
}

function Simulation() {
    const navigate = useNavigate();

    const [courses, setCourses] =
        useState<Course[]>([]);

    const [capacities, setCapacities] =
        useState<Record<string, string>>({});

    const [result, setResult] =
        useState<SimulationResult | null>(null);

    const [running, setRunning] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadCourses = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/api/courses"
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to load courses"
                );
            }

            const data =
                await response.json();

            setCourses(data);

            const initialCapacities:
                Record<string, string> = {};

            data.forEach(
                (course: Course) => {
                    initialCapacities[
                        course.code
                    ] = String(
                        course.capacity
                    );
                }
            );

            setCapacities(
                initialCapacities
            );
        } catch (error) {
            console.error(error);

            setError(
                "Could not load courses."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCourses();
    }, []);

    const updateCapacity = (
        courseCode: string,
        value: string
    ) => {
        setCapacities((current) => ({
            ...current,
            [courseCode]: value,
        }));
    };

    const runSimulation = async () => {
        try {
            setRunning(true);
            setError("");
            setResult(null);

            const capacityOverrides:
                Record<string, number> = {};

            for (const course of courses) {
                const value = Number(
                    capacities[course.code]
                );

                if (
                    !Number.isInteger(value) ||
                    value < 1
                ) {
                    throw new Error(
                        `${course.code} must have a valid capacity.`
                    );
                }

                capacityOverrides[
                    course.code
                ] = value;
            }

            const response = await fetch(
                "http://127.0.0.1:5000/api/simulation/run",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        capacityOverrides,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Simulation failed"
                );
            }

            setResult(data);
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Simulation failed."
                );
            }
        } finally {
            setRunning(false);
        }
    };

    const firstChoiceCount =
        result?.allocations.filter(
            (allocation) =>
                allocation.preferenceRank === 1
        ).length || 0;

    const firstChoicePercentage =
        result &&
        result.allocations.length > 0
            ? Math.round(
                  (firstChoiceCount /
                      result.allocations.length) *
                      100
              )
            : 0;

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-mark">
                        CA
                    </div>

                    <div>
                        <h1>
                            Course Allocation
                        </h1>

                        <span>
                            Admin Portal
                        </span>
                    </div>
                </div>

                <nav className="navigation">
                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        <span>
                            Dashboard
                        </span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/students"
                            )
                        }
                    >
                        <span>
                            Students
                        </span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/courses"
                            )
                        }
                    >
                        <span>
                            Courses
                        </span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/preferences"
                            )
                        }
                    >
                        <span>
                            Preferences
                        </span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/allocation"
                            )
                        }
                    >
                        <span>
                            Allocation
                        </span>
                    </button>

                    <button className="nav-item active">
                        <span>
                            Simulation
                        </span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-avatar">
                        A
                    </div>

                    <div>
                        <strong>
                            Administrator
                        </strong>

                        <span>
                            System Admin
                        </span>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <p className="eyebrow">
                            WHAT-IF ANALYSIS
                        </p>

                        <h2>
                            Simulation
                        </h2>
                    </div>

                    <div className="topbar-actions">
                        <span className="status">
                            <span className="status-dot"></span>
                            Simulation ready
                        </span>

                        <button className="profile-button">
                            A
                        </button>
                    </div>
                </header>

                <section className="page-content">
                    <div className="page-header">
                        <div>
                            <h3>
                                Allocation Simulation
                            </h3>

                            <p>
                                Test different course
                                capacities without
                                changing the actual
                                allocation.
                            </p>
                        </div>

                        <button
                            className="primary-button"
                            onClick={
                                runSimulation
                            }
                            disabled={running}
                        >
                            {running
                                ? "Running Simulation..."
                                : "Run Simulation"}
                        </button>
                    </div>

                    {error && (
                        <p className="form-error">
                            {error}
                        </p>
                    )}

                    {loading ? (
                        <div className="table-message">
                            Loading courses...
                        </div>
                    ) : (
                        <>
                            <section className="table-panel">
                                <div className="table-header">
                                    <h3>
                                        Hypothetical
                                        Capacities
                                    </h3>

                                    <p>
                                        Change these
                                        values to test
                                        different
                                        scenarios.
                                    </p>
                                </div>

                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>
                                                    Course
                                                </th>

                                                <th>
                                                    Current
                                                    Capacity
                                                </th>

                                                <th>
                                                    Simulated
                                                    Capacity
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {courses.map(
                                                (
                                                    course
                                                ) => (
                                                    <tr
                                                        key={
                                                            course.id
                                                        }
                                                    >
                                                        <td>
                                                            <strong>
                                                                {
                                                                    course.code
                                                                }
                                                            </strong>

                                                            <div className="table-secondary">
                                                                {
                                                                    course.name
                                                                }
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {
                                                                course.capacity
                                                            }
                                                        </td>

                                                        <td>
                                                            <input
                                                                className="simulation-input"
                                                                type="number"
                                                                min="1"
                                                                value={
                                                                    capacities[
                                                                        course
                                                                            .code
                                                                    ] ||
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    updateCapacity(
                                                                        course.code,
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {result && (
                                <>
                                    <div className="stats-grid simulation-stats">
                                        <div className="stat-card">
                                            <span className="stat-label">
                                                Allocated
                                            </span>

                                            <strong className="stat-value">
                                                {
                                                    result
                                                        .allocations
                                                        .length
                                                }
                                            </strong>

                                            <span className="stat-description">
                                                Simulated
                                                assignments
                                            </span>
                                        </div>

                                        <div className="stat-card">
                                            <span className="stat-label">
                                                First Choice
                                            </span>

                                            <strong className="stat-value">
                                                {
                                                    firstChoicePercentage
                                                }
                                                %
                                            </strong>

                                            <span className="stat-description">
                                                Rank #1
                                                assignments
                                            </span>
                                        </div>

                                        <div className="stat-card">
                                            <span className="stat-label">
                                                Total Score
                                            </span>

                                            <strong className="stat-value">
                                                {
                                                    result.totalScore
                                                }
                                            </strong>

                                            <span className="stat-description">
                                                Simulated
                                                satisfaction
                                            </span>
                                        </div>
                                    </div>

                                    <section className="table-panel">
                                        <div className="table-header">
                                            <h3>
                                                Simulated
                                                Results
                                            </h3>

                                            <p>
                                                These results
                                                are temporary
                                                and have not
                                                modified the
                                                actual
                                                allocation.
                                            </p>
                                        </div>

                                        <div className="table-wrapper">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            Student
                                                        </th>

                                                        <th>
                                                            Course
                                                        </th>

                                                        <th>
                                                            Preference
                                                        </th>

                                                        <th>
                                                            Score
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {result.allocations.map(
                                                        (
                                                            allocation,
                                                            index
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    index
                                                                }
                                                            >
                                                                <td>
                                                                    <strong>
                                                                        {
                                                                            allocation.student
                                                                        }
                                                                    </strong>
                                                                </td>

                                                                <td>
                                                                    {
                                                                        allocation.course
                                                                    }
                                                                </td>

                                                                <td>
                                                                    Rank #
                                                                    {
                                                                        allocation.preferenceRank
                                                                    }
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
                                    </section>
                                </>
                            )}
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Simulation;