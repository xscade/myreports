import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Available Gemini models for vision tasks (try in order)
const GEMINI_MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash-latest", 
  "gemini-1.5-pro-latest",
  "gemini-pro-vision"
]

// Parameter name normalization mapping - maps shortcuts/variations to standard medical names
const PARAMETER_NAME_MAP: Record<string, string> = {
  // Hemoglobin variations
  "hb": "Hemoglobin",
  "hb%": "Hemoglobin",
  "hgb": "Hemoglobin",
  "hb1": "Hemoglobin",
  "haemoglobin": "Hemoglobin",
  "hemoglobin": "Hemoglobin",
  
  // RBC variations
  "rbc": "Red Blood Cell Count",
  "rbc count": "Red Blood Cell Count",
  "red blood cells": "Red Blood Cell Count",
  "erythrocytes": "Red Blood Cell Count",
  
  // WBC variations
  "wbc": "White Blood Cell Count",
  "wbc count": "White Blood Cell Count",
  "white blood cells": "White Blood Cell Count",
  "leucocytes": "White Blood Cell Count",
  "leukocytes": "White Blood Cell Count",
  "tlc": "White Blood Cell Count",
  "total leucocyte count": "White Blood Cell Count",
  
  // Platelet variations
  "plt": "Platelet Count",
  "platelets": "Platelet Count",
  "platelet count": "Platelet Count",
  "thrombocytes": "Platelet Count",
  
  // Hematocrit variations
  "hct": "Hematocrit",
  "pcv": "Hematocrit",
  "packed cell volume": "Hematocrit",
  "hematocrit": "Hematocrit",
  "haematocrit": "Hematocrit",
  
  // MCV variations
  "mcv": "Mean Corpuscular Volume",
  "mean corpuscular volume": "Mean Corpuscular Volume",
  
  // MCH variations
  "mch": "Mean Corpuscular Hemoglobin",
  "mean corpuscular hemoglobin": "Mean Corpuscular Hemoglobin",
  
  // MCHC variations
  "mchc": "Mean Corpuscular Hemoglobin Concentration",
  "mean corpuscular hemoglobin concentration": "Mean Corpuscular Hemoglobin Concentration",
  
  // RDW variations
  "rdw": "Red Cell Distribution Width",
  "rdw-cv": "Red Cell Distribution Width",
  "red cell distribution width": "Red Cell Distribution Width",
  
  // ESR variations
  "esr": "Erythrocyte Sedimentation Rate",
  "erythrocyte sedimentation rate": "Erythrocyte Sedimentation Rate",
  
  // Blood Sugar variations
  "fbs": "Fasting Blood Sugar",
  "fasting glucose": "Fasting Blood Sugar",
  "fasting blood sugar": "Fasting Blood Sugar",
  "fasting blood glucose": "Fasting Blood Sugar",
  "ppbs": "Post Prandial Blood Sugar",
  "pp glucose": "Post Prandial Blood Sugar",
  "post prandial blood sugar": "Post Prandial Blood Sugar",
  "rbs": "Random Blood Sugar",
  "random glucose": "Random Blood Sugar",
  "random blood sugar": "Random Blood Sugar",
  "blood glucose": "Blood Glucose",
  "glucose": "Blood Glucose",
  
  // HbA1c variations
  "hba1c": "Glycated Hemoglobin (HbA1c)",
  "a1c": "Glycated Hemoglobin (HbA1c)",
  "glycated hemoglobin": "Glycated Hemoglobin (HbA1c)",
  "glycosylated hemoglobin": "Glycated Hemoglobin (HbA1c)",
  
  // Lipid Profile variations
  "tc": "Total Cholesterol",
  "total cholesterol": "Total Cholesterol",
  "cholesterol": "Total Cholesterol",
  "hdl": "HDL Cholesterol",
  "hdl-c": "HDL Cholesterol",
  "hdl cholesterol": "HDL Cholesterol",
  "ldl": "LDL Cholesterol",
  "ldl-c": "LDL Cholesterol",
  "ldl cholesterol": "LDL Cholesterol",
  "vldl": "VLDL Cholesterol",
  "vldl-c": "VLDL Cholesterol",
  "tg": "Triglycerides",
  "triglycerides": "Triglycerides",
  
  // Liver Function variations
  "sgpt": "Alanine Aminotransferase (ALT)",
  "alt": "Alanine Aminotransferase (ALT)",
  "sgot": "Aspartate Aminotransferase (AST)",
  "ast": "Aspartate Aminotransferase (AST)",
  "alp": "Alkaline Phosphatase",
  "alkaline phosphatase": "Alkaline Phosphatase",
  "ggt": "Gamma-Glutamyl Transferase (GGT)",
  "gamma gt": "Gamma-Glutamyl Transferase (GGT)",
  "bilirubin": "Total Bilirubin",
  "total bilirubin": "Total Bilirubin",
  "direct bilirubin": "Direct Bilirubin",
  "indirect bilirubin": "Indirect Bilirubin",
  "albumin": "Albumin",
  "globulin": "Globulin",
  "total protein": "Total Protein",
  "a/g ratio": "Albumin/Globulin Ratio",
  "ag ratio": "Albumin/Globulin Ratio",
  
  // Kidney Function variations
  "bun": "Blood Urea Nitrogen",
  "blood urea nitrogen": "Blood Urea Nitrogen",
  "urea": "Blood Urea",
  "blood urea": "Blood Urea",
  "creatinine": "Serum Creatinine",
  "serum creatinine": "Serum Creatinine",
  "sr. creatinine": "Serum Creatinine",
  "s. creatinine": "Serum Creatinine",
  "uric acid": "Uric Acid",
  "egfr": "Estimated GFR",
  "gfr": "Estimated GFR",
  
  // Electrolytes
  "na": "Sodium",
  "sodium": "Sodium",
  "k": "Potassium",
  "potassium": "Potassium",
  "cl": "Chloride",
  "chloride": "Chloride",
  "ca": "Calcium",
  "calcium": "Calcium",
  "mg": "Magnesium",
  "magnesium": "Magnesium",
  "phosphorus": "Phosphorus",
  "phosphate": "Phosphorus",
  
  // Thyroid Function
  "tsh": "Thyroid Stimulating Hormone (TSH)",
  "thyroid stimulating hormone": "Thyroid Stimulating Hormone (TSH)",
  "t3": "Triiodothyronine (T3)",
  "total t3": "Triiodothyronine (T3)",
  "t4": "Thyroxine (T4)",
  "total t4": "Thyroxine (T4)",
  "ft3": "Free T3",
  "free t3": "Free T3",
  "ft4": "Free T4",
  "free t4": "Free T4",
  
  // Vitamin levels
  "vit d": "Vitamin D",
  "vitamin d": "Vitamin D",
  "25-oh vitamin d": "Vitamin D",
  "vit b12": "Vitamin B12",
  "vitamin b12": "Vitamin B12",
  "b12": "Vitamin B12",
  "folate": "Folate",
  "folic acid": "Folate",
  
  // Iron studies
  "iron": "Serum Iron",
  "serum iron": "Serum Iron",
  "tibc": "Total Iron Binding Capacity",
  "ferritin": "Ferritin",
  "serum ferritin": "Ferritin",
  
  // Differential Count
  "neutrophils": "Neutrophils",
  "lymphocytes": "Lymphocytes",
  "monocytes": "Monocytes",
  "eosinophils": "Eosinophils",
  "basophils": "Basophils",
  
  // Others
  "crp": "C-Reactive Protein",
  "c-reactive protein": "C-Reactive Protein",
  "hs-crp": "High-Sensitivity CRP",
  "psa": "Prostate Specific Antigen",
}

