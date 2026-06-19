import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] =
      useState("");

  const [password, setPassword] =
      useState("");

  const {
    loading,
    error,
    emailLogin,
    oauthLogin,
  } = useAuth();

  const handleSubmit = (
      e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    emailLogin(email, password);
  };

  return (
      <div
          className="
      min-h-screen
      flex
      items-center
      justify-center
      px-4
      "
      >
        <div className="w-full max-w-md">
          <div
              className="
          bg-white
          rounded-2xl
          shadow-xl
          p-8
          "
          >
            <img
                src="/assets/logo.png"
                alt="Logo"
                className="h-24 mx-auto"
            />

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
              <div>
                <label>Email</label>

                <input
                    type="email"

                    value={email}

                    onChange={(e) =>
                        setEmail(e.target.value)
                    }

                    disabled={loading !== null}

                    className="w-full border p-3 rounded-lg"

                    placeholder="name@example.com"
                />
              </div>

              <div>
                <label>Password</label>

                <input
                    type="password"

                    value={password}

                    onChange={(e) =>
                        setPassword(
                            e.target.value
                        )
                    }

                    disabled={loading !== null}

                    className="w-full border p-3 rounded-lg"

                    placeholder="********"
                />
              </div>

              {error && (
                  <div
                      className="
                p-3
                rounded-lg
                bg-red-100
                text-red-600
                "
                  >
                    {error}
                  </div>
              )}

              <button
                  type="submit"

                  disabled={loading !== null}

                  className="
              w-full
              p-3
              rounded-lg
              bg-blue-600
              text-white
              "
              >
                {loading === "email"
                    ? "Signing in..."
                    : "Sign In"}
              </button>
            </form>

            <div className="my-6 text-center">
              OR
            </div>

            <button
                onClick={oauthLogin}

                disabled={loading !== null}

                className="
            w-full
            p-3
            border
            rounded-lg
            flex
            justify-center
            items-center
            gap-3
            "
            >
              <FaGoogle />

              {loading === "google"
                  ? "Signing in..."
                  : "Continue with Google"}
            </button>
          </div>

          <div className="text-center mt-5">
            <button
                onClick={() =>
                    navigate("/register")
                }
            >
              Create account
            </button>
          </div>
        </div>
      </div>
  );
};

export default Login;