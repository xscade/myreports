// Medical Lab Data Types
export interface LabParameter {
  id: string;
  parameterName: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'Low' | 'Normal' | 'High';
  testDate: string;
  sourceFile: string;
  extractedAt: string;
}

export interface ExtractedData {
  success: boolean;
  parameters: LabParameter[];
  sourceFileName: string;
  extractedAt: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'error';
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  formattedDate: string;
}

export interface ParameterChartData {
  parameterName: string;
  unit: string;
  normalRange: string;
  data: ChartDataPoint[];
}

// Dashboard Stats
export interface DashboardStats {
  totalParameters: number;
  totalReports: number;
  abnormalCount: number;
  lastUpdated: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

// JSON Schema for AI Extraction
export const labParameterSchema = {
  type: "object",
  properties: {
    parameters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          parameterName: { type: "string", description: "Name of the lab parameter" },
          value: { type: "string", description: "Measured value" },
          unit: { type: "string", description: "Unit of measurement" },
          normalRange: { type: "string", description: "Normal reference range" },
          status: { 
            type: "string", 
            enum: ["Low", "Normal", "High"],
            description: "Status compared to normal range" 
          },
          testDate: { type: "string", description: "Date of the test in YYYY-MM-DD format" }
        },
        required: ["parameterName", "value", "unit", "normalRange", "status", "testDate"]
      }
    }
  },
  required: ["parameters"]
};

