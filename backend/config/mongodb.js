import mongoose from "mongoose";

export const connectDB = (uri) => {
    mongoose.connect(uri, {
        dbName: process.env.MONGO_DB_NAME,
    })
        .then((conn) => console.log(`DB connected to ${conn.connection.host}`))
        .catch((err) => console.log(err));
}