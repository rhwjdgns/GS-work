// char.router.js

import express from "express";
import Joi from "joi";
import {
  Character,
  createCharacter,
  isConnected,
  connect,
} from "../schemas/database.js";

const router = express.Router();

router.post("/char", async (req, res, next) => {
  const { name } = req.body;

  try {
    // Database 연결 확인
    if (!isConnected()) {
      await connect(); // 연결되어 있지 않다면 데이터베이스에 연결
    }

    const createdCharSchema = Joi.object({
      name: Joi.string().required(),
      value: Joi.string().allow(),
    });

    const validation = await createdCharSchema.validateAsync(req.body);

    const { value } = validation;

    if (!value) {
      return res.status(400).json({
        errorMessage: "(value) 데이터가 존재하지 않습니다.",
      });
    }

    // 중복된 이름의 캐릭터가 있는지 확인
    const existingCharacter = await Character.findOne({ name });

    if (existingCharacter) {
      return res
        .status(400)
        .json({ error: "이미 존재하는 캐릭터 이름입니다." });
    }

    // MongoDB에 새로운 캐릭터 생성
    const newCharacterId = await createCharacter(name);

    res.status(201).json({
      message: "캐릭터가 생성되었습니다.",
      character_id: newCharacterId,
    });
  } catch (error) {
    console.error("캐릭터 생성 중 에러:", error);
    res.status(500).json({ error: "서버 에러 발생" });
  }
});

export default router;
