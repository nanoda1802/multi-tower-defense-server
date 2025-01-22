// 실패 코드
export const GlobalFailCode = {
  NONE: 0,
  UNKNOWN_ERROR: 1,
  INVALID_REQUEST: 2,
  AUTHENTICATION_FAILED: 3,
};

// 게임 데이터 명세
export function makePosition(x, y) {
  return { x, y };
}

export function makeBaseData(hp, maxHp) {
  return { hp, maxHp };
}

export function makeTowerData(towerId, x, y) {
  return { towerId, x, y };
}

export function makeMonsterData(monsterId, monsterNumber, level) {
  return { monsterId, monsterNumber, level };
}

export function makeInitialGameState(baseHp, towerCost, initialGold, monsterSpawnInterval) {
  return { baseHp, towerCost, initialGold, monsterSpawnInterval };
}

export function makeGameState(
  gold,
  base,
  highScore,
  towers,
  monsters,
  monsterLevel,
  score,
  monsterPath,
  basePosition,
) {
  return {
    gold,
    base,
    highScore,
    towers,
    monsters,
    monsterLevel,
    score,
    monsterPath,
    basePosition,
  };
}
