import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

// MongoDB 연결 함수
const connect = () => {
  const dbUser = process.env.DB_USER;
  const dbPass = process.env.DB_PASS;
  const dbHost = process.env.DB_HOST;
  const dbName = process.env.DB_NAME;

  const mongoUri = `mongodb+srv://${dbUser}:${dbPass}@${dbHost}/?retryWrites=true&w=majority&appName=${dbName}`;

  mongoose
    .connect(mongoUri, {
      dbName: dbName,
    })
    .then(() => console.log("MongoDB 연결에 성공하였습니다."))
    .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

// MongoDB에 연결
connect();

// 라우팅 설정
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
