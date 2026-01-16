import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {login, register} from "../api";
import {setToken} from "../auth";

export function RegisterPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await register(email, password);

            // auto-login after register
            const res = await login(email, password);
            setToken(res.accessToken);
            window.dispatchEvent(new Event("auth-changed"));

            navigate("/");
        } catch (err) {
            setError(String(err));
            setSubmitting(false);
        }
    }

    return (
        <div className="card">
            <h2>Register</h2>

            {error && <p style={{color: "crimson"}}>{error}</p>}

            <form onSubmit={onSubmit} style={{display: "grid", gap: 10}}>
                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="btn" disabled={submitting}>
                    {submitting ? "Creating..." : "Create account"}
                </button>
            </form>

            <p className="muted" style={{marginTop: 12}}>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}