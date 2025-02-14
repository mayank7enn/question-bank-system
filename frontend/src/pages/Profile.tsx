import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { appContext } from "../context/appContext"; // Adjust based on your project structure

interface UserProfile {
  name: string;
  email: string;
  photo?: string;
  role: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const context = useContext(appContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(context?.backendUrl + "/api/auth/profile", {
          withCredentials: true, // Ensures cookies are sent if using JWT in cookies
        });

        if (response.data.success) {
          setProfile(response.data.user);
          console.log("Profile data fetched and set:", response.data.user);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // Runs once after component mount

  if (loading) return <p className="text-center text-gray-500">Loading profile...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        {/* Profile Cover Image */}
        <div className="relative w-full h-24 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-lg"></div>

        {/* Profile Picture */}
        {profile?.photo ? (
          <img
            src={profile.photo}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-white -mt-12 mx-auto shadow-md z-10 relative"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-300 rounded-full border-4 border-white -mt-12 mx-auto shadow-md z-10 relative"></div>
        )}

        <div className="justify-items-start">
          <h1 className="mt-4 text-3xl font-semibold text-gray-800">Username:</h1>
          <h2 className="text-xl font-semibold text-gray-800">{profile?.name}</h2>
          <h1 className="mt-4 text-3xl font-semibold text-gray-800">Email:</h1>
          <h2 className="text-xl font-semibold text-gray-800">{profile?.email}</h2>
          <h1 className="mt-4 text-3xl font-semibold text-gray-800">Role:</h1>
          <h2 className="text-xl font-semibold text-gray-800">{profile?.role}</h2>
        </div>

        {/* Navigation Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Profile;
