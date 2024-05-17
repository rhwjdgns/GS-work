// 에러 핸들러 미들웨어 함수를 내보냅니다.
export default (error, req, res, next) => {
  // 발생한 에러를 콘솔에 출력합니다.
  console.error(error);
  // 에러의 이름이 "ValidationError"인지 확인합니다.
  if (error.name === "ValidationError") {
    // 유효성 검사 에러인 경우,400상태 코드와 에러 메시지를 클라이언트에게 반환합니다.
    return res.status(400).json({ errorMessage: error.message });
  }
  // 그 외의 경우,500 상태 코드와 일반적인 에러 메시지를 클라이언트에게 반환합니다.
  return res
    .status(500)
    .json({ errorMessage: "서버에서 에러가 발생했습니다." });
};
