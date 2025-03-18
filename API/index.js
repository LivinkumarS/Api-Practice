import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRouter from "./routers/authRouter.js";
import postRouter from "./routers/postRouter.js";

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL, 
    credentials: true, 
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connected");
  } catch (err) {
    console.log(err);
  }
}

connectDB();

app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);

app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
