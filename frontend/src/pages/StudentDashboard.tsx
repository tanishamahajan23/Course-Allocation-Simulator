import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Preference {
    id: number;
    rank: number;
    course: {
        code: string;
        name: string;
    };
}

interface Allocation {
    preferenceRank: number;
    score: number;
    course: {
        code: string;
        name: string;
    };
}

function StudentDashboard() {
    const navigate = useNavigate();

    const [student, setStudent] =
        useState<Student | null>(null);

    const [preferences, setPreferences] =
        useState<Preference[]>([]);

    const [allocation, setAllocation] =
        useState<Allocation | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [
                    studentResponse,
                    preferencesResponse,
                    allocationResponse,
                ] = await Promise.all([
                    apiFetch("/api/student/me"),
                    apiFetch(
                        "/api/student/preferences"
                    ),
                    apiFetch(
                        "/api/student/allocation"
                    ),
                ]);

                if (
                    !studentResponse.ok ||
                    !preferencesResponse.ok ||
                    !allocationResponse.ok
                ) {
                    throw new Error(
                        "Failed to load dashboard."
                    );
                }

                const studentData =
                    await studentResponse.json();

                const preferencesData =
                    await preferencesResponse.json();

                const allocationData =
                    await allocationResponse.json();

                setStudent(studentData);
                setPreferences(
                    preferencesData
                );
                setAllocation(
                    allocationData
                );
            } catch (error) {
                console.error(error);

                setError(
                    "Could not load your dashboard."
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    }

    if (loading) {
        return (
            <div className="student-page">
                <div className="student-loading">
                    Loading your dashboard...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-page">
                <div className="student-error">
                    <h2>
                        Something went wrong
                    </h2>

                    <p>{error}</p>

                    <button
                        className="primary-button"
                        onClick={() =>
                            window.location.reload()
                        }
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!student) {
        return null;
    }

    return (
        <div className="student-page">
            <header className="student-navbar">
                <div className="student-brand">
                    <div className="brand-mark">
                        CA
                    </div>

                    <div>
                        <strong>
                            Course Allocation
                        </strong>

                        <span>
                            Student Portal
                        </span>
                    </div>
                </div>

                <div className="student-account">
                    <div className="student-account-info">
                        <strong>
                            {student.name}
                        </strong>

                        <span>
                            {student.email}
                        </span>
                    </div>

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        Sign out
                    </button>
                </div>
            </header>

            <main className="student-main">
                <section className="student-intro">
                    <p className="section-label">
                        STUDENT PORTAL
                    </p>

                    <h1>
                        Welcome, {student.name}
                    </h1>

                    <p>
                        Manage your course
                        preferences and keep
                        track of your allocation.
                    </p>
                </section>

                <section className="student-stats">
                    <div className="student-stat">
                        <span>
                            Preferences
                        </span>

                        <strong>
                            {preferences.length} / 5
                        </strong>
                    </div>

                    <div className="student-stat">
                        <span>
                            Allocation
                        </span>

                        <strong>
                            {allocation
                                ? "Assigned"
                                : "Pending"}
                        </strong>
                    </div>

                    <div className="student-stat">
                        <span>
                            Allocated Preference
                        </span>

                        <strong>
                            {allocation
                                ? `#${allocation.preferenceRank}`
                                : "—"}
                        </strong>
                    </div>
                </section>

                <section className="student-content-grid">
                    <div className="student-panel">
                        <div className="panel-heading">
                            <div>
                                <h2>
                                    My Preferences
                                </h2>

                                <p>
                                    Your current
                                    course
                                    preferences.
                                </p>
                            </div>

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    navigate(
                                        "/student/preferences"
                                    )
                                }
                                disabled={
                                    !!allocation
                                }
                            >
                                {allocation
                                    ? "Preferences Locked"
                                    : "Manage"}
                            </button>
                        </div>

                        {preferences.length ===
                        0 ? (
                            <div className="student-empty">
                                <h3>
                                    No preferences yet
                                </h3>

                                <p>
                                    Add your preferred
                                    courses to
                                    participate in
                                    the allocation
                                    process.
                                </p>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate(
                                            "/student/preferences"
                                        )
                                    }
                                >
                                    Add Preferences
                                </button>
                            </div>
                        ) : (
                            <div className="preference-list">
                                {preferences.map(
                                    (
                                        preference
                                    ) => (
                                        <div
                                            className="preference-item"
                                            key={
                                                preference.id
                                            }
                                        >
                                            <div className="preference-rank">
                                                {
                                                    preference.rank
                                                }
                                            </div>

                                            <div>
                                                <strong>
                                                    {
                                                        preference
                                                            .course
                                                            .code
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        preference
                                                            .course
                                                            .name
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    <div className="student-panel">
                        <div className="panel-heading">
                            <div>
                                <h2>
                                    My Allocation
                                </h2>

                                <p>
                                    Your current
                                    course
                                    assignment.
                                </p>
                            </div>
                        </div>

                        {allocation ? (
                            <div className="allocation-card">
                                <span>
                                    Allocated Course
                                </span>

                                <strong>
                                    {
                                        allocation
                                            .course
                                            .code
                                    }
                                </strong>

                                <p>
                                    {
                                        allocation
                                            .course
                                            .name
                                    }
                                </p>

                                <div className="allocation-meta">
                                    <div>
                                        <span>
                                            Preference
                                        </span>

                                        <strong>
                                            #
                                            {
                                                allocation.preferenceRank
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Score
                                        </span>

                                        <strong>
                                            {
                                                allocation.score
                                            }
                                        </strong>
                                    </div>
                                </div>

                                <p className="allocation-result">
                                    You received your #
                                    {
                                        allocation.preferenceRank
                                    }{" "}
                                    preference.
                                </p>
                            </div>
                        ) : (
                            <div className="student-empty">
                                <h3>
                                    Allocation pending
                                </h3>

                                <p>
                                    Your allocation
                                    will appear
                                    here once the
                                    administrator
                                    runs the
                                    allocation.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default StudentDashboard;