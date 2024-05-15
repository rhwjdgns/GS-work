import express from "express";
import Joi from "joi";
import Character from "../models/Character.js";

const router = express.Router();

// POST /api/chars
router.post("/char", async (req, res, next) => {
  const { name } = req.body;

  try {
    const schema = Joi.object({
      name: Joi.string().required(),
    });

    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
      return res
        .status(400)
        .json({ error: validationResult.error.details[0].message });
    }

    // 중복된 이름의 캐릭터가 있는지 확인
    const existingCharacter = await Character.findOne({ name });
    if (existingCharacter) {
      return res
        .status(400)
        .json({ error: "이미 존재하는 캐릭터 이름입니다." });
    }

    // MongoDB에 새로운 캐릭터 생성
    const newCharacter = new Character({ name });
    await newCharacter.save();

    res
      .status(201)
      .json({ message: "캐릭터가 생성되었습니다.", character: newCharacter });
  } catch (error) {
    console.error("캐릭터 생성 중 에러:", error);
    res.status(500).json({ error: "서버 에러 발생" });
  }
});

export default router;
