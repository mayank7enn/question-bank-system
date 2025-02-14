import axios from "axios";
import { assets } from "../assets/assets";
import { appContext } from "../context/appContext";
import { useContext } from "react";

const ResetPassword = () => {
  const context = useContext(appContext)
  if (!context) {
    throw new Error("appContext must be used within a AppProvider")
  }
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Reset Password form submitted");

    //it should send a request to the backend to reset the password and it would send email to that entered email id
    try {
      axios.defaults.withCredentials = true;
      const email = (document.getElementById('email') as HTMLInputElement).value;

      console.log(context)
      console.log("Sending request to:", context.backendUrl + "/api/auth/reset-password-otp");

      const response = await axios.post(context.backendUrl + "/api/auth/reset-password-otp", { email: email });
      console.log("Email sent successfully:", response.data);
      // Show OTP and new password input fields
      const otpInput = document.createElement("input");
      otpInput.type = "text";
      otpInput.id = "otp";
      otpInput.placeholder = "Enter OTP";
      otpInput.required = true;
      otpInput.className = "w-full h-10 px-3 py-2 text-xl rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-300 shadow-sm mt-4";

      const newPasswordInput = document.createElement("input");
      newPasswordInput.type = "password";
      newPasswordInput.id = "newPassword";
      newPasswordInput.placeholder = "Enter new password";
      newPasswordInput.required = true;
      newPasswordInput.className = "w-full h-10 px-3 py-2 text-xl rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-300 shadow-sm mt-4";

      const form = document.querySelector("form");
      form?.appendChild(otpInput);
      form?.appendChild(newPasswordInput);
    const resetPasswordButton = document.createElement("button");
    resetPasswordButton.type = "button";
    resetPasswordButton.textContent = "Reset Password";
    resetPasswordButton.className = "w-full h-10 bg-green-600 hover:bg-green-700 text-white text-xl font-medium py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-md mt-4";
    resetPasswordButton.onclick = async () => {
      const otp = (document.getElementById('otp') as HTMLInputElement).value;
      const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;

      try {
        const response = await axios.post(context.backendUrl + "/api/auth/reset-password", { email, otp, newPassword });
        console.log("Password reset successfully:", response.data);
        alert(response.data.message);
      } catch (error) {
        console.error("Error resetting password:", error);
      }
    };

    form?.appendChild(resetPasswordButton);
    } catch (error) {
      console.error("Error sending email to:", error);
    }

  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-4xl fixed top-0 py-3 px-5 bg-white shadow-sm">
        <img
          src={assets.logo}
          alt="Company Logo"
          className="w-24 transition-all duration-300 hover:scale-105"
        />
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mt-20">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Reset Password
        </h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="w-full">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
              className="w-full h-10 px-3 py-2 text-xl rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-300 shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-xl font-medium py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-md"
          >
            Send Reset Instructions
          </button>
        </form>

        {/* Additional Links */}
        <p className="text-center mt-4 text-xs text-gray-600">
          Password changed?{' '}
          <a
            href="/login"
            className="text-blue-400 hover:text-blue-600 font-medium underline"
          >
            Log in here
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;