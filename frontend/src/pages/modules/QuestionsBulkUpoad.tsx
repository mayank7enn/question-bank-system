import { useContext, useState } from "react";
import { appContext } from "../../context/appContext";
import axios from "axios";

const QuestionsBulkUpload = () => {
  const context = useContext(appContext);
  if (!context) {
    throw new Error("QuestionsBulkUpload must be used within an AppContextProvider");
  }
  const { backendUrl } = context;
  // State for file input and error messages
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      console.log("Selected File:", selectedFile); // Debugging log
      setFile(selectedFile);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    console.log("FormData:", formData); // Debugging log

    try {
      console.log(backendUrl)
      const response = await axios.post(`${backendUrl}/api/module/question/bulk`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Backend Response:", response.data); // Debugging log
      if (response.data.success) {
        setUploadStatus(`Questions uploaded successfully! Total: ${response.data.totalQuestionsAdded}`);
      } else {
        setUploadStatus("Some questions were not added due to errors.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error during bulk upload:", error.response?.data || error.message); // Debugging log
      } else {
        console.error("Error during bulk upload:", error); // Debugging log
      }
      setUploadStatus("An error occurred during the upload process.");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Bulk Upload Questions</h2>

      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Select File</label>
        <input
          type="file"
          accept=".json,.csv"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        />
      </div>

      {/* Upload Button */}
      <button
        onClick={handleBulkUpload}
        className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
      >
        Upload Questions
      </button>

      {/* Status Message */}
      {uploadStatus && (
        <p className={`mt-4 text-sm ${uploadStatus.includes("successfully") ? "text-green-500" : "text-red-500"}`}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
};

export default QuestionsBulkUpload;