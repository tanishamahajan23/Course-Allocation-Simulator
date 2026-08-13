import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] =
        useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        event: React.FormEvent
    ) => {
        event.preventDefault();

        setError("");

        if (
            isRegistering &&
            password !== confirmPassword
        ) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const endpoint = isRegistering
                ? "/api/auth/register"
                : "/api/auth/login";

            const response = await fetch(
                `${API_URL}${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Something went wrong."
                );
            }

            if (isRegistering) {
                setIsRegistering(false);
                setPassword("");
                setConfirmPassword("");

                setError(
                    "Account created. You can now sign in."
                );

                return;
            }

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            if (data.user.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/student");
            }
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-shell">

                <div className="auth-brand-panel">
                    <div className="auth-brand-top">
                        <div className="auth-logo">
                            CA
                        </div>

                        <span>
                            CourseAlloc
                        </span>
                    </div>

                    <div className="auth-brand-content">
                        <p className="auth-eyebrow">
                            COURSE ALLOCATION PLATFORM
                        </p>

                        <h1>
                            Smarter allocation.
                            <br />
                            Better outcomes.
                        </h1>

                        <p>
                            Manage course preferences,
                            optimize allocations, and
                            track results from one place.
                        </p>
                    </div>

                    <div className="auth-brand-footer">
                        <span>
                            Preference-based allocation
                        </span>

                        <span>
                            Secure student access
                        </span>

                        <span>
                            Constraint optimization
                        </span>
                    </div>
                </div>

                <div className="auth-form-panel">
                    <div className="auth-form-header">
                        <div className="mobile-auth-logo">
                            CA
                        </div>

                        <p className="auth-form-eyebrow">
                            {isRegistering
                                ? "STUDENT REGISTRATION"
                                : "WELCOME BACK"}
                        </p>

                        <h2>
                            {isRegistering
                                ? "Create your account"
                                : "Sign in to CourseAlloc"}
                        </h2>

                        <p>
                            {isRegistering
                                ? "Your email must already be registered by an administrator."
                                : "Access your course preferences and allocation details."}
                        </p>
                    </div>

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="auth-field">
                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="alice@example.com"
                                autoComplete="email"
                                required
                            />

                            {isRegistering && (
                                <small>
                                    Use the exact email
                                    provided by your
                                    administrator.
                                </small>
                            )}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your password"
                                autoComplete={
                                    isRegistering
                                        ? "new-password"
                                        : "current-password"
                                }
                                required
                            />
                        </div>

                        {isRegistering && (
                            <div className="auth-field">
                                <label htmlFor="confirmPassword">
                                    Confirm password
                                </label>

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={
                                        confirmPassword
                                    }
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                        )}

                        {error && (
                            <div
                                className={
                                    error.startsWith(
                                        "Account created"
                                    )
                                        ? "auth-success"
                                        : "auth-error"
                                }
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Please wait..."
                                : isRegistering
                                  ? "Create account"
                                  : "Sign in"}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="auth-switch">
                        <span>
                            {isRegistering
                                ? "Already have an account?"
                                : "New student?"}
                        </span>

                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering(
                                    !isRegistering
                                );

                                setError("");
                                setPassword("");
                                setConfirmPassword("");
                            }}
                        >
                            {isRegistering
                                ? "Sign in"
                                : "Create an account"}
                        </button>
                    </div>

                    <p className="auth-note">
                        Student accounts can only be
                        created using an email registered
                        by the administrator.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Login;