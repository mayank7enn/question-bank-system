import { roleModel, subjectModel, userModel, userRoleModel } from "../models/userModel.js";



// ---------------- ROLE CONTROLLERS ----------------
export const addRole = async (req, res) => {
    try {
        const role = new roleModel(req.body);
        await role.save();
        res.status(201).send({
            sucess: true,
            message: "Role added successfully",
            role,
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Role not added",
            error: error.message,
        });
    }
};

export const deleteRole = async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Debugging log
        console.log(req.body)

        const { role } = req.body; // Get roleId from the request body

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "role is required",
            });
        }

        const deletedRole = await roleModel.findOneAndDelete({ role: role });
        if (!deletedRole) {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Role removed successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Role not removed",
            error: error.message,
        });
    }
};


export const getRoles = async (req, res) => {
    try {
        const roles = await roleModel.find({})
        if (roles.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No roles found in the database",
            });
        }
        res.status(200).send({
            success: true,
            message: "Roles fetched successfully",
            roles,
        });

    } catch (error) {
        res.status(400).send({
            success: false,
            message: "Error in fetching roles",
            error: error.message,
        });
    }
}

export const setRole = async (req, res) => {
    try {
        const { userId, roleId } = req.body; // Get userId and roleId from request
        console.log(req.body)
        // Check if the user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        console.log(user)
        // Check if the role exists
        const role = await roleModel.findById(roleId);
        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found",
            });
        }
        console.log(role)
        // Check if the user already has this role
        const existingUserRole = await userRoleModel.findOne({ user: userId, role: roleId });
        if (existingUserRole) {
            return res.status(400).json({
                success: false,
                message: "User already has this role",
            });
        }

        // Assign the role to the user
        const userRole = new userRoleModel({ user: userId, role: roleId });
        await userRole.save();

        res.status(201).json({
            success: true,
            message: "Role assigned successfully",
            userRole,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error assigning role",
            error: error.message,
        });
    }
};

// ---------------- SUBJECT, TOPIC, QUESTION CONTROLLERS ----------------
//----------------- SUBJECT -----------------------

export const addSubject = async (req, res) => {
    try {
        const subject = new subjectModel({ ...req.body, topics: [] });
        await subject.save();
        res.status(201).send({ success: true, message: "Subject added successfully", subject });
    } catch (error) {
        res.status(400).send({ success: false, message: "Subject not added", error: error.message });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const subject = await subjectModel.findOneAndDelete({ subject: req.body.subject });
        if (!subject) return res.status(404).send({ success: false, message: "Subject not found" });
        res.status(200).send({ success: true, message: "Subject removed successfully" });
    } catch (error) {
        res.status(400).send({ success: false, message: "Subject not removed", error: error.message });
    }
};

//----------------- TOPIC ------------------------
export const addTopic = async (req, res) => {
    try {
        const subject = await subjectModel.findOne({ subject: req.body.subject });

        if (!subject) {
            return res.status(404).send({ success: false, message: "Subject not found" });
        }

        // Check if the topic already exists in the subject
        const topicExists = subject.topics.some(t => t.topic.toLowerCase() === req.body.topic.toLowerCase());
        if (topicExists) {
            return res.status(400).send({ success: false, message: "Topic already exists in this subject" });
        }

        // Add the new topic
        subject.topics.push({ topic: req.body.topic, questions: [] });
        await subject.save();

        res.status(201).send({ success: true, message: "Topic added successfully", subject });
    } catch (error) {
        res.status(400).send({ success: false, message: "Topic not added", error: error.message });
    }
};



