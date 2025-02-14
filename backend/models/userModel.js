import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    photo: { type: String, default: '' },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: '' },
    verifyOtpExpiredAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: '' },
    resetOtpExpiredAt: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const roleSchema = new mongoose.Schema({
    role: { type: String, required: true },
});

const userRoleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    role: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Role' },
});

// Embedded Question Schema
const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    questionType: { type: String, required: true, enum: ['text', 'optionsSingleCorrect', 'optionsMultipleCorrect', 'fileUpload'] },
    answer: { type: String, required: true },
    explanation: { type: String, required: true },
    options: [{
        option: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Embedded Topic Schema
const topicSchema = new mongoose.Schema({
    topic: { type: String, required: true, unique: true },
    questions: [questionSchema] // Embedding questions inside topics
});

const subjectSchema = new mongoose.Schema({
    subject: { type: String, required: true, unique: true },
    topics: [topicSchema],
});

export const userModel = mongoose.models.user || mongoose.model('User', userSchema);
export const roleModel = mongoose.models.role || mongoose.model('Role', roleSchema);
export const userRoleModel = mongoose.models.userRole || mongoose.model('UserRole', userRoleSchema);
export const subjectModel = mongoose.models.subject || mongoose.model('Subject', subjectSchema);
