// Character.js

import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
});

const Character = mongoose.model("Character", characterSchema);

export default Character;
