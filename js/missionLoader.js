/**
 * missionLoader.js
 * missionData.type ("A" ~ "E") 과 난이도("elementary" | "secondary")에 맞는
 * 문제 데이터를 골라 해당 missionTypes 모듈의 render()를 호출하는 라우터.
 */

import { render as renderTypeA } from "./missionTypes/typeA_codeBreak.js";
import { render as renderTypeB } from "./missionTypes/typeB_observation.js";
import { render as renderTypeC } from "./missionTypes/typeC_matching.js";
import { render as renderTypeD } from "./missionTypes/typeD_errorFix.js";
import { render as renderTypeE } from "./missionTypes/typeE_quiz.js";

const TYPE_RENDERERS = {
  A: renderTypeA,
  B: renderTypeB,
  C: renderTypeC,
  D: renderTypeD,
  E: renderTypeE,
};

/**
 * @param {HTMLElement} container - 미션 UI를 그릴 컨테이너
 * @param {Object} missionData - missions.json 의 미션 객체 (difficulty 포함)
 * @param {"elementary"|"secondary"} difficulty
 * @param {Object} callbacks - { onCorrect(), onWrong(message) }
 */
export function loadMission(container, missionData, difficulty, callbacks) {
  const renderer = TYPE_RENDERERS[missionData.type];

  if (!renderer) {
    container.innerHTML = `<p class="mission-error">알 수 없는 미션 유형입니다: ${missionData.type}</p>`;
    return;
  }

  const difficultyData = missionData.difficulty[difficulty];

  if (!difficultyData) {
    container.innerHTML = `<p class="mission-error">해당 난이도의 문제 데이터가 없습니다.</p>`;
    return;
  }

  renderer(container, missionData, difficultyData, callbacks);
}
