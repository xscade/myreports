import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ILabParameter extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  parameterName: string
  value: string
  unit: string
  normalRange: string
  status: 'Low' | 'Normal' | 'High'
  testDate: string
  sourceFile: string
  extractedAt: Date
  createdAt: Date
  updatedAt: Date
}

const LabParameterSchema = new Schema<ILabParameter>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parameterName: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    normalRange: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Low', 'Normal', 'High'],
      required: true,
    },
    testDate: {
      type: String,
      required: true,
    },
    sourceFile: {
      type: String,
      required: true,
    },
    extractedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for duplicate checking by data
LabParameterSchema.index(
  { userId: 1, parameterName: 1, value: 1, testDate: 1, unit: 1 },
  { unique: true }
)

// Index for checking duplicates by source file
LabParameterSchema.index(
  { userId: 1, parameterName: 1, sourceFile: 1, testDate: 1 }
)

// Index for faster queries by sourceFile
LabParameterSchema.index({ userId: 1, sourceFile: 1 })

// Prevent model recompilation during hot reload
const LabParameter: Model<ILabParameter> = 
  mongoose.models.LabParameter || mongoose.model<ILabParameter>('LabParameter', LabParameterSchema)

export default LabParameter

