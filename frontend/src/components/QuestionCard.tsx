import React from "react";

interface QuestionCardProps {
  index: number;
  questionId: string;
  text: string;
  options: string[];
  selectedOption: number | null;
  onSelect: (questionId: string, option: number) => void;
}

/**
 * Renders a single multiple-choice question with selectable options.
 */
const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  questionId,
  text,
  options,
  selectedOption,
  onSelect,
}) => {
  return (
    <div className="question-card">
      <h3 className="question-number">Question {index + 1}</h3>
      <p className="question-text">{text}</p>
      <div className="options-list">
        {options.map((opt, i) => (
          <label
            key={i}
            className={`option-label ${selectedOption === i ? "selected" : ""}`}
          >
            <input
              type="radio"
              name={`question-${questionId}`}
              checked={selectedOption === i}
              onChange={() => onSelect(questionId, i)}
            />
            <span className="option-text">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
