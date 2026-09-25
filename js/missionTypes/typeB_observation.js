/**
 * 유형 B: 관측 선택
 * 현장의 실제 상태를 보고 제시된 옵션(이미지/텍스트) 중 하나를 선택.
 *
 * difficultyData 예시:
 * {
 *   question: "지금 하늘을 관찰하고 알맞은 구름을 선택하세요.",
 *   image: "assets/observation1.jpg",   // 선택: 상단 참고 이미지
 *   options: [
 *     { label: "적란운", image: "assets/cloud1.jpg" },
 *     { label: "권운", image: "assets/cloud2.jpg" },
 *     { label: "층운" }                  // image 없으면 텍스트만
 *   ],
 *   answerIndex: 0,
 *   explanation: "정답 해설 텍스트"
 * }
 *
 * callbacks: { onCorrect(), onWrong(message) }
 */

export function render(container, missionData, difficultyData, callbacks) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "mission-type-b";

  const questionEl = document.createElement("p");
  questionEl.className = "mission-question";
  questionEl.textContent = difficultyData.question;
  wrapper.appendChild(questionEl);

  if (difficultyData.image) {
    const refImg = document.createElement("img");
    refImg.className = "mission-reference-image";
    refImg.src = difficultyData.image;
    refImg.alt = "관측 참고 이미지";
    wrapper.appendChild(refImg);
  }

  const optionsGrid = document.createElement("div");
  optionsGrid.className = "observation-options-grid";

  const feedbackEl = document.createElement("p");
  feedbackEl.className = "mission-feedback";

  let answered = false;

  difficultyData.options.forEach((option, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "observation-option-card";
    card.style.touchAction = "manipulation";

    if (option.image) {
      const img = document.createElement("img");
      img.src = option.image;
      img.alt = option.label;
      card.appendChild(img);
    }

    const label = document.createElement("span");
    label.textContent = option.label;
    card.appendChild(label);

    card.addEventListener("click", () => {
      if (answered) return;
      answered = true;

      const allCards = optionsGrid.querySelectorAll(".observation-option-card");
      allCards.forEach((c) => (c.disabled = true));

      if (index === difficultyData.answerIndex) {
        card.classList.add("correct");
        feedbackEl.textContent = difficultyData.explanation || "정답입니다!";
        feedbackEl.classList.remove("wrong");
        feedbackEl.classList.add("correct");
        callbacks.onCorrect();
      } else {
        card.classList.add("wrong");
        allCards[difficultyData.answerIndex].classList.add("correct");
        feedbackEl.textContent = "아쉽지만 오답입니다. 정답을 확인하세요.";
        feedbackEl.classList.remove("correct");
        feedbackEl.classList.add("wrong");
        if (typeof callbacks.onWrong === "function") {
          callbacks.onWrong("오답입니다.");
        }
      }
    });

    optionsGrid.appendChild(card);
  });

  wrapper.appendChild(optionsGrid);
  wrapper.appendChild(feedbackEl);
  container.appendChild(wrapper);
}
