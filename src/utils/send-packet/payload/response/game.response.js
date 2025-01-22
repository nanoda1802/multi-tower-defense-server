export function makeRegisterResponse(success, message, failCode) {
  return { success, message, failCode };
}

export function makeLoginResponse(success, message, token, failCode) {
  return { success, message, token, failCode };
}

export function makeTowerPurchaseResponse(towerId) {
  return { towerId };
}

export function makeSpawnMonsterResponse(monsterId, monsterNumber) {
  return { monsterId, monsterNumber };
}