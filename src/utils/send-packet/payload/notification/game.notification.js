export function makeMatchStartNotification(initialGameState, playerData, opponentData) {
  return { initialGameState, playerData, opponentData };
}

export function makeStateSyncNotification(userGold, baseHp, monsterLevel, score, towers, monsters) {
  return { userGold, baseHp, monsterLevel, score, towers, monsters };
}

export function makeAddEnemyTowerNotification(towerId, x, y) {
  return { towerId, x, y };
}

export function makeSpawnEnemyMonsterNotification(monsterId, monsterNumber) {
  return { monsterId, monsterNumber };
}

export function makeEnemyTowerAttackNotification(towerId, monsterId) {
  return { towerId, monsterId };
}

export function makeUpdateBaseHPNotification(isOpponent, baseHp) {
  return { isOpponent, baseHp };
}

export function makeGameOverNotification(isWin) {
  return { isWin };
}

export function makeEnemyMonsterDeathNotification(monsterId) {
  return { monsterId };
}
