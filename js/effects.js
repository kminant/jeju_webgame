/**
 * effects.js
 * 미션 정답 시 색종이(confetti) 이펙트와 "다음 장소 안내" 배너를 띄운다.
 * 외부 라이브러리 없이 순수 CSS 애니메이션 + DOM 조작으로 구현.
 */

const CONFETTI_COLORS = ["#4fb0e6", "#1e6fa8", "#ff9f43", "#ffffff", "#2ecc71"];
const CONFETTI_COUNT = 40;

function spawnConfetti() {
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  document.body.appendChild(layer);

  for (let i = 0; i < CONFETTI_COUNT; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor =
      CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    piece.style.animationDuration = `${1.4 + Math.random() * 0.9}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(piece);
  }

  // 애니메이션이 모두 끝난 뒤 정리 (여유 있게 2.5초)
  setTimeout(() => layer.remove(), 2500);
}

function showNextLocationBanner(nextLocationName) {
  const banner = document.createElement("div");
  banner.className = "next-location-banner";

  if (nextLocationName) {
    banner.innerHTML = `
      <span class="next-location-label">다음 장소로 이동하세요</span>
      <strong class="next-location-name">${nextLocationName}</strong>
    `;
  } else {
    banner.innerHTML = `
      <span class="next-location-label">🎉 모든 미션 완료!</span>
      <strong class="next-location-name">수고하셨습니다</strong>
    `;
  }

  document.body.appendChild(banner);

  // 슬라이드 인
  requestAnimationFrame(() => banner.classList.add("visible"));

  setTimeout(() => {
    banner.classList.remove("visible");
    setTimeout(() => banner.remove(), 300);
  }, 2600);
}

/**
 * 미션 정답 시 호출.
 * @param {string} clearedLocationName - 방금 완료한 거점 이름
 * @param {string|null} nextLocationName - 다음으로 이동할 거점 이름 (없으면 null → 전체 완료 메시지)
 */
export function celebrate(clearedLocationName, nextLocationName) {
  spawnConfetti();
  showNextLocationBanner(nextLocationName);
}