// Normalize parameter name to standard medical terminology
function normalizeParameterName(name: string): string {
  const lowerName = name.toLowerCase().trim()
  
  // Check exact match first
  if (PARAMETER_NAME_MAP[lowerName]) {
    return PARAMETER_NAME_MAP[lowerName]
  }
  
  // Check if any key is contained in the name
  for (const [key, value] of Object.entries(PARAMETER_NAME_MAP)) {
    if (lowerName === key || lowerName.includes(key)) {
      return value
    }
  }
  
  // If no match found, capitalize properly and return
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please add it to your .env.local file." },
        { status: 500 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")

    // Determine MIME type
    let mimeType = file.type
    if (file.type === "application/pdf") {
      mimeType = "application/pdf"
    } else if (file.type.startsWith("image/")) {
      mimeType = file.type
    }

    // Create the prompt for extracting lab parameters with FULL MEDICAL NAMES
    const prompt = `You are a medical document analyzer specializing in laboratory reports. Analyze this medical lab report and extract ALL lab parameters.

CRITICAL: Use FULL STANDARD MEDICAL NAMES for all parameters. DO NOT use abbreviations or shortcuts.

Parameter Name Guidelines - ALWAYS use these EXACT full names:
- Use "Hemoglobin" (NOT Hb, HB%, HGB, Hb1)
- Use "Red Blood Cell Count" (NOT RBC)
- Use "White Blood Cell Count" (NOT WBC, TLC)
- Use "Platelet Count" (NOT PLT)
- Use "Hematocrit" (NOT HCT, PCV)
- Use "Mean Corpuscular Volume" (NOT MCV)
- Use "Mean Corpuscular Hemoglobin" (NOT MCH)
- Use "Mean Corpuscular Hemoglobin Concentration" (NOT MCHC)
- Use "Erythrocyte Sedimentation Rate" (NOT ESR)
- Use "Fasting Blood Sugar" (NOT FBS)
- Use "Total Cholesterol" (NOT TC)
- Use "HDL Cholesterol" (NOT HDL, HDL-C)
- Use "LDL Cholesterol" (NOT LDL, LDL-C)
- Use "Triglycerides" (NOT TG)
- Use "Alanine Aminotransferase (ALT)" (NOT SGPT, ALT)
- Use "Aspartate Aminotransferase (AST)" (NOT SGOT, AST)
- Use "Serum Creatinine" (NOT Creatinine, S.Creatinine)
- Use "Blood Urea Nitrogen" (NOT BUN)
- Use "Thyroid Stimulating Hormone (TSH)" (NOT TSH)
- Use "Glycated Hemoglobin (HbA1c)" (NOT HbA1c, A1C)

For EACH parameter found, extract:
- parameterName: The FULL STANDARD MEDICAL NAME (as per guidelines above)
- value: The numeric or text value
- unit: The unit of measurement (g/dL, mg/dL, cells/mcL, etc.)
- normalRange: The reference/normal range from the report
- status: "Low", "Normal", or "High" based on the reference range
- testDate: Date in YYYY-MM-DD format (use today if not visible)

Return ONLY valid JSON (no markdown):
{
  "parameters": [
    {
      "parameterName": "string (FULL MEDICAL NAME)",
      "value": "string",
      "unit": "string",
      "normalRange": "string",
      "status": "Low" | "Normal" | "High",
      "testDate": "YYYY-MM-DD"
    }
  ],
  "documentType": "string",
  "labName": "string (if visible)",
  "patientInfo": "string (if visible)"
}`

    // Try different models until one works
    let result = null
    let lastError: Error | null = null
    let usedModel = ""
    
    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Trying model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ])
        usedModel = modelName
        console.log(`Successfully used model: ${modelName}`)
        break
      } catch (err: any) {
        console.log(`Model ${modelName} failed: ${err.message}`)
        lastError = err
        continue
      }
    }
    
    if (!result) {
      throw lastError || new Error("All Gemini models failed. Please check your API key.")
    }

    const response = await result.response
    const text = response.text()

    // Try to parse the JSON response
    let extractedData
    try {
      // Clean the response - remove any markdown code blocks if present
      let cleanedText = text.trim()
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.slice(7)
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.slice(3)
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.slice(0, -3)
      }
      cleanedText = cleanedText.trim()

      extractedData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text)
      return NextResponse.json(
        { 
          error: "Failed to parse AI response",
          rawResponse: text 
        },
        { status: 500 }
      )
    }

    // Add unique IDs and metadata to each parameter, and NORMALIZE names
    const parameters = extractedData.parameters.map((param: any, index: number) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      ...param,
      // Normalize the parameter name to standard medical terminology
      parameterName: normalizeParameterName(param.parameterName),
      sourceFile: file.name,
      extractedAt: new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      parameters,
      documentType: extractedData.documentType || "Unknown",
      labName: extractedData.labName || "Unknown",
      fileName: file.name,
      extractedAt: new Date().toISOString(),
      modelUsed: usedModel,
    })

  } catch (error: any) {
    console.error("Error processing file:", error)
    return NextResponse.json(
      { 
        error: error.message || "Failed to process file",
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
