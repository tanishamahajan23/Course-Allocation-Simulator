import {
    useEffect,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

interface Course {
    id: number;
    code: string;
    name: string;
    capacity: number;
}

interface Preference {
    id: number;
    rank: number;
    course: Course;
}

function StudentPreferences() {
    const navigate = useNavigate();

    const [courses, setCourses] =
        useState<Course[]>([]);

    const [selected, setSelected] =
        useState<number[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const [
                    coursesResponse,
                    preferencesResponse,
                ] = await Promise.all([
                    apiFetch(
                        "/api/student/courses"
                    ),
                    apiFetch(
                        "/api/student/preferences"
                    ),
                ]);

                if (
                    !coursesResponse.ok ||
                    !preferencesResponse.ok
                ) {
                    throw new Error(
                        "Failed to load data."
                    );
                }

                const coursesData =
                    await coursesResponse.json();

                const preferencesData =
                    await preferencesResponse.json();

                setCourses(coursesData);

                setSelected(
                    preferencesData
                        .sort(
                            (
                                a: Preference,
                                b: Preference
                            ) =>
                                a.rank -
                                b.rank
                        )
                        .map(
                            (
                                preference: Preference
                            ) =>
                                preference.course
                                    .id
                        )
                );
            } catch (error) {
                console.error(error);

                setError(
                    "Could not load your preferences."
                );
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    function addCourse(courseId: number) {
        if (selected.includes(courseId)) {
            return;
        }

        if (selected.length >= 5) {
            setError(
                "You can select a maximum of 5 courses."
            );
            return;
        }

        setError("");

        setSelected([
            ...selected,
            courseId,
        ]);
    }

    function removeCourse(courseId: number) {
        setSelected(
            selected.filter(
                (id) => id !== courseId
            )
        );
    }

    function moveUp(index: number) {
        if (index === 0) {
            return;
        }

        const updated = [
            ...selected,
        ];

        [
            updated[index - 1],
            updated[index],
        ] = [
            updated[index],
            updated[index - 1],
        ];

        setSelected(updated);
    }

    function moveDown(index: number) {
        if (
            index ===
            selected.length - 1
        ) {
            return;
        }

        const updated = [
            ...selected,
        ];

        [
            updated[index],
            updated[index + 1],
        ] = [
            updated[index + 1],
            updated[index],
        ];

        setSelected(updated);
    }

    async function savePreferences() {
        if (selected.length === 0) {
            setError(
                "Select at least one course."
            );
            return;
        }

        setSaving(true);
        setError("");
        setMessage("");

        try {
            const response = await apiFetch(
                "/api/student/preferences",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        courseIds:
                            selected,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Failed to save preferences."
                );
            }

            setMessage(
                "Preferences saved successfully."
            );
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to save preferences."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="student-loading">
                Loading preferences...
            </div>
        );
    }

    const selectedCourses =
        selected
            .map((id) =>
                courses.find(
                    (course) =>
                        course.id === id
                )
            )
            .filter(
                (
                    course
                ): course is Course =>
                    course !== undefined
            );

    const availableCourses =
        courses.filter(
            (course) =>
                !selected.includes(
                    course.id
                )
        );

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

                <button
                    className="logout-button"
                    onClick={() =>
                        navigate("/student")
                    }
                >
                    Back to Dashboard
                </button>
            </header>

            <main className="student-main">
                <section className="student-intro">
                    <p className="section-label">
                        COURSE PREFERENCES
                    </p>

                    <h1>
                        Choose your courses
                    </h1>

                    <p>
                        Select up to 5 courses and
                        arrange them in order of
                        preference.
                    </p>
                </section>

                {error && (
                    <div className="auth-error preference-message">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="auth-success preference-message">
                        {message}
                    </div>
                )}

                <section className="preference-editor">
                    <div className="student-panel">
                        <div className="panel-heading">
                            <div>
                                <h2>
                                    Your Preferences
                                </h2>

                                <p>
                                    The solver uses this
                                    order when allocating
                                    courses.
                                </p>
                            </div>

                            <span className="preference-count">
                                {selected.length} / 5
                            </span>
                        </div>

                        <div className="selected-courses">
                            {selectedCourses.length ===
                            0 ? (
                                <div className="student-empty">
                                    <h3>
                                        No courses
                                        selected
                                    </h3>

                                    <p>
                                        Add courses from
                                        the list on the
                                        right.
                                    </p>
                                </div>
                            ) : (
                                selectedCourses.map(
                                    (
                                        course,
                                        index
                                    ) => (
                                        <div
                                            className="selected-course"
                                            key={
                                                course.id
                                            }
                                        >
                                            <div className="preference-number">
                                                {index +
                                                    1}
                                            </div>

                                            <div className="selected-course-info">
                                                <strong>
                                                    {
                                                        course.code
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        course.name
                                                    }
                                                </span>
                                            </div>

                                            <div className="course-actions">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moveUp(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                        0
                                                    }
                                                >
                                                    ↑
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moveDown(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                        selectedCourses.length -
                                                            1
                                                    }
                                                >
                                                    ↓
                                                </button>

                                                <button
                                                    type="button"
                                                    className="remove-course"
                                                    onClick={() =>
                                                        removeCourse(
                                                            course.id
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )
                            )}
                        </div>

                        <button
                            className="primary-button save-preferences"
                            onClick={
                                savePreferences
                            }
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Preferences"}
                        </button>
                    </div>

                    <div className="student-panel">
                        <div className="panel-heading">
                            <div>
                                <h2>
                                    Available Courses
                                </h2>

                                <p>
                                    Add courses to your
                                    preference list.
                                </p>
                            </div>
                        </div>

                        <div className="available-courses">
                            {availableCourses.map(
                                (course) => (
                                    <div
                                        className="available-course"
                                        key={
                                            course.id
                                        }
                                    >
                                        <div>
                                            <strong>
                                                {
                                                    course.code
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    course.name
                                                }
                                            </span>
                                        </div>

                                        <button
                                            className="secondary-button"
                                            onClick={() =>
                                                addCourse(
                                                    course.id
                                                )
                                            }
                                            disabled={
                                                selected.length >=
                                                5
                                            }
                                        >
                                            Add
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default StudentPreferences;