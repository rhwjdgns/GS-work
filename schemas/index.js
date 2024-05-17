import mongoose from "mongoose";

// connect 함수를 선언합니다.
// 이 함수는 MongoDB에 연결하고 연결 상태를 확인합니다.
// mongoose를 사용하여 MongoDB에 연결합니다.
// 연결이 성공하면 "MongoDB 연결에 성공하였습니다." 라는 메시지를 출력하고, 연결이 실패하면 해당 오류를 콘솔에 출력
// MongoDB 연결 중에 오류가 발생하면 해당 오류를 콘솔에 출력합니다.
const connect = () => {
  mongoose
    .connect(
      "mongodb+srv://sparta-user:aaaa4321@cluster0.w7alnza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        dbName: "charMemo",
      }
    )
    .then(() => console.log("MongoDB 연결에 성공하였습니다."))
    .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB 연결 에러", err);
});

export default connect;
