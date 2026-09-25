/**
 * map.js
 * 상대좌표(%) 기반 인터랙티브 맵 렌더링 및 마커 상태 관리.
 *
 * mission 객체 형태(요약):
 * { id, locationName, markerPosition: { x, y } }  // x, y는 0~100 (%)
 */

let markerRefs = {}; // { [missionId]: HTMLElement }
let onMarkerClickCallback = null;

/**
 * 지도 컨테이너에 모든 미션 마커를 렌더링.
 * @param {HTMLElement} container - 지도 배경 이미지를 감싸는 요소 (position: relative 필요)
 * @param {Array} missions - missions.json 의 missions 배열
 * @param {Object} options
 *   - completedIds: Set<number> 완료된 미션 id 목록
 *   - onMarkerClick: (missionId) => void  마커 탭 시 콜백
 */
export function renderMap(container, missions, options = {}) {
  container.innerHTML = "";
  markerRefs = {};
  onMarkerClickCallback = options.onMarkerClick || null;

  const completedIds = options.completedIds || new Set();

  missions.forEach((mission) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "map-marker";
    marker.style.touchAction = "manipulation";
    marker.style.left = `${mission.markerPosition.x}%`;
    marker.style.top = `${mission.markerPosition.y}%`;
    marker.dataset.missionId = String(mission.id);
    marker.setAttribute("aria-label", mission.locationName);

    const label = document.createElement("span");
    label.className = "map-marker-label";
    label.textContent = mission.locationName;
    marker.appendChild(label);

    if (completedIds.has(mission.id)) {
      marker.classList.add("marker-completed");
    }

    marker.addEventListener("click", () => {
      if (typeof onMarkerClickCallback === "function") {
        onMarkerClickCallback(mission.id);
      }
    });

    container.appendChild(marker);
    markerRefs[mission.id] = marker;
  });
}

/**
 * 특정 미션 마커를 "활성(현재 이동해야 할 위치)" 상태로 강조.
 * 이전에 활성화된 마커는 강조 해제됨.
 * @param {number} missionId
 */
export function setActiveMission(missionId) {
  Object.values(markerRefs).forEach((el) => el.classList.remove("marker-active"));
  const target = markerRefs[missionId];
  if (target) {
    target.classList.add("marker-active");
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }
}

/**
 * 미션 완료 처리: 완료 스타일 적용 + 활성 강조 해제.
 * @param {number} missionId
 */
export function markCompleted(missionId) {
  const target = markerRefs[missionId];
  if (target) {
    target.classList.remove("marker-active");
    target.classList.add("marker-completed");
  }
}

/**
 * 현재 렌더링된 마커 엘리먼트 참조 반환 (디버그/확장용).
 */
export function getMarkerRefs() {
  return markerRefs;
}
