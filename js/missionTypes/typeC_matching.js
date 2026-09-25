/**
 * 유형 C: 매칭/연결
 * 관측 장비(left)와 기능(right)을 드래그 앤 드롭(탭-투-매치 방식)으로 연결.
 * 모바일 호환을 위해 드래그 대신 "먼저 좌측 선택 → 우측 선택" 탭 매칭 방식 사용.
 *
 * difficultyData 예시:
 * {
 *   question: "관측 장비와 기능을 알맞게 연결하세요.",
 *   pairs: [
 *     { id: "p1", left: "온도계", right: "기온 측정" },
 *     { id: "p2", left: "우량계", right: "강수량 측정" },
 *     { id: "p3", left: "풍향풍속계", right: "바람 측정" }
 *   ],
 *   explanation: "정답 해설 텍스트"
 * }
 *
 * callbacks: { onCorrect(), onWrong(message) }
 */

export function render(container, missionData, difficultyData, callbacks) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "mission-type-c";

  const questionEl = document.createElement("p");
  questionEl.className = "mission-question";
  questionEl.textContent = difficultyData.question;
  wrapper.appendChild(questionEl);

  const matchingArea = document.createElement("div");
  matchingArea.className = "matching-area";

  const leftCol = document.createElement("div");
  leftCol.className = "matching-col matching-left";
  const rightCol = document.createElement("div");
  rightCol.className = "matching-col matching-right";

  // 우측 항목은 섞어서 표시
  const shuffledRight = [...difficultyData.pairs].sort(() => Math.random() - 0.5);

  const matchedPairs = new Set();
  let selectedLeftId = null;
  let selectedLeftBtn = null;

  const feedbackEl = document.createElement("p");
  feedbackEl.className = "mission-feedback";

  function checkComplete() {
    if (matchedPairs.size === difficultyData.pairs.length) {
      feedbackEl.textContent = difficultyData.explanation || "모두 연결했습니다!";
      feedbackEl.classList.remove("wrong");
      feedbackEl.classList.add("correct");
      callbacks.onCorrect();
    }
  }

  difficultyData.pairs.forEach((pair) => {
    const leftBtn = document.createElement("button");
    leftBtn.type = "button";
    leftBtn.className = "matching-item matching-item-left";
    leftBtn.style.touchAction = "manipulation";
    leftBtn.textContent = pair.left;
    leftBtn.dataset.id = pair.id;

    leftBtn.addEventListener("click", () => {
      if (matchedPairs.has(pair.id)) return;
      // 이전 선택 해제
      if (selectedLeftBtn) selectedLeftBtn.classList.remove("selected");
      selectedLeftId = pair.id;
      selectedLeftBtn = leftBtn;
      leftBtn.classList.add("selected");
    });

    leftCol.appendChild(leftBtn);
  });

  shuffledRight.forEach((pair) => {
    const rightBtn = document.createElement("button");
    rightBtn.type = "button";
    rightBtn.className = "matching-item matching-item-right";
    rightBtn.style.touchAction = "manipulation";
    rightBtn.textContent = pair.right;
    rightBtn.dataset.id = pair.id;

    rightBtn.addEventListener("click", () => {
      if (matchedPairs.has(pair.id)) return;
      if (!selectedLeftId) {
        feedbackEl.textContent = "왼쪽 항목을 먼저 선택하세요.";
        feedbackEl.classList.remove("correct");
        feedbackEl.classList.add("wrong");
        return;
      }

      if (selectedLeftId === pair.id) {
        // 정답 매칭
        matchedPairs.add(pair.id);
        selectedLeftBtn.classList.remove("selected");
        selectedLeftBtn.classList.add("matched");
        rightBtn.classList.add("matched");
        selectedLeftBtn.disabled = true;
        rightBtn.disabled = true;
        feedbackEl.textContent = "연결 성공!";
        feedbackEl.classList.remove("wrong");
        feedbackEl.classList.add("correct");
        selectedLeftId = null;
        selectedLeftBtn = null;
        checkComplete();
      } else {
        // 오답 매칭
        rightBtn.classList.add("wrong-flash");
        setTimeout(() => rightBtn.classList.remove("wrong-flash"), 400);
        feedbackEl.textContent = "잘못된 연결입니다. 다시 시도하세요.";
        feedbackEl.classList.remove("correct");
        feedbackEl.classList.add("wrong");
        if (typeof callbacks.onWrong === "function") {
          callbacks.onWrong("오답입니다.");
        }
      }
    });

    rightCol.appendChild(rightBtn);
  });

  matchingArea.appendChild(leftCol);
  matchingArea.appendChild(rightCol);
  wrapper.appendChild(matchingArea);
  wrapper.appendChild(feedbackEl);
  container.appendChild(wrapper);
}
