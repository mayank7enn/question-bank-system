import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import { connectDB } from './config/mongodb.js';
import moduleRouter from './routes/moduleRoutes.js';
import { userAuth } from './middleware/userAuth.js';


const app = express();
const Port = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI);

const allowedOrigins = ['http://localhost:5173'];
app.use(cors({origin: allowedOrigins, credentials: true}));
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send('This is the basic home page where we would implement all the basic operations for the authentication and authorisation of the user')
})
app.use('/api/auth', authRouter)
app.use('/api/module', userAuth, moduleRouter)

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});
