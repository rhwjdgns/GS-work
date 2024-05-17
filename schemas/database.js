import mongoose from "mongoose";
const { DB_USER, DB_PASS, DB_HOST, DB_NAME } = process.env;
const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

const sequenceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

const Sequence = mongoose.model("Sequence", sequenceSchema);

const characterSchema = new mongoose.Schema({
  character_id: { type: Number, required: true },
  name: { type: String, required: true },
  health: { type: Number, default: 500 },
  power: { type: Number, default: 100 },
});

const Character = mongoose.model("Character", characterSchema);

async function createCharacter(name) {
  try {
    const sequenceDoc = await Sequence.findByIdAndUpdate(
      "characterId",
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    const newCharacter = new Character({
      character_id: sequenceDoc.sequence_value,
      name: name,
    });

    await newCharacter.save();

    console.log("New character created:", newCharacter);

    return newCharacter.character_id;
  } catch (error) {
    console.error("Error creating character:", error);
    throw error;
  }
}

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

const isConnected = () => mongoose.connection.readyState === 1;

export { Character, createCharacter, isConnected, connect };
