import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAnswer {
  questionId: Types.ObjectId;
  selectedOption: number;
}

export interface IAttempt extends Document {
  userId: Types.ObjectId;
  answers: IAnswer[];
  startedAt: Date;
  expiresAt: Date;
  submitted: boolean;
  score: number | null;
  totalQuestions: number;
}

const attemptSchema = new Schema<IAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        selectedOption: { type: Number, required: true },
      },
    ],
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    submitted: { type: Boolean, default: false },
    score: { type: Number, default: null },
    totalQuestions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IAttempt>("Attempt", attemptSchema);
