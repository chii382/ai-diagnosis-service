import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnswer {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
}

export interface ICareerRoadmap {
  shortTerm?: string;
  midTerm?: string;
  longTerm?: string;
}

export interface IDiagnosis {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  answers: IAnswer;
  result: Record<string, unknown>;
  careerRoadmap: ICareerRoadmap;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDiagnosisDocument extends IDiagnosis, Document {}

const DiagnosisSchema = new Schema<IDiagnosisDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    answers: {
      type: Schema.Types.Mixed,
      required: true,
    },
    result: {
      type: Schema.Types.Mixed,
      required: true,
    },
    careerRoadmap: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Diagnosis: Model<IDiagnosisDocument> =
  mongoose.models.Diagnosis ?? mongoose.model<IDiagnosisDocument>('Diagnosis', DiagnosisSchema);

export default Diagnosis;
