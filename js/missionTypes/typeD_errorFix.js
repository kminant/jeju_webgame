/**
 * 유형 D: 오류 수정
 * 텍스트 중 잘못된 부분(segment)을 터치하여 올바른 정보로 수정.
 * 문장을 segment 배열로 쪼개서 제공하며, isError:true 인 segment를
 * 모두 찾아 탭하면 완료.
 *
 * difficultyData 예시:
 * {
 *   question: "다음 설명에서 잘못된 부분을 모두 찾아 터치하세요.",
 *   segments: [
 *     { text: "태풍은 ", isError: false },
 *     { text: "저위도", isError: true, correctText: "고위도" },
 *     { text: "에서 발생하여 ", isError: false },
 *     { text: "약해지며", isError: true, correctText: "발달하며" },
 *     { text: " 북상합니다.", isError: false }
 *   ],
 *   explanation: "정답 해설 텍스트"
 * }
 *
 * callbacks: { onCorrect(), onWrong(message) }
 */

export function render(container, missionData, difficultyData, callbacks) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "mission-type-d";

  const questionEl = document.createElement("p");
  questionEl.className = "mission-question";
  questionEl.textContent = difficultyData.question;
  wrapper.appendChild(questionEl);

  const textBox = document.createElement("p");
  textBox.className = "errorfix-text-box";

  const totalErrors = difficultyData.segments.filter((s) => s.isError).length;
  let foundCount = 0;
  let wrongTapCount = 0;

  const feedbackEl = document.createElement("p");
  feedbackEl.className = "mission-feedback";

  difficultyData.segments.forEach((segment) => {
    if (!segment.isError) {
      const span = document.createElement("span");
      span.textContent = segment.text;
      textBox.appendChild(span);
      return;
    }

    const span = document.createElement("span");
    span.className = "errorfix-segment";
    span.textContent = segment.text;
    span.style.touchAction = "manipulation";
    span.dataset.found = "false";

    span.addEventListener("click", () => {
      if (span.dataset.found === "true") return;

      span.dataset.found = "true";
      span.classList.add("fixed");
      span.textContent = segment.correctText;
      foundCount += 1;

      if (foundCount === totalErrors) {
        feedbackEl.textContent = difficultyData.explanation || "모든 오류를 수정했습니다!";
        feedbackEl.classList.remove("wrong");
        feedbackEl.classList.add("correct");
        callbacks.onCorrect();
      } else {
        feedbackEl.textContent = `수정 완료 (${foundCount}/${totalErrors})`;
      }
    });

    textBox.appendChild(span);
  });

  // 정답이 아닌 일반 텍스트를 잘못 탭했을 때를 위한 안내(선택적)
  textBox.addEventListener("click", (e) => {
    const target = e.target;
    const isErrorSegment = target.classList && target.classList.contains("errorfix-segment");
    if (!isErrorSegment && target !== textBox) {
      wrongTapCount += 1;
      if (typeof callbacks.onWrong === "function") {
        callbacks.onWrong("오류가 아닌 부분입니다.");
      }
    }
  });

  wrapper.appendChild(textBox);
  wrapper.appendChild(feedbackEl);
  container.appendChild(wrapper);
}
