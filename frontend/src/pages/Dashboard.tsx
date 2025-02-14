import { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { appContext } from "../context/appContext";
import { useNavigate } from "react-router";
import axios from "axios";
import Profile from "./Profile"; // Import Profile Component
import { RolesManagement } from "./modules/RolesManagement";
import { SubjectManagement } from "./modules/SubjectManagement";
import QuestionsManagement from "./modules/QuestionsManagement";
import QuestionsBulkUpoad from "./modules/QuestionsBulkUpoad";
import { TopicManagement } from "./modules/TopicManagement";

const Dashboard = () => {
  const context = useContext(appContext);
  const navigate = useNavigate();
  if (!context) {
    throw new Error("Dashboard must be used within an AppContextProvider");
  }
  const { backendUrl, isLoggedIn, name, role, setIsLoggedIn, setName, setRole } = context;

  // State Management
  const [selectedModule, setSelectedModule] = useState<string>(() => {
    return localStorage.getItem("selectedModule") || "Home";
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const storedRole = localStorage.getItem("userRole");

  // Persist selectedModule in localStorage
  useEffect(() => {
    localStorage.setItem("selectedModule", selectedModule);
  }, [selectedModule]);

  // Handle screen size changes for sidebar
  const isWideScreen = () => window.matchMedia("(min-width: 768px)").matches;
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(isWideScreen());
    };
    setIsSidebarOpen(isWideScreen());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/auth/profile`, {
          withCredentials: true,
        });
        if (response.data.success) {
          const userName = response.data.user?.name || "";
          const userRole = response.data.user?.role || "";
          if (userName !== name) {
            setName(userName);
          }
          if (userRole !== role) {
            setRole(userRole);
            localStorage.setItem("userRole", userRole);
          }
        } else {
          console.warn("Backend response error:", response.data);
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        if (axios.isAxiosError(error) && error.response) {
          alert(error.response.data.message || "An unknown error occurred.");
        } else {
          alert("An unknown error occurred.");
        }
      }
    };
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [backendUrl, isLoggedIn, name, role, setName, setRole]);//ye saari values agar change hogi to useEffect function dubara call hoga

  // Render the selected module dynamically
  const renderModule = () => {
    switch (selectedModule) {
      case "Profile":
        return <Profile />;
      // case "Settings":
      //   return <div>Settings Module</div>;
      // case "Users":
      //   return <div>Users Module</div>;
      case "Roles Management":
        return <RolesManagement />;
      case "Subject Management":
        return <SubjectManagement />;
      case "Topic Management":
        return <TopicManagement />;
      case "Questions Management":
        return <QuestionsManagement />;
      case "Bulk Upload":
        return <QuestionsBulkUpoad />;
      default:
        return <div>Welcome to your personalized dashboard.</div>;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <div
        className={`${isSidebarOpen ? "w-64" : "w-0"
          } bg-gray-900 text-white p-4 flex flex-col space-y-4 transition-all duration-300 ${isSidebarOpen ? "overflow-visible" : "overflow-hidden"
          } ${isSidebarOpen ? "opacity-100" : "opacity-0"}`}
      >
        {/* Logo and Title */}
        <div className="flex items-center space-x-2 mb-4">
          <button onClick={() => setSelectedModule("Home")} className="flex items-center space-x-2">
            <img src={assets.logo} alt="Logo" className="w-16" />
          </button>
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>

        {/* Navigation Buttons */}
        <nav className="flex-grow space-y-2">
          <button
            onClick={() => setSelectedModule("Home")}
            className="w-full py-2 px-3 text-left text-sm hover:bg-gray-800 rounded-md transition-colors"
          >
            Home
          </button>
          {storedRole === "admin" && (
            <>
              <button
                onClick={() => setSelectedModule("Roles Management")}
                className="w-full py-2 px-3 text-left text-sm hover:bg-gray-800 rounded-md transition-colors"
              >
                Roles Management
              </button>
              <button
                onClick={() => setSelectedModule("Subject Management")}
                className="w-full py-2 px-3 text-left text-sm hover:bg-gray-800 rounded-md transition-colors"
              >
                Subject Management
              </button>
              <button
                onClick={() => setSelectedModule("Topic Management")}
                className="w-full py-2 px-3 text-left text-sm hover:bg-gray-800 rounded-md transition-colors"
              >
                Topic Management
              </button>
              <button
                onClick={() => setSelectedModule("Questions Management")}
                className="w-full py-2 px-3 text-left text-sm hover:bg-gray-800 rounded-md transition-colors"
              >
                Questions Management
              </button>
              <button
                onClick={() => setSelectedModule("Bulk Upload")}
                className="w-full py-2 px-3 text-left text-sm hover:bg-gray-800 rounded-md transition-colors"
              >
                Questions Bulk Upload
              </button>
            </>
          )}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={() => {
              setIsLoggedIn(false);
              setName("");
              setRole("");
              localStorage.removeItem("userRole");
              localStorage.removeItem("selectedModule"); // Clear selectedModule on logout
              navigate("/login");
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-4 overflow-y-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-gray-200 rounded-md md:hidden absolute top-4 left-4 z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
          <h2 className="text-xl font-semibold">{selectedModule}</h2>
          <div className="flex items-center space-x-3">
            <p className="text-sm font-medium">{name}</p>
            <img
              src={assets.person_icon}
              alt="User"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => navigate("/dashboard/profile")}
            />
          </div>
        </div>

        {/* Dynamically Render Selected Module */}
        <div className="p-6 bg-white rounded-lg shadow-md space-y-4 max-w-4xl mx-auto">
          {renderModule()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;