// ../schemas/database.js

import mongoose from "mongoose";

// 시퀀스를 저장할 컬렉션 스키마 정의
const sequenceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

// 시퀀스 모델 생성
const Sequence = mongoose.model("Sequence", sequenceSchema);

// Character 스키마 정의
const characterSchema = new mongoose.Schema({
  character_id: { type: Number, required: true },
  name: { type: String, required: true },
  health: { type: Number, default: 500 }, // health를 추가하고 기본값 설정
  power: { type: Number, default: 100 }, // power를 추가하고 기본값 설정
});

// Character 모델 생성
const Character = mongoose.model("Character", characterSchema);

// 캐릭터 생성 시 character_id 부여하는 함수
async function createCharacter(name) {
  try {
    // 다음 character_id 값 가져오기
    const sequenceDoc = await Sequence.findByIdAndUpdate(
      "characterId",
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    // 가져온 character_id로 캐릭터 생성
    const newCharacter = new Character({
      character_id: sequenceDoc.sequence_value,
      name: name,
    });

    // 캐릭터 저장
    await newCharacter.save();

    console.log("New character created:", newCharacter);

    // 생성된 캐릭터의 ID 반환
    return newCharacter.character_id;
  } catch (error) {
    console.error("Error creating character:", error);
    throw error; // 에러를 상위로 전파
  }
}

// MongoDB와의 연결 함수
const connect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://sparta-user:aaaa4321@cluster0.w7alnza.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        dbName: "charMemo",
      }
    );
    console.log("MongoDB 연결에 성공하였습니다.");
  } catch (error) {
    console.error("MongoDB 연결에 실패하였습니다:", error);
    throw error; // 에러를 상위로 전파
  }
};

// MongoDB 연결 상태 확인 함수
const isConnected = () => mongoose.connection.readyState === 1;

export { Character, createCharacter, isConnected, connect };
