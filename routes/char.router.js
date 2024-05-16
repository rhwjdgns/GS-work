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

// GET /api/characters
router.get("/characters", async (req, res) => {
  try {
    // MongoDB에서 모든 캐릭터를 조회합니다.
    const characters = await Character.find();

    // 조회된 캐릭터 목록을 클라이언트에게 반환합니다.
    res.status(200).json({ characters });
  } catch (error) {
    // 에러가 발생한 경우 서버 에러를 반환합니다.
    console.error("캐릭터 조회 중 에러:", error);
    res.status(500).json({ error: "서버 에러 발생" });
  }
});

// DELETE
router.delete("/characters/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // MongoDB에서 해당 ID를 가진 캐릭터를 찾아 삭제합니다.
    const deletedCharacter = await Character.findByIdAndDelete(id);

    if (!deletedCharacter) {
      // 삭제된 캐릭터가 없을 경우
      return res
        .status(404)
        .json({ error: "삭제할 캐릭터를 찾을 수 없습니다." });
    }

    // 삭제 성공 시 응답
    res.status(200).json({ message: "캐릭터가 성공적으로 삭제되었습니다." });
  } catch (error) {
    // 서버 에러 처리
    console.error("캐릭터 삭제 중 에러:", error);
    res.status(500).json({ error: "서버 에러 발생" });
  }
});

export default router;
