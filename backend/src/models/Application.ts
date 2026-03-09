import mongoose, { Document, Schema, Types } from "mongoose";

export interface IApplication extends Document {
  userId: Types.ObjectId;
  resumePath: string;
  status: "pending" | "shortlisted" | "rejected";
  contactNumber: string;
  homeState: string;
  assemblyConstituency?: string;
  currentResidence: string;
  category?: "General" | "OBC" | "SC" | "ST" | "Prefer not to say";
  highestQualification: string;
  collegeYearOfStudy?: string;
  collegeName?: string;
  academicDiscipline: string;
  commit5Hours: boolean;
  hasLaptop: boolean;
  openToOnField: boolean;
  willingToWorkWithInc: boolean;
  punjabiProficiency: "Basic" | "Intermediate" | "Advance" | "Not proficient";
  interestReason: string;
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumePath: { type: String, required: true },
    contactNumber: { type: String, required: true },
    homeState: { type: String, required: true },
    assemblyConstituency: { type: String },
    currentResidence: { type: String, required: true },
    category: { type: String, enum: ["General", "OBC", "SC", "ST", "Prefer not to say"] },
    highestQualification: { type: String, required: true },
    collegeYearOfStudy: { type: String },
    collegeName: { type: String },
    academicDiscipline: { type: String, required: true },
    commit5Hours: { type: Boolean, required: true },
    hasLaptop: { type: Boolean, required: true },
    openToOnField: { type: Boolean, required: true },
    willingToWorkWithInc: { type: Boolean, required: true },
    punjabiProficiency: { type: String, enum: ["Basic", "Intermediate", "Advance", "Not proficient"], required: true },
    interestReason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>("Application", applicationSchema);
