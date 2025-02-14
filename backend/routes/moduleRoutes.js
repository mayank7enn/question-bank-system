import express from 'express';
import multer from 'multer'; // For handling file uploads
import Papa from 'papaparse'; // For parsing CSV files
import { addQuestion, addQuestionsInBulk, addRole, addSubject, addTopic, deleteQuestionsInBulk, deleteRole, deleteSubject, deleteTopic, getAllSubjects, getRoles, setRole } from '../controllers/moduleController.js';
import { userAuth } from '../middleware/userAuth.js';

const moduleRouter = express.Router();

// Configure multer for file uploads
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // Limit file size to 5MB

// Existing routes
moduleRouter
  .post('/role', addRole)
  .get('/role', getRoles)
  .delete('/role', deleteRole);

moduleRouter.post('/set-role', setRole);

moduleRouter
  .get('/subject', getAllSubjects)
  .post('/subject', addSubject)
  .delete('/subject', deleteSubject);

moduleRouter
  .post('/topic', addTopic)
  .delete('/topic', deleteTopic);

moduleRouter.post('/question', addQuestion);

moduleRouter.post('/question/bulk', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    // Parse the file content based on its type
    let parsedData;
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      try {
        parsedData = JSON.parse(file.buffer.toString());
      } catch (error) {
        console.error("JSON Parsing Error:", error);
        return res.status(400).json({ success: false, message: "Invalid JSON file format." });
      }
    } else if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      try {
        const csvContent = file.buffer.toString();
        console.log("Raw CSV Content:", csvContent); // Debugging log

        parsedData = Papa.parse(csvContent, { header: true, skipEmptyLines: true }).data.map((row) => {
          let options = [];
          try {
            options = row.options ? JSON.parse(row.options.replace(/""/g, '"')) : [];
          } catch (error) {
            console.error("Error parsing options JSON:", error, "Data:", row.options);
          }
        
          return {
            subjectName: row.subjectName.trim().toLowerCase(),
            topicName: row.topicName.trim().toLowerCase(),
            question: row.question.trim(),
            questionType: row.questionType.trim(),
            answer: row.answer.trim(),
            explanation: row.explanation.trim(),
            options, // Corrected parsing
          };
        });
        

        console.log("Parsed CSV Data:", parsedData); // Debugging log
      } catch (error) {
        console.error("CSV Parsing Error:", error); // Debugging log
        return res.status(400).json({ success: false, message: "Invalid CSV file format." });
      }
    } else {
      return res.status(400).json({ success: false, message: "Unsupported file format. Please upload a JSON or CSV file." });
    }

    // Validate the parsed data
    if (
      !Array.isArray(parsedData) ||
      !parsedData.every(
        (q) =>
          q.subjectName &&
          q.topicName &&
          q.question &&
          q.questionType &&
          q.answer &&
          q.explanation &&
          Array.isArray(q.options)
      )
    ) {
      console.error("Validation Failed for Parsed Data:", parsedData); // Debugging log
      return res.status(400).json({ success: false, message: "Invalid data structure in the uploaded file." });
    }

    // Call the bulk upload controller with the parsed data
    const response = await addQuestionsInBulk({ body: { questions: parsedData } });
    res.status(response.statusCode).json(response.body);
  } catch (error) {
    console.error("Error during bulk upload:", error);
    res.status(500).json({ success: false, message: "An error occurred during the upload process.", error: error.message });
  }
});

moduleRouter.delete('/questions/bulk', deleteQuestionsInBulk);

export default moduleRouter