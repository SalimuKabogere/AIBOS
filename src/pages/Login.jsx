import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await authService.login(formData);
      console.log("Login successful:", result);
      setSuccess("Login successful! Welcome back.");
      // Auto-redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.non_field_errors || err.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-20 px-12">
      {/* Animated Card Container */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-500 ease-in-out animate-fade-in">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Image */}
            <div className="lg:w-1/3 relative flex items-center justify-center">
              <img
                src="/login2.png"
                alt="Login Illustration"
                className="w-full h-40 lg:h-64 object-cover"
              />
              {/* Animated overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent animate-pulse"></div>
              {/* Floating elements */}
              <div className="absolute top-6 right-6 w-3 h-3 bg-black rounded-full animate-bounce opacity-60"></div>
              <div className="absolute bottom-6 left-6 w-2 h-2 bg-gray-600 rounded-full animate-ping opacity-40"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:w-2/3 p-6 flex items-center justify-center">
              <div className="w-full max-w-xs space-y-4">
                {/* Header */}
                <div className="text-center transform animate-slide-down">
                  <div className="flex items-center justify-center mb-3">
                    <img 
                      src="/logo2.png" 
                      alt="EezyTask Logo" 
                      className="w-8 h-8 mr-2 animate-spin-slow"
                    />
                    <h1 className="text-lg font-bold text-black font-bungee">EezyTask</h1>
                  </div>
                  <h2 className="text-lg font-bold text-black font-oswald">Welcome Back</h2>
                  <p className="mt-1 text-gray-600 font-oswald text-sm">
                    Sign in to manage your tasks
                  </p>
                </div>

                {/* Login Form */}
                <form className="space-y-3 transform animate-slide-up" onSubmit={handleSubmit}>
                  {/* Success Message */}
                  {success && (
                    <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg font-oswald">
                      {success}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg font-oswald">
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="transform hover:scale-105 transition-transform duration-200">
                    <label htmlFor="email" className="block text-xs font-medium text-black font-oswald">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald transition-all duration-300 hover:shadow-md disabled:opacity-50"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="transform hover:scale-105 transition-transform duration-200">
                    <label htmlFor="password" className="block text-xs font-medium text-black font-oswald">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald transition-all duration-300 hover:shadow-md disabled:opacity-50"
                      placeholder="Enter your password"
                    />
                  </div>
                  

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-3 w-3 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 text-gray-600 font-oswald">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-black hover:text-gray-600 font-oswald">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-black hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 transform hover:scale-105 font-oswald disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 font-oswald">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="text-black hover:text-gray-600 font-medium hover:underline"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>

                  {/* Back to Home */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="text-xs text-gray-500 hover:text-black font-oswald hover:underline"
                    >
                      ← Back to Home
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;