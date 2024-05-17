import mongoose from "mongoose";

// 환경 변수에서 DB_USER, DB_PASS, DB_HOST, DB_NAME 값을 추출하여 객체 해체 할당합니다.
// 이 값들은 MongoDB URI를 구성하는 데 사용됩니다.
// 위에서 추출한 환경 변수를 사용하여 MongoDB URI를 생성합니다.
// 이 URI에는 데이터베이스에 연결하는 데 필요한 인증 및 호스트 정보가 포함되어 있습니다.
// MongoDB의 sequence 컬렉션에 대한 스키마를 정의합니다.
// 이 스키마에는 _id와 sequence_value 필드가 포함됩니다.
const { DB_USER, DB_PASS, DB_HOST, DB_NAME } = process.env;
const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

const sequenceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

// mongoose의 model() 메서드를 사용하여 sequenceSchema를 기반으로 Sequence 모델을 정의합니다.
// 이 모델은 MongoDB의 sequences 컬렉션과 상호 작용하는데 사용됩니다.
// MongoDB의 character 컬렉션에 대한 스키마를 정의합니다.
// 이 스키마에는 character_id, name, health, power 필드가 포함됩니다.
// character_id와 name 필드는 필수이며, health와 power 필드는 기본값을 가집니다.
const Sequence = mongoose.model("Sequence", sequenceSchema);

const characterSchema = new mongoose.Schema({
  character_id: { type: Number, required: true },
  name: { type: String, required: true },
  health: { type: Number, default: 500 },
  power: { type: Number, default: 100 },
});

// mongoose의 model() 메서드를 사용하여 characterSchema를 기반으로 Character 모델을 정의합니다.
// 이 모델은 MongoDB의 characters 컬렉션과 상호 작용하는데 사용됩니다.
// 새로운 캐릭터를 생성하는 비동기 함수를 정의합니다.
// 먼저, Sequence 모델을 사용하여 MongoDB에서 sequence 값을 찾고 업데이트 합니다.
// findByIdAndUpdate() 메소드는 characterId 를 찾아서 해당 문서를 업데이트하고, 만약 찾지 못하면 새로운 문서를 생성합니다.
// 업데이트된 문서는 sequenceDoc 변수에 저장됩니다.
const Character = mongoose.model("Character", characterSchema);

async function createCharacter(name) {
  try {
    const sequenceDoc = await Sequence.findByIdAndUpdate(
      "characterId",
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    // 위에서 얻은 sequenceDoc 에서 캐릭터의 ID와 입력된 이름(name)을 사용하여 새로운 캐릭터를 생성합니다.
    // new Character()를 통해 새로운 캐릭터의 인스턴스를 생성하고, 이를 newCharacter 변수에 저장합니다.
    const newCharacter = new Character({
      character_id: sequenceDoc.sequence_value,
      name: name,
    });

    // save() 메소드를 사용하여 새로운 캐릭터를 MongoDB에 저장합니다.
    // 그리고 생성된 캐릭터의 정보를 콘솔에 출력하고, 생성된 캐릭터의 ID를 반환합니다.
    await newCharacter.save();
    console.log("New character created:", newCharacter);
    return newCharacter.character_id;
    // 오류발생
  } catch (error) {
    console.error("Error creating character:", error);
    throw error;
  }
}

// 이 함수는 MongoDB에 연결하는 데 사용됩니다.
// mongoose.connect()를 사용하여 MongoDB에 연결합니다.
// 연결에 성공하면 콘솔에 MongoDB 연결에 성공하였습니다. 출력
// 실패하면 오류를 콘솔에 출력
const connect = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
    });
    console.log("MongoDB 연결에 성공하였습니다.");
  } catch (error) {
    console.error("MongoDB 연결에 실패하였습니다:", error);
    throw error;
  }
};

// 이 함수는 현재 MongoDB 연결 상태를 확인합니다.
// mongoose.connection.readyState는 현재 연결 상태를 나타내는 속성입니다.
// 1은 연결이 열려있음을 의미합니다.
const isConnected = () => mongoose.connection.readyState === 1;

export { Character, createCharacter, isConnected, connect };
