import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Client-side password validation
    if (formData.password !== formData.confirm_password) {
      setError("Passwords don't match!");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.register(formData);
      console.log("Registration successful:", result);
      setSuccess("Account created successfully! Redirecting to login...");
      // Clear form on success
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: ""
      });
      // Auto-redirect to login after registration
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      // Handle different types of errors from Django
      if (err.email) {
        setError(`Email: ${err.email[0]}`);
      } else if (err.password) {
        setError(`Password: ${err.password[0]}`);
      } else if (err.non_field_errors) {
        setError(err.non_field_errors[0]);
      } else {
        setError("Registration failed. Please try again.");
      }
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
                src="/register2.png"
                alt="Register Illustration"
                className="w-full h-40 lg:h-64 object-cover"
              />
              {/* Animated overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent animate-pulse"></div>
              {/* Floating elements */}
              <div className="absolute top-6 left-6 w-3 h-3 bg-black rounded-full animate-bounce opacity-60"></div>
              <div className="absolute bottom-6 right-6 w-2 h-2 bg-gray-600 rounded-full animate-ping opacity-40"></div>
              <div className="absolute top-1/2 left-6 w-1.5 h-1.5 bg-gray-800 rounded-full animate-bounce delay-300 opacity-50"></div>
            </div>

            {/* Right Side - Registration Form */}
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
                  <h2 className="text-lg font-bold text-black font-oswald">Create Account</h2>
                  <p className="mt-1 text-gray-600 font-oswald text-sm">
                    Join thousands managing tasks efficiently
                  </p>
                </div>

                {/* Registration Form */}
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

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="transform hover:scale-105 transition-transform duration-200">
                      <label htmlFor="first_name" className="block text-xs font-medium text-black font-oswald">
                        First Name
                      </label>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={formData.first_name}
                        onChange={handleChange}
                        disabled={loading}
                        className="mt-1 block w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald transition-all duration-300 hover:shadow-md disabled:opacity-50"
                        placeholder="John"
                      />
                    </div>
                    <div className="transform hover:scale-105 transition-transform duration-200">
                      <label htmlFor="last_name" className="block text-xs font-medium text-black font-oswald">
                        Last Name
                      </label>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={formData.last_name}
                        onChange={handleChange}
                        disabled={loading}
                        className="mt-1 block w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald transition-all duration-300 hover:shadow-md disabled:opacity-50"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

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
                      className="mt-1 block w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald transition-all duration-300 hover:shadow-md disabled:opacity-50"
                      placeholder="john@example.com"
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
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className="mt-1 block w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald transition-all duration-300 hover:shadow-md disabled:opacity-50"
                      placeholder="Create password"
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="transform hover:scale-105 transition-transform duration-200">
                    <label htmlFor="confirm_password" className="block text-xs font-medium text-black font-oswald">
                      Confirm Password
                    </label>
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirm_password}
                      onChange={handleChange}
                      disabled={loading}
                      className="mt-1 block w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald transition-all duration-300 hover:shadow-md disabled:opacity-50"
                      placeholder="Confirm password"
                    />
                  </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start">
                    <input
                      id="agree-terms"
                      name="agree-terms"
                      type="checkbox"
                      required
                      className="h-3 w-3 mt-0.5 text-black focus:ring-black border-gray-300 rounded flex-shrink-0"
                    />
                    <label htmlFor="agree-terms" className="ml-2 block text-xs text-gray-600 font-oswald leading-tight">
                      I agree to the{" "}
                      <a href="#" className="text-black hover:text-gray-600 underline">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-black hover:text-gray-600 underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-black hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 transform hover:scale-105 font-oswald disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 font-oswald">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-black hover:text-gray-600 font-medium hover:underline"
                      >
                        Sign in
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

export default Register;