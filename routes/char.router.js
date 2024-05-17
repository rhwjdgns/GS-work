// Express 모듈을 가져옵니다. 이를 통해 서버를 생성하고 라우팅을 설정할 수 있습니다.
// joi 모듈을 가져옵니다. 이는 데이터의 유효성을 검사하기 위해 사용됩니다.
// ../schemas/database.js 파일에서 함수들을 가져옵니다.
import express from "express";
import Joi from "joi";
import {
  Character,
  createCharacter,
  isConnected,
  connect,
} from "../schemas/database.js";

// Express의 Router 객체를 사용하여 새로운 라우터를 생성합니다.
// 이 라우터는 라우팅을 정의하는 데 사용됩니다.
const router = express.Router();

// POST 메서드로 "/char" 엔드포인트를 처리하는 라우터 핸들러를 정의합니다.
// 이 핸들러는 비동기 함수로 정의되어 있습니다.
// 클라이언트에서 요청이 들어오면 이 함수가 실행됩니다.
// 요청 객체(req)에서 body 에서 name 속성을 추출하여 name 변수에 할당합니다.
// 이는 클라이언트가 POST 요청으로 전송한 데이터에서 이름을 가져옵니다.
// 에러가 발생할 수 있는 코드 블록을 시도합니다.
// 데이터베이스가 연결되어 있는지 확인합니다.
// isConnected() 함수는 데이터베이스 연결 상태를 확인하는 함수입니다.
// 데이터베이스에 연결되어 있지 않은 경우 connect() 함수를 호출하여 데이터베이스에 연결합니다.
// await 키워드는 비동기 함수에서 프로미스의 결과를 기다리는 데 사용됩니다.
router.post("/char", async (req, res, next) => {
  const { name } = req.body;

  try {
    if (!isConnected()) {
      await connect();
    }
    // Joi를 사용하여 name 속성이 반드시 있고 문자열이어야 함을 정의하는 스키마를 생성합니다.
    // validateAsync 메서드를 사용하여 요청의 본문(body)에 대해 스키마 유효성 검사를 수행합니다.
    // 이는 클라이언트가 제출한 데이터의 형식이 올바른지 확인합니다.
    const createdCharSchema = Joi.object({
      name: Joi.string().required(),
    });

    // 이미 캐릭터가 존재하는 경우,
    // 클라이언트에게 400 상태코드와 "이미 존재하는 캐릭터 이름입니다."
    // 메시지를 반환합니다. 이는 캐릭터 이름의 중복을 방지하기 위한 것입니다.
    const existingCharacter = await Character.findOne({ name });

    if (existingCharacter) {
      return res
        .status(400)
        .json({ error: "이미 존재하는 캐릭터 이름입니다." });
    }

    // createCharacter 함수 호출을 통해 주어진 이름으로 새로운 캐릭터를 생성하고,
    // 생성된 캐릭터의 ID를 newCharacterId 변수에 저장
    // 201 상태 코드(성공적으로 생성됨)와 함께 캐릭터 생성 성공 메시지 및 생성된
    // 캐릭터의 ID를 클라이언트에 JSON 형식으로 반환
    // try 블록 내에서 에러가 발생하면 catch 블록이 실행
    // 500 상태 코드(서버 에러)와 함께 "서버 에러 발생" 메시지를 클라이언트에 JSON형식으로 반환
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

// /characters 경로에 대한 GET 요청을 처리하는 비동기 함수
// 데이터베이스에서 모든 캐릭터를 조회하여 characters 변수에 저장
// 200 상태 코드(성공)와 함께 조회된 캐릭터들을 JSON 형식으로 클라이언트에 반환
router.get("/characters", async (req, res) => {
  try {
    const characters = await Character.find();

    res.status(200).json({ characters });
  } catch (error) {
    console.error("캐릭터 조회 중 에러:", error);
    res.status(500).json({ error: "서버 에러 발생" });
  }
});

// /characters/:id 경로에 대한 DELETE 요청을 처리하는 비동기 함수.
// :id는 URL 매개변수로 전달
// URL 매개변수에서 di 를 추출하여 id 변수에 저장
// MongoDB에서 해당 ID를 가진 캐릭터를 찾아 삭제하고,
// 결과를 deletedCharacter 변수에 저장
// 삭제된 캐릭터가 없는 경우(즉, 해당ID를 가진 캐릭터를 찾지 못한 경우)를 확인
// 404 상태 코드(찾을 수 없음)와 함께 "삭제할 캐릭터를 찾을 수 없습니다."
// 라는 에러 메시지를 JSON 형식으로 클라이언트에 반환
router.delete("/characters/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCharacter = await Character.findByIdAndDelete(id);

    if (!deletedCharacter) {
      return res
        .status(404)
        .json({ error: "삭제할 캐릭터를 찾을 수 없습니다." });
    }

    // 삭제가 성공하면 200 상태 코드와 함께 "캐릭터가 성공적으로 삭제되었습니다."
    // 라는 메시지를 JSON 형식으로 클라이언트에 반환
    res.status(200).json({ message: "캐릭터가 성공적으로 삭제되었습니다." });
  } catch (error) {
    // 에러발생
    console.error("캐릭터 삭제 중 에러:", error);
    res.status(500).json({ error: "서버 에러 발생" });
  }
});

// 이 라우터를 기본 내보내기로 내보냄. 다른 파일에서 import 하여 사용가능.
export default router;
