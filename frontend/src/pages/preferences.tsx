import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { apiFetch } from "../api";

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

interface Preference {
    id: number;
    studentId: number;
    courseId: number;
    rank: number;
}

function Preferences() {
    const navigate = useNavigate();

    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [preferences, setPreferences] = useState<Preference[]>([]);

    const [selectedStudent, setSelectedStudent] =
        useState("");

    const [selectedCourses, setSelectedCourses] =
        useState<string[]>(["", "", ""]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);

            const [
                studentsResponse,
                coursesResponse,
                preferencesResponse,
            ] = await Promise.all([
                apiFetch("/api/students"),
                apiFetch("/api/courses"),
                apiFetch("/api/preferences"),
            ]);

            if (
                !studentsResponse.ok ||
                !coursesResponse.ok ||
                !preferencesResponse.ok
            ) {
                throw new Error("Failed to load preference data");
            }

            const studentsData =
                await studentsResponse.json();

            const coursesData =
                await coursesResponse.json();

            const preferencesData =
                await preferencesResponse.json();

            setStudents(studentsData);
            setCourses(coursesData);
            setPreferences(preferencesData);
        } catch (error) {
            console.error(error);
            setError(
                "Could not load students, courses or preferences."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, []);

    const handleStudentChange = (
        studentId: string
    ) => {
        setSelectedStudent(studentId);
        setMessage("");
        setError("");

        const studentPreferences =
            preferences
                .filter(
                    (preference) =>
                        preference.studentId ===
                        Number(studentId)
                )
                .sort(
                    (a, b) =>
                        a.rank - b.rank
                );

        const newCourses = ["", "", ""];

        studentPreferences.forEach(
            (preference) => {
                if (
                    preference.rank >= 1 &&
                    preference.rank <= 3
                ) {
                    newCourses[
                        preference.rank - 1
                    ] = String(
                        preference.courseId
                    );
                }
            }
        );

        setSelectedCourses(newCourses);
    };

    const handleCourseChange = (
        index: number,
        courseId: string
    ) => {
        const updated = [...selectedCourses];

        updated[index] = courseId;

        setSelectedCourses(updated);

        setMessage("");
        setError("");
    };

    const handleSave = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();
    
        if (!selectedStudent) {
            setError("Please select a student.");
            return;
        }
    
        const chosenCourses = selectedCourses.filter(Boolean);
    
        if (chosenCourses.length === 0) {
            setError("Please select at least one course.");
            return;
        }
    
        const uniqueCourses = new Set(chosenCourses);
    
        if (uniqueCourses.size !== chosenCourses.length) {
            setError(
                "A student cannot select the same course more than once."
            );
            return;
        }
    
        try {
            setSaving(true);
            setError("");
            setMessage("");
    
            /*
             * Send each preference separately because the backend
             * expects:
             *
             * {
             *   studentId,
             *   courseId,
             *   rank
             * }
             */
    
            for (let index = 0; index < selectedCourses.length; index++) {
                const courseId = selectedCourses[index];
    
                // Skip empty preference slots
                if (!courseId) {
                    continue;
                }
    
                const response = await apiFetch(
                    "/api/preferences",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            studentId: Number(selectedStudent),
                            courseId: Number(courseId),
                            rank: index + 1,
                        }),
                    }
                );
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(
                        data.error || "Failed to save preference"
                    );
                }
            }
    
            setMessage(
                "Preferences saved successfully."
            );
    
            await loadData();
    
            handleStudentChange(selectedStudent);
        } catch (error) {
            console.error(error);
    
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Failed to save preferences.");
            }
        } finally {
            setSaving(false);
        }
    };

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

                    <button className="nav-item active">
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

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate(
                                "/admin/simulation"
                            )
                        }
                    >
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
                            ADMINISTRATION
                        </p>

                        <h2>
                            Preferences
                        </h2>
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
                            <h3>
                                Student Preferences
                            </h3>

                            <p>
                                Configure the preferred
                                course order for each
                                student.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="table-message">
                            Loading preference data...
                        </div>
                    ) : (
                        <form
                            className="form-panel"
                            onSubmit={handleSave}
                        >
                            <div className="form-field">
                                <label htmlFor="student">
                                    Student
                                </label>

                                <select
                                    id="student"
                                    value={
                                        selectedStudent
                                    }
                                    onChange={(event) =>
                                        handleStudentChange(
                                            event.target
                                                .value
                                        )
                                    }
                                >
                                    <option value="">
                                        Select a student
                                    </option>

                                    {students.map(
                                        (student) => (
                                            <option
                                                key={
                                                    student.id
                                                }
                                                value={
                                                    student.id
                                                }
                                            >
                                                {
                                                    student.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="preference-form">
                                {[0, 1, 2].map(
                                    (index) => (
                                        <div
                                            className="preference-row"
                                            key={index}
                                        >
                                            <div className="preference-rank">
                                                {index + 1}
                                            </div>

                                            <div className="form-field">
                                                <label>
                                                    Preference{" "}
                                                    {index +
                                                        1}
                                                </label>

                                                <select
                                                    value={
                                                        selectedCourses[
                                                            index
                                                        ]
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        handleCourseChange(
                                                            index,
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Select
                                                        course
                                                    </option>

                                                    {courses.map(
                                                        (
                                                            course
                                                        ) => (
                                                            <option
                                                                key={
                                                                    course.id
                                                                }
                                                                value={
                                                                    course.id
                                                                }
                                                            >
                                                                {
                                                                    course.code
                                                                }{" "}
                                                                —{" "}
                                                                {
                                                                    course.name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {error && (
                                <p className="form-error">
                                    {error}
                                </p>
                            )}

                            {message && (
                                <div className="success-message">
                                    {message}
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Preferences"}
                                </button>
                            </div>
                        </form>
                    )}

                    <section className="table-panel">
                        <div className="table-header">
                            <h3>
                                Preference Summary
                            </h3>

                            <p>
                                Current preference
                                submissions.
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
                                            Rank 1
                                        </th>

                                        <th>
                                            Rank 2
                                        </th>

                                        <th>
                                            Rank 3
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {students.map(
                                        (student) => {
                                            const studentPreferences =
                                                preferences
                                                    .filter(
                                                        (
                                                            preference
                                                        ) =>
                                                            preference.studentId ===
                                                            student.id
                                                    )
                                                    .sort(
                                                        (
                                                            a,
                                                            b
                                                        ) =>
                                                            a.rank -
                                                            b.rank
                                                    );

                                            return (
                                                <tr
                                                    key={
                                                        student.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                student.name
                                                            }
                                                        </strong>
                                                    </td>

                                                    {[1, 2, 3].map(
                                                        (
                                                            rank
                                                        ) => {
                                                            const preference =
                                                                studentPreferences.find(
                                                                    (
                                                                        item
                                                                    ) =>
                                                                        item.rank ===
                                                                        rank
                                                                );

                                                            const course =
                                                                preference
                                                                    ? courses.find(
                                                                          (
                                                                              item
                                                                          ) =>
                                                                              item.id ===
                                                                              preference.courseId
                                                                      )
                                                                    : null;

                                                            return (
                                                                <td
                                                                    key={
                                                                        rank
                                                                    }
                                                                >
                                                                    {course
                                                                        ? `${course.code}`
                                                                        : "—"}
                                                                </td>
                                                            );
                                                        }
                                                    )}
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}

export default Preferences;