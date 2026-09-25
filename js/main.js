/**
 * main.js
 * 앱 진입점.
 *
 * 전제(index.html)에 다음 요소가 있다고 가정합니다. 실제 id/class는
 * index.html 작성 시 맞춰서 조정 가능합니다.
 *   #difficulty-screen        - 난이도 선택 화면
 *   #difficulty-screen [data-difficulty="elementary"|"secondary"] - 선택 버튼
 *   #map-screen                - 지도 화면 컨테이너
 *   #map-container             - renderMap()에 넘길 마커 배치 영역 (position: relative)
 *   #mission-screen             - 미션 모달/화면 컨테이너 (기본 hidden)
 *   #mission-screen .mission-location-name - 현재 거점명 표시 영역
 *   #mission-screen .mission-body          - loadMission()이 그릴 영역
 *   #mission-screen .mission-close-btn     - 미션 화면 닫기 버튼
 */

import { renderMap, setActiveMission, markCompleted } from "./map.js";
import { loadMission } from "./missionLoader.js";
import { celebrate } from "./effects.js";
import { loadCompletedIds, markMissionCompleted } from "./progress.js";

const DIFFICULTY_STORAGE_KEY = "jejuWeatherGame.difficulty";

// 실내/실외 지도 배경 이미지 경로. assets 폴더에 실제 이미지로 교체.
const MAP_BG_PATHS = {
  indoor: "assets/map-bg-indoor.jpg",
  outdoor: "assets/map-bg-outdoor.jpg",
};
const DEFAULT_MAP_TYPE = "indoor";

const state = {
  missions: [],
  difficulty: null, // "elementary" | "secondary"
  completedIds: new Set(),
  activeMissionId: null,
  mapType: DEFAULT_MAP_TYPE, // "indoor" | "outdoor"
};

// ---------- 난이도 ----------

function loadStoredDifficulty() {
  return sessionStorage.getItem(DIFFICULTY_STORAGE_KEY);
}

function saveDifficulty(difficulty) {
  sessionStorage.setItem(DIFFICULTY_STORAGE_KEY, difficulty);
}

function showDifficultyScreen(onSelected) {
  const screen = document.getElementById("difficulty-screen");
  const mapScreen = document.getElementById("map-screen");
  screen.hidden = false;
  mapScreen.hidden = true;

  const buttons = screen.querySelectorAll("[data-difficulty]");
  buttons.forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const difficulty = btn.dataset.difficulty;
        state.difficulty = difficulty;
        saveDifficulty(difficulty);
        screen.hidden = true;
        mapScreen.hidden = false;
        onSelected(difficulty);
      },
      { once: true }
    );
  });
}

// ---------- 미션 화면 ----------

function openMissionScreen(missionId) {
  const mission = state.missions.find((m) => m.id === missionId);
  if (!mission) return;

  state.activeMissionId = missionId;
  setActiveMission(missionId);

  const missionScreen = document.getElementById("mission-screen");
  const nameEl = missionScreen.querySelector(".mission-location-name");
  const bodyEl = missionScreen.querySelector(".mission-body");
  const closeBtn = missionScreen.querySelector(".mission-close-btn");

  nameEl.textContent = mission.locationName;
  missionScreen.hidden = false;

  loadMission(bodyEl, mission, state.difficulty, {
    onCorrect: () => handleMissionCorrect(mission),
    onWrong: (message) => {
      // 필요 시 오답 카운트/힌트 노출 등 확장 지점
      console.debug(`[mission ${mission.id}] 오답:`, message);
    },
  });

  closeBtn.onclick = () => {
    missionScreen.hidden = true;
  };
}

function getNextMission(currentMission) {
  const currentIndex = state.missions.findIndex((m) => m.id === currentMission.id);

  for (let i = currentIndex + 1; i < state.missions.length; i += 1) {
    if (!state.completedIds.has(state.missions[i].id)) return state.missions[i];
  }
  // 순서상 뒤쪽에 남은 미션이 없다면 앞쪽에서 미완료 미션 탐색
  for (let i = 0; i < currentIndex; i += 1) {
    if (!state.completedIds.has(state.missions[i].id)) return state.missions[i];
  }
  return null; // 전체 완료
}

function handleMissionCorrect(mission) {
  markMissionCompleted(mission.id, state.completedIds);
  markCompleted(mission.id);

  const nextMission = getNextMission(mission);
  celebrate(mission.locationName, nextMission ? nextMission.locationName : null);

  const missionScreen = document.getElementById("mission-screen");
  setTimeout(() => {
    missionScreen.hidden = true;
  }, 1500);
}

// ---------- QR 파라미터 처리 ----------

function getMissionIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("mission");
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

// ---------- 실내/실외 지도 전환 ----------

function getMissionsByMapType(mapType) {
  return state.missions.filter((m) => m.mapType === mapType);
}

function renderCurrentMap() {
  const mapContainer = document.getElementById("map-container");
  const missionsForType = getMissionsByMapType(state.mapType);

  renderMap(mapContainer, missionsForType, {
    completedIds: state.completedIds,
    onMarkerClick: (missionId) => openMissionScreen(missionId),
  });
}

function updateMapTypeToggleUI() {
  const buttons = document.querySelectorAll(".map-type-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mapType === state.mapType);
  });
}

/**
 * 실내/실외 지도를 전환: 배경 이미지 교체 + 해당 타입 마커만 다시 렌더링.
 * @param {"indoor"|"outdoor"} mapType
 */
function switchMapType(mapType) {
  state.mapType = mapType;

  const bgImg = document.getElementById("map-bg-img");
  bgImg.src = MAP_BG_PATHS[mapType];
  bgImg.alt = mapType === "indoor" ? "실내 홍보관 지도" : "실외 탐방로 지도";

  updateMapTypeToggleUI();
  renderCurrentMap();
}

function setupMapTypeToggle() {
  const buttons = document.querySelectorAll(".map-type-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => switchMapType(btn.dataset.mapType));
  });
}

// ---------- 초기화 ----------

async function loadMissionsData() {
  const res = await fetch("data/missions.json");
  if (!res.ok) throw new Error("missions.json을 불러오지 못했습니다.");
  const data = await res.json();
  return data.missions;
}

function initMapScreen() {
  setupMapTypeToggle();

  const qrMissionId = getMissionIdFromUrl();
  const qrMission = qrMissionId !== null
    ? state.missions.find((m) => m.id === qrMissionId)
    : null;

  // QR로 들어온 미션이 있으면 그 미션이 속한 지도(실내/실외)를 먼저 띄운다.
  const initialMapType = qrMission ? qrMission.mapType : DEFAULT_MAP_TYPE;
  switchMapType(initialMapType);

  if (qrMission) {
    setActiveMission(qrMission.id);
    openMissionScreen(qrMission.id);
  }
}

async function init() {
  state.missions = await loadMissionsData();
  state.completedIds = loadCompletedIds();

  const storedDifficulty = loadStoredDifficulty();

  if (storedDifficulty) {
    state.difficulty = storedDifficulty;
    document.getElementById("difficulty-screen").hidden = true;
    document.getElementById("map-screen").hidden = false;
    initMapScreen();
  } else {
    showDifficultyScreen(() => {
      initMapScreen();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init().catch((err) => {
    console.error(err);
    alert("게임 데이터를 불러오는 중 문제가 발생했습니다.");
  });
});
