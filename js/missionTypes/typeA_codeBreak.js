/**
 * 유형 A: 코드 브레이킹
 * 암호(cipherText)를 보고 정답 텍스트를 입력하는 미션.
 *
 * difficultyData 예시:
 * {
 *   question: "다음 암호를 해독하세요.",
 *   cipherText: "ㅂㅏㄹㅏㅁ",          // 선택: 화면에 보여줄 암호/힌트 텍스트
 *   hint: "기상 요소 중 하나입니다.",   // 선택
 *   inputType: "text",
 *   answer: ["바람"],                  // 정답 후보 배열(복수 허용)
 *   explanation: "정답 해설 텍스트"
 * }
 *
 * callbacks: { onCorrect(), onWrong(message) }
 */

export function render(container, missionData, difficultyData, callbacks) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "mission-type-a";

  const questionEl = document.createElement("p");
  questionEl.className = "mission-question";
  questionEl.textContent = difficultyData.question;
  wrapper.appendChild(questionEl);

  if (difficultyData.cipherText) {
    const cipherEl = document.createElement("div");
    cipherEl.className = "cipher-box";
    cipherEl.textContent = difficultyData.cipherText;
    wrapper.appendChild(cipherEl);
  }

  if (difficultyData.hint) {
    const hintEl = document.createElement("p");
    hintEl.className = "mission-hint";
    hintEl.textContent = `힌트: ${difficultyData.hint}`;
    wrapper.appendChild(hintEl);
  }

  const inputEl = document.createElement("input");
  inputEl.type = "text";
  inputEl.className = "mission-text-input";
  inputEl.setAttribute("autocomplete", "off");
  inputEl.setAttribute("autocapitalize", "off");
  inputEl.placeholder = "정답을 입력하세요";
  wrapper.appendChild(inputEl);

  const feedbackEl = document.createElement("p");
  feedbackEl.className = "mission-feedback";
  wrapper.appendChild(feedbackEl);

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.className = "mission-submit-btn";
  submitBtn.textContent = "확인";
  wrapper.appendChild(submitBtn);

  function normalize(str) {
    return String(str).trim().replace(/\s+/g, "").toLowerCase();
  }

  function checkAnswer() {
    const userAnswer = normalize(inputEl.value);
    const isCorrect = difficultyData.answer
      .map(normalize)
      .includes(userAnswer);

    if (!userAnswer) {
      feedbackEl.textContent = "정답을 입력해 주세요.";
      feedbackEl.classList.remove("correct");
      feedbackEl.classList.add("wrong");
      return;
    }

    if (isCorrect) {
      feedbackEl.textContent = difficultyData.explanation || "정답입니다!";
      feedbackEl.classList.remove("wrong");
      feedbackEl.classList.add("correct");
      inputEl.disabled = true;
      submitBtn.disabled = true;
      callbacks.onCorrect();
    } else {
      feedbackEl.textContent = "다시 시도해 보세요.";
      feedbackEl.classList.remove("correct");
      feedbackEl.classList.add("wrong");
      if (typeof callbacks.onWrong === "function") {
        callbacks.onWrong("오답입니다.");
      }
    }
  }

  submitBtn.addEventListener("click", checkAnswer);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAnswer();
  });

  container.appendChild(wrapper);
}
