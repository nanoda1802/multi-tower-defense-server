/* 몬스터 경로 생성 함수 */
const makePath = (count) => {
  // [1] 몬스터 경로 좌표들 담을 배열 준비
  const paths = [];
  // [2] 경로 전환 횟수가 두 번 이하라면 직선 경로 반환
  if (count <= 2)
    return [
      { x: 0, y: 300 },
      { x: 1350, y: 300 },
    ];
  // [3] 경로 한 칸의 너비 지정
  const width = Math.trunc(1350 / (count - 1));
  // [4] 경로 기준 좌표들 생성
  for (let i = 0; i < count; i++) {
    // [4-1] 기준 x 좌표 생성, 만약 마지막 칸이면 고정 좌표 (Base 이미지 보존 위함)
    let x = width * i;
    if (i === count - 1) x = 1350;
    // [4-2] 기준 y 좌표 랜덤 생성
    const y = Math.trunc(Math.random() * 200) + 200;
    // [4-3] 생성된 기준 좌표 배열에 삽입
    paths.push({ x, y });
  }
  // [5] 완성된 경로 배열 반환
  return paths;
};

export default makePath;
