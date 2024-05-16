// models.js

import mongoose from "mongoose";

const sequenceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});
const Sequence = mongoose.model("Sequence", sequenceSchema);

const characterSchema = new mongoose.Schema({
  character_id: { type: Number, required: true },
  name: { type: String, required: true },
});
const Character = mongoose.model("Character", characterSchema);

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
  } catch (error) {
    console.error("Error creating character:", error);
  }
}

export { Character, Sequence, createCharacter };
