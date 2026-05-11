import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import bgImage from "../assets/bg-ai.png";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || '/dashboard';

  // ✅ EMAIL AUTH
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");

    // 🔴 VALIDATION
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ GOOGLE AUTH
  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden text-white"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center mb-2">
          AI Interview
        </h1>
        <p className="text-center text-sm text-gray-300 mb-6">
          Practice smarter. Get hired faster.
        </p>

        {/* ERROR */}
        {error && (
          <div className="p-3 mb-4 rounded bg-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleEmailAuth} className="space-y-4">

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded bg-white/10 border border-white/20 focus:outline-none focus:border-red-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 rounded bg-white/10 border border-white/20 focus:outline-none focus:border-red-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
            >
              {showPassword ? (
                <HiOutlineEyeSlash size={20} />
              ) : (
                <HiOutlineEye size={20} />
              )}
            </button>
          </div>

          {!isLogin && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 pr-12 rounded bg-white/10 border border-white/20 focus:outline-none focus:border-red-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />

              {/* 👁️ EYE TOGGLE */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              >
                {showPassword ? (
                  <HiOutlineEyeSlash size={20} />
                ) : (
                  <HiOutlineEye size={20} />
                )}
              </button>
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded font-semibold transition"
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* GOOGLE BUTTON */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full mt-4 py-3 border border-white/20 rounded hover:bg-white/10 transition"
        >
          {loading ? "Please wait..." : "Continue with Google"}
        </button>

        {/* SWITCH */}
        <p className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-red-400 hover:underline"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>

      </div>
    </div>
  );
}