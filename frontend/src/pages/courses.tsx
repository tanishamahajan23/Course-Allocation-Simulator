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

    const [editingCourse, setEditingCourse] =
        useState<Course | null>(null);

    const [editCode, setEditCode] = useState("");
    const [editName, setEditName] = useState("");
    const [editCapacity, setEditCapacity] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadCourses = async () => {
        try {
            setLoading(true);

            const response =
                await apiFetch("/api/courses");

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch courses"
                );
            }

            const data = await response.json();

            setCourses(data);
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

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (
            !code.trim() ||
            !name.trim() ||
            !capacity
        ) {
            setError(
                "Course code, name and capacity are required."
            );

            return;
        }

        const numericCapacity =
            Number(capacity);

        if (
            !Number.isInteger(
                numericCapacity
            ) ||
            numericCapacity <= 0
        ) {
            setError(
                "Capacity must be a positive whole number."
            );

            return;
        }

        try {
            setSaving(true);

            const response =
                await apiFetch(
                    "/api/courses",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            code: code.trim(),
                            name: name.trim(),
                            capacity:
                                numericCapacity,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Failed to create course"
                );
            }

            setCode("");
            setName("");
            setCapacity("");

            setShowForm(false);

            setMessage(
                "Course created successfully."
            );

            await loadCourses();
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to create course."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (
        course: Course
    ) => {
        setEditingCourse(course);

        setEditCode(course.code);
        setEditName(course.name);
        setEditCapacity(
            String(course.capacity)
        );

        setError("");
        setMessage("");
    };

    const handleUpdate = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!editingCourse) {
            return;
        }

        if (
            !editCode.trim() ||
            !editName.trim() ||
            !editCapacity
        ) {
            setError(
                "Course code, name and capacity are required."
            );

            return;
        }

        const numericCapacity =
            Number(editCapacity);

        if (
            !Number.isInteger(
                numericCapacity
            ) ||
            numericCapacity <= 0
        ) {
            setError(
                "Capacity must be a positive whole number."
            );

            return;
        }

        try {
            setSaving(true);

            const response =
                await apiFetch(
                    `/api/courses/${editingCourse.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            code: editCode.trim(),
                            name: editName.trim(),
                            capacity:
                                numericCapacity,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Failed to update course"
                );
            }

            setEditingCourse(null);

            setEditCode("");
            setEditName("");
            setEditCapacity("");

            setMessage(
                "Course updated successfully."
            );

            await loadCourses();
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to update course."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (
        course: Course
    ) => {
        const confirmed =
            window.confirm(
                `Delete ${course.code} - ${course.name}?\n\n` +
                    "Preferences for this course will be removed. " +
                    "Students currently allocated to this course will become unallocated and can be included in the next allocation run."
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(course.id);

            setError("");
            setMessage("");

            const response =
                await apiFetch(
                    `/api/courses/${course.id}`,
                    {
                        method: "DELETE",
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Failed to delete course"
                );
            }

            await loadCourses();

            if (
                data.allocationReset &&
                data.affectedStudents > 0
            ) {
                setMessage(
                    `${data.affectedStudents} student${
                        data.affectedStudents !==
                        1
                            ? "s"
                            : ""
                    } became unallocated. Run allocation again to reassign them.`
                );
            } else {
                setMessage(
                    "Course deleted successfully."
                );
            }
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to delete course."
                );
            }
        } finally {
            setDeletingId(null);
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

                    <button className="nav-item active">
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
                            Courses
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
                                Course Management
                            </h3>

                            <p>
                                Configure courses
                                and available
                                seat capacities.
                            </p>
                        </div>

                        <button
                            className="primary-button"
                            onClick={() => {
                                setShowForm(
                                    !showForm
                                );

                                setEditingCourse(
                                    null
                                );

                                setError("");
                                setMessage("");
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
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <h3>
                                Add Course
                            </h3>

                            <div className="form-grid">
                                <div className="form-field">
                                    <label htmlFor="course-code">
                                        Course Code
                                    </label>

                                    <input
                                        id="course-code"
                                        type="text"
                                        value={
                                            code
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCode(
                                                event
                                                    .target
                                                    .value
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
                                        value={
                                            name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setName(
                                                event
                                                    .target
                                                    .value
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
                                        value={
                                            capacity
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCapacity(
                                                event
                                                    .target
                                                    .value
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
                                        setShowForm(
                                            false
                                        );

                                        setError(
                                            ""
                                        );
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Course"}
                                </button>
                            </div>
                        </form>
                    )}

                    {editingCourse && (
                        <form
                            className="form-panel"
                            onSubmit={
                                handleUpdate
                            }
                        >
                            <h3>
                                Edit Course
                            </h3>

                            <div className="form-grid">
                                <div className="form-field">
                                    <label htmlFor="edit-course-code">
                                        Course Code
                                    </label>

                                    <input
                                        id="edit-course-code"
                                        type="text"
                                        value={
                                            editCode
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditCode(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="edit-course-name">
                                        Course Name
                                    </label>

                                    <input
                                        id="edit-course-name"
                                        type="text"
                                        value={
                                            editName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditName(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="edit-course-capacity">
                                        Capacity
                                    </label>

                                    <input
                                        id="edit-course-capacity"
                                        type="number"
                                        min="1"
                                        value={
                                            editCapacity
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEditCapacity(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
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
                                        setEditingCourse(
                                            null
                                        );

                                        setError(
                                            ""
                                        );
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    )}

                    {!showForm &&
                        !editingCourse &&
                        error && (
                            <p className="form-error">
                                {error}
                            </p>
                        )}

                    {message && (
                        <p className="form-success">
                            {message}
                        </p>
                    )}

                    <section className="table-panel">
                        <div className="table-header">
                            <div>
                                <h3>
                                    Available Courses
                                </h3>

                                <p>
                                    {
                                        courses.length
                                    }{" "}
                                    course
                                    {courses.length !==
                                    1
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
                        ) : courses.length ===
                          0 ? (
                            <div className="table-message">
                                No courses
                                configured
                                yet.
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                ID
                                            </th>

                                            <th>
                                                Code
                                            </th>

                                            <th>
                                                Course
                                            </th>

                                            <th>
                                                Capacity
                                            </th>

                                            <th>
                                                Actions
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

                                                    <td>
                                                        <div className="table-actions">
                                                            <button
                                                                className="secondary-button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        course
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                className="danger-button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        course
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    course.id
                                                                }
                                                            >
                                                                {deletingId ===
                                                                course.id
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </button>
                                                        </div>
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