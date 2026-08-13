import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { apiFetch } from "../api";

interface Student {
    id: number;
    name: string;
    email: string;
}

function Students() {
    const navigate = useNavigate();

    const [students, setStudents] =
        useState<Student[]>([]);

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [editingStudent, setEditingStudent] =
        useState<Student | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [error, setError] =
        useState("");

    const loadStudents = async () => {
        try {
            setLoading(true);

            const response =
                await apiFetch(
                    "/api/students"
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch students"
                );
            }

            const data =
                await response.json();

            setStudents(data);
        } catch (error) {
            console.error(error);

            setError(
                "Could not load students."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadStudents();
    }, []);

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        if (
            !name.trim() ||
            !email.trim()
        ) {
            setError(
                "Name and email are required."
            );
            return;
        }

        const isEditing =
            editingStudent !== null;

        try {
            setSaving(true);
            setError("");

            const response =
                await apiFetch(
                    isEditing
                        ? `/api/students/${editingStudent.id}`
                        : "/api/students",
                    {
                        method: isEditing
                            ? "PUT"
                            : "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            name: name.trim(),
                            email: email.trim(),
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        (isEditing
                            ? "Failed to update student."
                            : "Failed to create student.")
                );
            }

            setName("");
            setEmail("");
            setShowForm(false);
            setEditingStudent(null);

            await loadStudents();
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    isEditing
                        ? "Failed to update student."
                        : "Failed to create student."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (
        student: Student
    ) => {
        setEditingStudent(student);

        setName(student.name);
        setEmail(student.email);

        setShowForm(true);
        setError("");
    };

    const handleDelete = async (
        student: Student
    ) => {
        const confirmed = window.confirm(
            `Delete ${student.name}? This action cannot be undone.`
        );
    
        if (!confirmed) {
            return;
        }
    
        try {
            setDeletingId(student.id);
            setError("");
    
            const response = await apiFetch(
                `/api/students/${student.id}`,
                {
                    method: "DELETE",
                }
            );
    
            const data = await response.json();
    
            if (!response.ok) {
                console.error(
                    "Delete student failed:",
                    response.status,
                    data
                );
    
                throw new Error(
                    data.error ||
                        `Failed to delete student (${response.status}).`
                );
            }
    
            await loadStudents();
        } catch (error) {
            console.error(error);
    
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to delete student."
                );
            }
        } finally {
            setDeletingId(null);
        }
    };

    const openAddForm = () => {
        setEditingStudent(null);
        setName("");
        setEmail("");
        setError("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingStudent(null);
        setName("");
        setEmail("");
        setError("");
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

                    <button className="nav-item active">
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
                            Students
                        </h2>
                    </div>

                    <div className="topbar-actions">
                        <span className="status">
                            <span className="status-dot">
                            </span>

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
                                Student Management
                            </h3>

                            <p>
                                Manage students
                                registered for
                                course allocation.
                            </p>
                        </div>

                        <button
                            className="primary-button"
                            onClick={
                                showForm
                                    ? closeForm
                                    : openAddForm
                            }
                        >
                            {showForm
                                ? "Cancel"
                                : "+ Add Student"}
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
                                {editingStudent
                                    ? "Edit Student"
                                    : "Add Student"}
                            </h3>

                            <div className="form-grid">
                                <div className="form-field">
                                    <label htmlFor="student-name">
                                        Full Name
                                    </label>

                                    <input
                                        id="student-name"
                                        type="text"
                                        value={name}
                                        onChange={(
                                            event
                                        ) =>
                                            setName(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter student name"
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="student-email">
                                        Email
                                    </label>

                                    <input
                                        id="student-email"
                                        type="email"
                                        value={email}
                                        onChange={(
                                            event
                                        ) =>
                                            setEmail(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="student@example.com"
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
                                    onClick={
                                        closeForm
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? editingStudent
                                            ? "Saving..."
                                            : "Creating..."
                                        : editingStudent
                                            ? "Save Changes"
                                            : "Create Student"}
                                </button>
                            </div>
                        </form>
                    )}

                    {!showForm &&
                        error && (
                            <p className="form-error">
                                {error}
                            </p>
                        )}

                    <section className="table-panel">
                        <div className="table-header">
                            <div>
                                <h3>
                                    Registered Students
                                </h3>

                                <p>
                                    {
                                        students.length
                                    }{" "}
                                    student
                                    {students.length !==
                                    1
                                        ? "s"
                                        : ""}{" "}
                                    registered
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="table-message">
                                Loading students...
                            </div>
                        ) : students.length ===
                          0 ? (
                            <div className="table-message">
                                No students
                                registered yet.
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
                                                Name
                                            </th>

                                            <th>
                                                Email
                                            </th>

                                            <th>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {students.map(
                                            (
                                                student
                                            ) => (
                                                <tr
                                                    key={
                                                        student.id
                                                    }
                                                >
                                                    <td>
                                                        #
                                                        {
                                                            student.id
                                                        }
                                                    </td>

                                                    <td>
                                                        <div className="student-cell">
                                                            <div className="student-avatar">
                                                                {student.name
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>

                                                            <strong>
                                                                {
                                                                    student.name
                                                                }
                                                            </strong>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {
                                                            student.email
                                                        }
                                                    </td>

                                                    <td>
                                                        <div className="table-actions">
                                                            <button
                                                                className="table-action edit-action"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        student
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                className="table-action delete-action"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        student
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    student.id
                                                                }
                                                            >
                                                                {deletingId ===
                                                                student.id
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

export default Students;