/**
 * 유형 E: 퀴즈
 * 날씨 속담, 지진/화산 관련 OX 및 객관식 퀴즈.
 *
 * difficultyData 예시 (OX):
 * {
 *   question: "제비가 낮게 날면 비가 온다는 속담은 과학적 근거가 있다.",
 *   quizType: "OX",
 *   answer: true,
 *   explanation: "정답 해설 텍스트"
 * }
 *
 * difficultyData 예시 (객관식):
 * {
 *   question: "다음 중 화산 활동과 관련 없는 것은?",
 *   quizType: "multiple",
 *   options: ["용암", "지진", "태풍", "화산재"],
 *   answerIndex: 2,
 *   explanation: "정답 해설 텍스트"
 * }
 *
 * callbacks: { onCorrect(), onWrong(message) }
 */

export function render(container, missionData, difficultyData, callbacks) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "mission-type-e";

  const questionEl = document.createElement("p");
  questionEl.className = "mission-question";
  questionEl.textContent = difficultyData.question;
  wrapper.appendChild(questionEl);

  const optionsBox = document.createElement("div");
  optionsBox.className =
    difficultyData.quizType === "OX" ? "quiz-ox-box" : "quiz-multiple-box";

  const feedbackEl = document.createElement("p");
  feedbackEl.className = "mission-feedback";

  function handleAnswer(button, isCorrect, allButtons) {
    allButtons.forEach((b) => (b.disabled = true));

    if (isCorrect) {
      button.classList.add("correct");
      feedbackEl.textContent = difficultyData.explanation || "정답입니다!";
      feedbackEl.classList.remove("wrong");
      feedbackEl.classList.add("correct");
      callbacks.onCorrect();
    } else {
      button.classList.add("wrong");
      feedbackEl.textContent = "아쉽지만 오답입니다.";
      feedbackEl.classList.remove("correct");
      feedbackEl.classList.add("wrong");
      if (typeof callbacks.onWrong === "function") {
        callbacks.onWrong("오답입니다.");
      }
    }
  }

  if (difficultyData.quizType === "OX") {
    const choices = [
      { label: "O", value: true },
      { label: "X", value: false },
    ];

    const buttons = [];
    choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-ox-btn";
      btn.style.touchAction = "manipulation";
      btn.textContent = choice.label;
      buttons.push(btn);
      optionsBox.appendChild(btn);
    });

    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const isCorrect = choices[i].value === difficultyData.answer;
        handleAnswer(btn, isCorrect, buttons);
        if (!isCorrect) {
          const correctIndex = choices.findIndex((c) => c.value === difficultyData.answer);
          buttons[correctIndex].classList.add("correct");
        }
      });
    });
  } else {
    const buttons = [];
    difficultyData.options.forEach((optionText, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-multiple-btn";
      btn.style.touchAction = "manipulation";
      btn.textContent = optionText;
      buttons.push(btn);
      optionsBox.appendChild(btn);
    });

    buttons.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        const isCorrect = index === difficultyData.answerIndex;
        handleAnswer(btn, isCorrect, buttons);
        if (!isCorrect) {
          buttons[difficultyData.answerIndex].classList.add("correct");
        }
      });
    });
  }

  wrapper.appendChild(optionsBox);
  wrapper.appendChild(feedbackEl);
  container.appendChild(wrapper);
}