export const deleteTopic = async (req, res) => {
    try {
        const { subject, topic } = req.body;

        if (!subject || !topic) {
            return res.status(400).json({
                success: false,
                message: "Subject and topic are required",
            });
        }

        // Find subject (by name if it's stored as a name, or by ID if it's an ObjectId)
        const subjectDoc = await subjectModel.findOne({ subject }) || await subjectModel.findById(subject);
        if (!subjectDoc) {
            return res.status(404).json({
                success: false,
                message: "Subject not found",
            });
        }

        // Find topic (by name if stored as a name, or by _id if stored as an ObjectId)
        const topicIndex = subjectDoc.topics.findIndex(t =>
            t._id?.toString() === topic || t.topic?.toLowerCase() === topic.toLowerCase()
        );

        if (topicIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Topic not found in the subject",
            });
        }

        // Remove the topic
        subjectDoc.topics.splice(topicIndex, 1);
        await subjectDoc.save();

        res.status(200).json({
            success: true,
            message: "Topic deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting topic",
            error: error.message,
        });
    }
};



// ---------------- QUESTION CONTROLLERS ----------------
export const addQuestion = async (req, res) => {
    try {
        const { subjectId, topicName, question, questionType, answer, explanation, options } = req.body;

        // Check if all required fields are provided
        if (!subjectId || !topicName || !question || !questionType || !answer || !explanation) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Fetch subject
        const subject = await subjectModel.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        // Find the topic within the subject
        const topic = subject.topics.find(t => t.topic === topicName);
        if (!topic) {
            return res.status(404).json({ success: false, message: "Topic not found" });
        }

        // Check if the question already exists in the topic
        const existingQuestion = topic.questions.find(q => q.question === question);
        if (existingQuestion) {
            return res.status(400).json({ success: false, message: "Question already exists in this topic" });
        }

        // Validation based on question type
        if (["text", "fileUpload"].includes(questionType)) {
            if (options && options.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Options should not be provided for 'text' or 'fileUpload' question types",
                });
            }
        } else if (["optionsSingleCorrect", "optionsMultipleCorrect"].includes(questionType)) {
            if (!options || options.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "At least two options are required for multiple-choice questions",
                });
            }

            // Ensure at least one correct answer is marked
            const correctOptions = options.filter(opt => opt.isCorrect);
            if (questionType === "optionsSingleCorrect" && correctOptions.length !== 1) {
                return res.status(400).json({
                    success: false,
                    message: "Exactly one correct answer is required for single-correct options questions",
                });
            } else if (questionType === "optionsMultipleCorrect" && correctOptions.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "At least two correct answers are required for multiple-correct options questions",
                });
            }
        }

        // Add the question to the topic
        topic.questions.push({ question, questionType, answer, explanation, options: options || [] });
        await subject.save();

        res.status(201).json({ success: true, message: "Question added successfully", subject });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding question", error: error.message });
    }
};

