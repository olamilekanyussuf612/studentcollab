import { useState } from "react";
import api from "../lib/api.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import useConfirm from "../hooks/useConfirm.js";

const STORAGE_KEY = "latestSummary";

export default function Study() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );
  const [cards, setCards] = useState([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quiz, setQuiz] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const [summaryBusy, setSummaryBusy] = useState(false);
  const [cardsBusy, setCardsBusy] = useState(false);
  const [quizBusy, setQuizBusy] = useState(false);
  const [error, setError] = useState("");

  const [showSummary, setShowSummary] = useState(true);
  const [showCards, setShowCards] = useState(true);

  const { confirmState, askConfirm, handleConfirm, handleCancel } = useConfirm();

  const generateSummary = async () => {
    if (text.trim().length < 20) {
      setError("Paste at least a sentence or two of notes first.");
      return;
    }
    setError("");
    setSummaryBusy(true);
    setSummary("");
    setCards([]);
    setCardIdx(0);
    setFlipped(false);
    setQuiz([]);
    setQuizIdx(0);
    setQuizChoice(null);
    setQuizScore(0);
    setQuizDone(false);
    setShowSummary(true);
    setShowCards(true);

    try {
      const { summary } = await api.post("/api/ai/summarize", { text });
      setSummary(summary);
      localStorage.setItem(STORAGE_KEY, summary);
      await generateCards(summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setSummaryBusy(false);
    }
  };

  const generateCards = async (summaryText) => {
    const source = summaryText || summary;
    if (!source) return;
    setCardsBusy(true);
    try {
      const { cards } = await api.post("/api/ai/flashcards", {
        summary: source
      });
      if (!Array.isArray(cards) || !cards.length) {
        throw new Error("No cards returned");
      }
      setCards(cards);
      setCardIdx(0);
      setFlipped(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCardsBusy(false);
    }
  };

  const generateQuiz = async () => {
    if (!summary) return;
    setQuizBusy(true);
    setError("");
    setShowSummary(false);
    setShowCards(false);

    try {
      const { questions } = await api.post("/api/ai/quiz", { summary });
      if (!Array.isArray(questions) || !questions.length) {
        throw new Error("No questions returned");
      }
      setQuiz(questions);
      setQuizIdx(0);
      setQuizChoice(null);
      setQuizScore(0);
      setQuizDone(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setQuizBusy(false);
    }
  };

  const clearAll = async () => {
    const ok = await askConfirm({
      title: "Start over?",
      message: "This will clear the summary, flashcards and quiz.",
      confirmLabel: "Clear",
      danger: true
    });
    if (!ok) return;

    setText("");
    setSummary("");
    setCards([]);
    setQuiz([]);
    setQuizChoice(null);
    setQuizScore(0);
    setQuizDone(false);
    setQuizIdx(0);
    setCardIdx(0);
    setFlipped(false);
    setError("");
    setShowSummary(true);
    setShowCards(true);
    localStorage.removeItem(STORAGE_KEY);
  };

  const chooseAnswer = (i) => {
    if (quizChoice !== null) return;
    setQuizChoice(i);
    if (i === quiz[quizIdx].answerIndex) setQuizScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (quizIdx + 1 >= quiz.length) {
      setQuizDone(true);
    } else {
      setQuizIdx(quizIdx + 1);
      setQuizChoice(null);
    }
  };

  const retakeQuiz = () => {
    setQuizIdx(0);
    setQuizChoice(null);
    setQuizScore(0);
    setQuizDone(false);
  };

  const currentCard = cards[cardIdx];
  const currentQ = quiz[quizIdx];

  return (
    <div className="study">
      {!summary && (
        <section className="study-input">
          <p className="muted">
            Paste your notes below. We'll summarize them, then automatically
            create flashcards and offer a quiz.
          </p>
          <textarea
            className="study-textarea"
            placeholder="Paste notes here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
          />
          {error && (
            <div className="alert error-alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          <div className="study-actions">
            <button
              className="primary-btn"
              onClick={generateSummary}
              disabled={summaryBusy || text.trim().length < 20}
            >
              {summaryBusy ? (
                <>
                  <span className="btn-spinner" /> Summarizing…
                </>
              ) : (
                "Summarize"
              )}
            </button>
          </div>
        </section>
      )}

      {summary && (
        <>
          <section className="study-block">
            <button
              type="button"
              className="study-block-head clickable"
              onClick={() => setShowSummary((s) => !s)}
            >
              <h3>
                <span className="collapse-chevron" aria-hidden>
                  {showSummary ? "▾" : "▸"}
                </span>{" "}
                📌 Summary
              </h3>
              <div
                className="study-block-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="ghost-btn"
                  onClick={() => setShowSummary((s) => !s)}
                >
                  {showSummary ? "Hide" : "Show"}
                </button>
                <button className="ghost-btn" onClick={clearAll}>
                  Start over
                </button>
              </div>
            </button>

            {showSummary && <pre className="study-summary">{summary}</pre>}
          </section>

          <section className="study-block">
            <button
              type="button"
              className="study-block-head clickable"
              onClick={() => setShowCards((s) => !s)}
            >
              <h3>
                <span className="collapse-chevron" aria-hidden>
                  {showCards ? "▾" : "▸"}
                </span>{" "}
                🎴 Flashcards
                {cards.length > 0 && (
                  <span
                    className="muted"
                    style={{ marginLeft: 8, fontWeight: 400 }}
                  >
                    ({cards.length})
                  </span>
                )}
              </h3>
              <div
                className="study-block-actions"
                onClick={(e) => e.stopPropagation()}
              >
                {showCards && currentCard && (
                  <span className="muted" style={{ fontSize: 12 }}>
                    {cardIdx + 1} / {cards.length}
                  </span>
                )}
                <button
                  className="ghost-btn"
                  onClick={() => setShowCards((s) => !s)}
                >
                  {showCards ? "Hide" : "Show"}
                </button>
                <button
                  className="ghost-btn"
                  onClick={() => generateCards()}
                  disabled={cardsBusy}
                >
                  {cardsBusy ? "…" : "Regenerate"}
                </button>
              </div>
            </button>

            {showCards && (
              <>
                {cardsBusy && <p className="muted">Generating flashcards…</p>}

                {!cardsBusy && currentCard && (
                  <>
                    <div
                      className={flipped ? "flashcard flipped" : "flashcard"}
                      onClick={() => setFlipped(!flipped)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          setFlipped(!flipped);
                        }
                      }}
                    >
                      <div className="fc-face fc-front">
                        <span className="fc-tag">Question</span>
                        {currentCard.front}
                      </div>
                      <div className="fc-face fc-back">
                        <span className="fc-tag">Answer</span>
                        {currentCard.back}
                      </div>
                    </div>

                    <p className="muted fc-hint">Tap the card to flip</p>

                    <div className="fc-controls">
                      <button
                        className="ghost-btn"
                        onClick={() => {
                          setCardIdx(Math.max(0, cardIdx - 1));
                          setFlipped(false);
                        }}
                        disabled={cardIdx === 0}
                      >
                        ← Prev
                      </button>
                      <button
                        className="ghost-btn"
                        onClick={() => {
                          setCardIdx(Math.min(cards.length - 1, cardIdx + 1));
                          setFlipped(false);
                        }}
                        disabled={cardIdx === cards.length - 1}
                      >
                        Next →
                      </button>
                    </div>
                  </>
                )}

                {!cardsBusy && !currentCard && (
                  <p className="muted">No flashcards yet.</p>
                )}
              </>
            )}
          </section>

          <section className="study-block">
            <div className="study-block-head">
              <h3>❓ Quiz</h3>
              {quiz.length > 0 && !quizDone && (
                <span className="muted">
                  Question {quizIdx + 1} / {quiz.length}
                </span>
              )}
            </div>

            {!quiz.length && !quizBusy && (
              <>
                <p className="muted">
                  Test yourself on the summary. 5 multiple-choice questions.
                  Summary and flashcards will hide when you start.
                </p>
                <button
                  className="primary-btn"
                  onClick={generateQuiz}
                  disabled={quizBusy}
                >
                  Generate quiz
                </button>
              </>
            )}

            {quizBusy && <p className="muted">Building quiz…</p>}

            {currentQ && !quizDone && (
              <>
                <p className="quiz-q">{currentQ.question}</p>
                <div className="quiz-options">
                  {currentQ.options.map((o, i) => {
                    let cls = "quiz-option";
                    if (quizChoice !== null) {
                      if (i === currentQ.answerIndex) cls += " correct";
                      else if (i === quizChoice) cls += " wrong";
                    }
                    return (
                      <button
                        key={i}
                        className={cls}
                        onClick={() => chooseAnswer(i)}
                        disabled={quizChoice !== null}
                        type="button"
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
                {quizChoice !== null && (
                  <div className="quiz-next">
                    <button className="primary-btn" onClick={nextQuestion}>
                      {quizIdx + 1 >= quiz.length
                        ? "See results"
                        : "Next question →"}
                    </button>
                  </div>
                )}
              </>
            )}

            {quizDone && (
              <div className="quiz-results">
                <div className="quiz-score">
                  {quizScore} / {quiz.length}
                </div>
                <p className="muted">
                  {quizScore === quiz.length
                    ? "Perfect score! 🎉"
                    : quizScore >= quiz.length / 2
                      ? "Nice work — review the ones you missed."
                      : "Keep going — read the summary again and retry."}
                </p>
                <div className="quiz-result-actions">
                  <button className="primary-btn" onClick={retakeQuiz}>
                    Retake
                  </button>
                  <button className="ghost-btn" onClick={generateQuiz}>
                    New questions
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {error && summary && (
        <div className="alert error-alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.payload?.title}
        message={confirmState.payload?.message}
        confirmLabel={confirmState.payload?.confirmLabel}
        danger={confirmState.payload?.danger}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}