import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  text: string;
  options: string[];
  correctAnswer: number; // index into options array
}

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", questionSchema);
