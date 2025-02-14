import { useContext, useEffect, useState } from "react";
import { appContext } from "../../context/appContext";

export const TopicManagement = () => {
  const context = useContext(appContext);
  if (!context) {
    throw new Error("TopicManagement must be used within an AppContextProvider");
  }
  const { backendUrl } = context;

  // State for subjects, selected subject, and new topic input
  const [subjects, setSubjects] = useState<{ _id: string; subject: string; topics: { _id: string; topic: string }[] }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");

  // Fetch all subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/module/subject`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch subjects");
        setSubjects(data.subjects); // Update state with fetched subjects
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, [backendUrl]);

  // Add a new topic
  const addTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !selectedSubject) {
      alert("Topic name and selected subject are required");
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/module/topic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject: selectedSubject, topic: newTopic }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add topic");

      // Update the state with the new topic
      setSubjects((prevSubjects) =>
        prevSubjects.map((s) =>
          s.subject === selectedSubject ? { ...s, topics: [...s.topics, { _id: data.topic._id, topic: newTopic }] } : s
        )
      );
      setNewTopic(""); // Clear input field
    } catch (error) {
      console.error("Error adding topic:", error);
    }
  };

  // Delete a topic
  const deleteTopic = async (subjectName: string, topicName: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/module/topic`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject: subjectName, topic: topicName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete topic");

      // Remove the topic from the state
      setSubjects((prevSubjects) =>
        prevSubjects.map((s) =>
          s.subject === subjectName
            ? { ...s, topics: s.topics.filter((t) => t.topic !== topicName) }
            : s
        )
      );
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  return (
    <div>
      {/* Add Topic Form */}
      <form onSubmit={addTopic} className="flex items-center space-x-2 mb-4">
        {/* Select Subject */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border border-gray-300 p-2 rounded-md text-sm"
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject._id} value={subject.subject}>
              {subject.subject}
            </option>
          ))}
        </select>

        {/* Input for New Topic */}
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Enter new topic"
          className="border border-gray-300 p-2 rounded-md flex-grow text-sm focus:outline-none focus:border-blue-500"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
        >
          Add Topic
        </button>
      </form>

      {/* Topics List */}
      <div>
        {subjects.length === 0 ? (
          <p>No subjects available.</p>
        ) : (
          subjects.map((subject) => (
            <div key={subject._id} className="mb-4 text-xl">
              <h3 className="font-bold">{subject.subject}</h3>
              {subject.topics.length === 0 ? (
                <p>No topics available for this subject.</p>
              ) : (
                <ul>
                  {subject.topics.map((topic) => (
                    <li key={topic._id} className="flex items-center justify-between mb-2">
                      <span>{topic.topic}</span>
                      <button
                        onClick={() => deleteTopic(subject.subject, topic.topic)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};