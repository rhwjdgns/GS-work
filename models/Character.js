import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
});

const Character = mongoose.model("Character", characterSchema);

export { Character }; // Character 모델을 명시적으로 내보냄
