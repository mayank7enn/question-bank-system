import { useContext, useEffect, useState } from "react";
import { appContext } from "../../context/appContext";

export const SubjectManagement = () => {
  const context = useContext(appContext);
  if (!context) {
    throw new Error("SubjectManagement must be used within an AppContextProvider");
  }
  const { backendUrl } = context;

  // State for subjects and new subject input
  const [subjects, setSubjects] = useState<{ _id: string; subject: string }[]>([]);
  const [newSubject, setNewSubject] = useState("");

  // Fetch subjects from the backend
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/module/subject`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch subjects");
        setSubjects(data.subjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, [backendUrl]);

  // Add a new subject
  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) {
      alert("Subject name cannot be empty");
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/module/subject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject: newSubject }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add subject");
      setSubjects((prevSubjects) => [...prevSubjects, data.subject]);
      setNewSubject(""); // Clear input field
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  // Delete a subject
  const deleteSubject = async (subjectName: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/module/subject`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject: subjectName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete subject");
      setSubjects((prevSubjects) => prevSubjects.filter((s) => s.subject !== subjectName));
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  return (
    <div>
      {/* Add Subject Form */}
      <form onSubmit={addSubject} className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Enter new subject"
          className="border border-gray-300 p-2 rounded-md flex-grow text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
        >
          Add Subject
        </button>
      </form>

      {/* Subjects List */}
      <div>
        {subjects.length === 0 ? (
          <p>No subjects available.</p>
        ) : (
          <ul>
            {subjects.map((subject) => (
              <li key={subject._id} className="flex text-xl items-center justify-between mb-2">
                <span>{subject.subject}</span>
                <button
                  onClick={() => deleteSubject(subject.subject)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};