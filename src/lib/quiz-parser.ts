export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizData {
  type: "quiz";
  questions: QuizQuestion[];
}

function isValidQuizData(value: unknown): value is QuizData {
  if (!value || typeof value !== "object") return false;

  const data = value as QuizData;

  if (data.type !== "quiz") return false;
  if (!Array.isArray(data.questions)) return false;
  if (data.questions.length < 1 || data.questions.length > 10) return false;

  return data.questions.every((q) => {
    return (
      q &&
      typeof q.question === "string" &&
      q.question.trim().length > 0 &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every(
        (opt) => typeof opt === "string" && opt.trim().length > 0
      ) &&
      typeof q.correctIndex === "number" &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex <= 3 &&
      typeof q.explanation === "string" &&
      q.explanation.trim().length > 0
    );
  });
}

export function parseQuizFromResponse(responseText: string): {
  readableText: string;
  quizData?: QuizData;
} {
  const jsonBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/i);

  if (!jsonBlockMatch) {
    return {
      readableText: responseText,
    };
  }

  try {
    const parsed = JSON.parse(jsonBlockMatch[1]);

    if (!isValidQuizData(parsed)) {
      return {
        readableText:
          responseText +
          "\n\n⚠️ A kvíz szerkezete hibás volt, ezért nem tudtam interaktív kvízként megjeleníteni.",
      };
    }

    const cleanedText = responseText.replace(jsonBlockMatch[0], "").trim();

    return {
      readableText: cleanedText || "Itt a kért kvíz:",
      quizData: parsed,
    };
  } catch {
    return {
      readableText:
        responseText +
        "\n\n⚠️ A kvíz JSON-formátuma hibás volt, ezért nem tudtam interaktív kvízként megjeleníteni.",
    };
  }
}