export const addQuestionsInBulk = async (req) => {
    try {
        const { questions } = req.body;

        // Check if the request contains an array of questions
        if (!Array.isArray(questions) || questions.length === 0) {
            return {
                statusCode: 400,
                body: {
                    success: false,
                    message: "Please provide a non-empty array of questions.",
                },
            };
        }

        // Array to track errors for individual questions
        const errors = [];
        const successfullyAddedQuestions = [];

        // Process each question in the array
        for (const [index, questionData] of questions.entries()) {
            const {
                subjectName,
                topicName,
                question,
                questionType,
                answer,
                explanation,
                options,
            } = questionData;

            try {
                // Validate required fields
                if (
                    !subjectName ||
                    !topicName ||
                    !question ||
                    !questionType ||
                    !answer ||
                    !explanation
                ) {
                    throw new Error(`Question ${index + 1}: All fields are required.`);
                }

                // Find or create the subject
                let subject = await subjectModel.findOne({ subject: subjectName });
                if (!subject) {
                    // Create a new subject if it doesn't exist
                    subject = await subjectModel.create({ subject: subjectName, topics: [] });
                }

                // Find or create the topic within the subject
                let topic = subject.topics.find((t) => t.topic === topicName);
                if (!topic) {
                    // Create a new topic if it doesn't exist
                    topic = { topic: topicName, questions: [] };
                    subject.topics.push(topic);
                    await subject.save();
                }

                // Check if the question already exists in the topic
                const existingQuestion = topic.questions.find((q) => q.question === question);
                if (existingQuestion) {
                    throw new Error(`Question ${index + 1}: Question already exists in this topic.`);
                }

                // Validation based on question type
                if (["text", "fileUpload"].includes(questionType)) {
                    if (options && options.length > 0) {
                        throw new Error(
                            `Question ${index + 1}: Options should not be provided for 'text' or 'fileUpload' question types.`
                        );
                    }
                } else if (["optionsSingleCorrect", "optionsMultipleCorrect"].includes(questionType)) {
                    if (!options || options.length < 2) {
                        throw new Error(
                            `Question ${index + 1}: At least two options are required for multiple-choice questions.`
                        );
                    }

                    // Ensure at least one correct answer is marked
                    const correctOptions = options.filter((opt) => opt.isCorrect);
                    if (questionType === "optionsSingleCorrect" && correctOptions.length !== 1) {
                        throw new Error(
                            `Question ${index + 1}: Exactly one correct answer is required for single-correct options questions.`
                        );
                    } else if (questionType === "optionsMultipleCorrect" && correctOptions.length < 2) {
                        throw new Error(
                            `Question ${index + 1}: At least two correct answers are required for multiple-correct options questions.`
                        );
                    }
                }

                // Add the question to the topic
                topic.questions.push({ question, questionType, answer, explanation, options: options || [] });
                successfullyAddedQuestions.push(question);

                // Save the updated subject
                await subject.save();
            } catch (error) {
                // Log the error for this specific question
                errors.push({ index: index + 1, message: error.message });
            }
        }

        // Respond with results
        if (errors.length > 0) {
            return {
                statusCode: 207,
                body: {
                    success: false,
                    message: "Some questions were not added due to errors.",
                    successfullyAdded: successfullyAddedQuestions.length,
                    errors,
                },
            };
        }

        return {
            statusCode: 201,
            body: {
                success: true,
                message: "All questions added successfully.",
                totalQuestionsAdded: successfullyAddedQuestions.length,
            },
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: {
                success: false,
                message: "Error during bulk upload.",
                error: error.message,
            },
        };
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { subjectId, topicName, questionId } = req.body;
        const subject = await subjectModel.findById(subjectId);
        if (!subject) return res.status(404).send({ success: false, message: "Subject not found" });
        const topic = subject.topics.find(t => t.topic === topicName);
        if (!topic) return res.status(404).send({ success: false, message: "Topic not found" });
        topic.questions = topic.questions.filter(q => q._id.toString() !== questionId);
        await subject.save();
        res.status(200).send({ success: true, message: "Question removed successfully" });
    } catch (error) {
        res.status(400).send({ success: false, message: "Question not removed", error: error.message });
    }
};

export const deleteQuestionsInBulk = async (req, res) => {
    try {
        const { questionIds } = req.body;

        // Validate input
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide a non-empty array of question IDs." });
        }

        // Find all subjects that contain the questions to be deleted
        const subjects = await subjectModel.find({
            "topics.questions._id": { $in: questionIds },
        });

        if (!subjects || subjects.length === 0) {
            return res.status(404).json({ success: false, message: "No matching questions found." });
        }

        // Remove the questions from their respective topics
        subjects.forEach((subject) => {
            subject.topics.forEach((topic) => {
                topic.questions = topic.questions.filter((q) => !questionIds.includes(q._id.toString()));
            });
        });

        // Save the updated subjects
        await Promise.all(subjects.map((subject) => subject.save()));

        res.status(200).json({
            success: true,
            message: "Questions deleted successfully.",
            deletedCount: questionIds.length,
        });
    } catch (error) {
        console.error("Error during bulk delete:", error);
        res.status(500).json({ success: false, message: "An error occurred during the delete process.", error: error.message });
    }
}
export const getAllSubjects = async (req, res) => {
    try {
        const subjects = await subjectModel.find({});
        if (!subjects.length) return res.status(404).send({ success: false, message: "No subjects found" });
        res.status(200).send({ success: true, message: "Subjects fetched successfully", subjects });
    } catch (error) {
        res.status(400).send({ success: false, message: "Error fetching subjects", error: error.message });
    }
};