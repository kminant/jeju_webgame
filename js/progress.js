/**
 * progress.js
 * 완료한 미션 id 목록을 localStorage에 저장/불러오기.
 * (난이도는 세션 단위 값이라 main.js에서 sessionStorage로 별도 관리)
 */

const PROGRESS_STORAGE_KEY = "jejuWeatherGame.completedMissionIds";

/**
 * 저장된 완료 미션 id 목록을 Set으로 불러온다.
 * @returns {Set<number>}
 */
export function loadCompletedIds() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

/**
 * 완료 미션 id 목록(Set)을 저장한다.
 * @param {Set<number>} completedIds
 */
export function saveCompletedIds(completedIds) {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify([...completedIds]));
}

/**
 * 특정 미션을 완료 처리하고 즉시 저장까지 수행하는 편의 함수.
 * @param {number} missionId
 * @param {Set<number>} completedIds - 갱신할 현재 상태의 Set
 * @returns {Set<number>} 갱신된 Set (동일 참조)
 */
export function markMissionCompleted(missionId, completedIds) {
  completedIds.add(missionId);
  saveCompletedIds(completedIds);
  return completedIds;
}

/**
 * 진행 상태를 완전히 초기화한다 (재플레이/리셋 버튼 등에서 사용).
 */
export function resetProgress() {
  localStorage.removeItem(PROGRESS_STORAGE_KEY);
}
