import { useContext, useEffect, useState } from "react";
import { appContext } from "../../context/appContext";
import { saveAs } from "file-saver"; // For saving files
import { Document, Packer, Paragraph, TextRun } from "docx"; // For DOCX generation
import jsPDF from "jspdf"; // For PDF generation

export const QuestionsManagement = () => {
  const context = useContext(appContext);
  if (!context) {
    throw new Error("QuestionsManagement must be used within an AppContextProvider");
  }
  const { backendUrl } = context;

  // State for subjects, filters, search query, and selected questions
  interface Subject {
    _id: string;
    subject: string;
    topics: Topic[];
  }

  interface Topic {
    _id: string;
    topic: string;
    questions: Question[];
  }

  interface Question {
    _id: string;
    question: string;
    subject: string;
    topic: string;
    questionType: string;
    answer: string;
    explanation: string;
    options?: Option[];
  }

  interface Option {
    option: string;
    isCorrect: boolean;
  }

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedQuestionType, setSelectedQuestionType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]); // IDs of selected questions

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

        setSubjects(data.subjects);

        // Flatten the nested structure and add subject and topic info to each question
        const flattenedQuestions = data.subjects.flatMap((subject: { _id: string; subject: string; topics: { _id: string; topic: string; questions: any[] }[] }) =>
          subject.topics.flatMap((topic) =>
            topic.questions.map((question) => ({
              ...question,
              _id: question._id.toString(), // Ensure ID is a string
              subject: subject.subject,
              topic: topic.topic,
            }))
          )
        );
        setAllQuestions(flattenedQuestions); // Store all questions with subject and topic info
        setFilteredQuestions(flattenedQuestions); // Initialize filtered questions
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, [backendUrl]);

  // Filter questions based on selected filters and search query
  useEffect(() => {
    let filtered = [...allQuestions];

    // Apply subject filter
    if (selectedSubject) {
      filtered = filtered.filter((q) => q.subject === selectedSubject);
    }

    // Apply topic filter
    if (selectedTopic) {
      filtered = filtered.filter((q) => q.topic === selectedTopic);
    }

    // Apply question type filter
    if (selectedQuestionType) {
      filtered = filtered.filter((q) => q.questionType === selectedQuestionType);
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((q) => q.question.toLowerCase().includes(query));
    }

    setFilteredQuestions(filtered);
    setSelectedQuestions([]); // Reset selected questions when filters change
  }, [allQuestions, selectedSubject, selectedTopic, selectedQuestionType, searchQuery]);

  // Toggle selection of a single question
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prevSelected) =>
      prevSelected.includes(questionId)
        ? prevSelected.filter((id) => id !== questionId)
        : [...prevSelected, questionId]
    );
  };

  // Select/Deselect all questions
  const toggleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]); // Deselect all
    } else {
      setSelectedQuestions(filteredQuestions.map((q) => q._id)); // Select all
    }
  };

  // Delete selected questions
  const deleteSelectedQuestions = async () => {
    if (selectedQuestions.length === 0) {
      alert("No questions selected for deletion.");
      return;
    }
  
    try {
      console.log("Deleting Questions:", selectedQuestions); // Log the selected question IDs
  
      const response = await fetch(`${backendUrl}/api/module/questions/bulk`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ questionIds: selectedQuestions }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete questions");
  
      // Remove deleted questions from state
      setAllQuestions((prevQuestions) =>
        prevQuestions.filter((q) => !selectedQuestions.includes(q._id))
      );
      setFilteredQuestions((prevQuestions) =>
        prevQuestions.filter((q) => !selectedQuestions.includes(q._id))
      );
      setSelectedQuestions([]); // Clear selected questions
    } catch (error) {
      console.error("Error deleting questions:", error);
    }
  };
  // Function to download selected questions as a DOCX file
  const downloadSelectedAsDocx = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: filteredQuestions
            .filter((q) => selectedQuestions.includes(q._id))
            .map((question) => {
              const optionsText =
                question.options && question.options.length > 0
                  ? question.options
                      .map(
                        (option: { option: string; isCorrect: boolean }) =>
                          `${option.option} ${option.isCorrect ? "(Correct)" : ""}`
                      )
                      .join(", ")
                  : "No options available";

              return new Paragraph({
                children: [
                  new TextRun({ text: `Question: ${question.question}`, bold: true, size: 24 }),
                  new TextRun({ text: `\nSubject: ${question.subject}, Topic: ${question.topic}`, size: 20 }),
                  new TextRun({ text: `\nType: ${question.questionType}`, size: 20 }),
                  new TextRun({ text: `\nAnswer: ${question.answer}`, size: 20 }),
                  new TextRun({ text: `\nExplanation: ${question.explanation}`, size: 20 }),
                  new TextRun({ text: `\nOptions: ${optionsText}`, size: 20 }),
                  new TextRun({ text: "\n\n", size: 20 }),
                ],
              });
            }),
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "selected-questions.docx");
    });
  };

  // Function to download selected questions as a PDF file
  const downloadSelectedAsPdf = () => {
    const pdf = new jsPDF();
    let yPos = 10; // Initial vertical position
    const fontSize = 10; // Decreased font size for compactness
    pdf.setFontSize(fontSize);

    filteredQuestions
      .filter((q) => selectedQuestions.includes(q._id))
      .forEach((question) => {
        const optionsText =
          question.options && question.options.length > 0
            ? question.options
                .map(
                  (option: { option: string; isCorrect: boolean }) =>
                    `${option.option} ${option.isCorrect ? "(Correct)" : ""}`
                )
                .join(", ")
            : "No options available";

        pdf.text(`Question: ${question.question}`, 10, yPos);
        yPos += 5;
        pdf.text(`Subject: ${question.subject}, Topic: ${question.topic}`, 10, yPos);
        yPos += 5;
        pdf.text(`Type: ${question.questionType}`, 10, yPos);
        yPos += 5;
        pdf.text(`Answer: ${question.answer}`, 10, yPos);
        yPos += 5;
        pdf.text(`Explanation: ${question.explanation}`, 10, yPos);
        yPos += 5;
        pdf.text(`Options: ${optionsText}`, 10, yPos);
        yPos += 10; // Add space between questions

        // If the content exceeds the page height, add a new page
        if (yPos >= 270) {
          pdf.addPage();
          yPos = 10;
        }
      });

    pdf.save("selected-questions.pdf");
  };

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="mb-4">
      <div className="flex space-x-4 mb-4">
        <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="border border-gray-300 p-2 rounded-md w-1/4 text-sm focus:outline-none focus:border-blue-500"
        >
        <option value="">Filter by Subject</option>
        {subjects.map((subject) => (
          <option key={subject._id} value={subject.subject}>
          {subject.subject}
          </option>
        ))}
        </select>

        {/* Topic Filter */}
        <select
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
        className="border border-gray-300 p-2 rounded-md w-1/4 text-sm focus:outline-none focus:border-blue-500"
        >
        <option value="">Filter by Topic</option>
        {subjects
          .find((s) => s.subject === selectedSubject)?.topics.map((topic) => (
          <option key={topic._id} value={topic.topic}>
            {topic.topic}
          </option>
          ))}
        </select>

        {/* Question Type Filter */}
        <select
        value={selectedQuestionType}
        onChange={(e) => setSelectedQuestionType(e.target.value)}
        className="border border-gray-300 p-2 rounded-md w-1/4 text-sm focus:outline-none focus:border-blue-500"
        >
        <option value="">Filter by Question Type</option>
        <option value="text">Text</option>
        <option value="fileUpload">File Upload</option>
        <option value="optionsSingleCorrect">Single Correct Option</option>
        <option value="optionsMultipleCorrect">Multiple Correct Options</option>
        </select>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by question text..."
        className="border border-gray-300 p-2 rounded-md w-full text-sm focus:outline-none focus:border-blue-500"
      />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4 mb-4">
      <button
        onClick={toggleSelectAll}
        className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
      >
        {selectedQuestions.length === filteredQuestions.length ? "Deselect All" : "Select All"}
      </button>
      <button
        onClick={deleteSelectedQuestions}
        className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
      >
        Delete Selected
      </button>
      <button
        onClick={downloadSelectedAsDocx}
        className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
      >
        Download Selected as DOCX
      </button>
      <button
        onClick={downloadSelectedAsPdf}
        className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-600 transition-colors"
      >
        Download Selected as PDF
      </button>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
      <p>No questions available.</p>
      ) : (
      <ul className="space-y-4">
        {filteredQuestions.map((question) => (
        <li key={question._id} className="text-sm border-b border-gray-300 py-4">
          <div className="flex items-start space-x-4">
          <input
            type="checkbox"
            checked={selectedQuestions.includes(question._id)}
            onChange={() => toggleQuestionSelection(question._id)}
            className="h-4 w-4 text-blue-500 focus:ring-blue-400"
          />
          <div>
            <p className="font-bold">{question.question}</p>
            <p>Subject: {question.subject}, Topic: {question.topic}</p>
            <p>Type: {question.questionType}</p>
            <p>Answer: {question.answer}</p>
            <p>Explanation: {question.explanation}</p>
            {question.options && question.options.length > 0 && (
            <div>
              <p>Options:</p>
              <ul className="list-disc list-inside">
              {question.options.map((option: { option: string; isCorrect: boolean }, idx: number) => (
                <li key={idx}>
                {option.option} {option.isCorrect && "(Correct)"}
                </li>
              ))}
              </ul>
            </div>
            )}
          </div>
          </div>
        </li>
        ))}
      </ul>
      )}
    </div>
  );
};

export default QuestionsManagement;