import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import LabParameter from '@/models/LabParameter'
import { getCurrentUser } from '@/lib/auth'

// GET - Fetch all lab parameters for the logged-in user
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const parameters = await LabParameter.find({ userId: user.userId })
      .sort({ testDate: -1, createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      parameters: parameters.map(p => ({
        id: p._id.toString(),
        parameterName: p.parameterName,
        value: p.value,
        unit: p.unit,
        normalRange: p.normalRange,
        status: p.status,
        testDate: p.testDate,
        sourceFile: p.sourceFile,
        extractedAt: p.extractedAt,
      })),
    })

  } catch (error: any) {
    console.error('Fetch parameters error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lab parameters' },
      { status: 500 }
    )
  }
}

// POST - Add new lab parameters (with duplicate check)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { parameters } = await request.json()

    if (!parameters || !Array.isArray(parameters)) {
      return NextResponse.json(
        { error: 'Parameters array is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const results = {
      added: 0,
      skipped: 0,
      errors: 0,
    }

    for (const param of parameters) {
      try {
        // Check for existing duplicate by:
        // 1. Same parameter name, value, date, and unit (exact duplicate)
        // 2. Same source file name (same file uploaded again)
        const existingByData = await LabParameter.findOne({
          userId: user.userId,
          parameterName: param.parameterName,
          value: param.value,
          testDate: param.testDate,
          unit: param.unit,
        })

        if (existingByData) {
          results.skipped++
          continue
        }

        // Also check if same parameter from same source file already exists
        const existingByFile = await LabParameter.findOne({
          userId: user.userId,
          parameterName: param.parameterName,
          sourceFile: param.sourceFile || 'Unknown',
          testDate: param.testDate,
        })

        if (existingByFile) {
          results.skipped++
          continue
        }

        // Create new parameter
        await LabParameter.create({
          userId: user.userId,
          parameterName: param.parameterName,
          value: param.value,
          unit: param.unit,
          normalRange: param.normalRange,
          status: param.status,
          testDate: param.testDate,
          sourceFile: param.sourceFile || 'Unknown',
        })

        results.added++

      } catch (error: any) {
        // Handle duplicate key error silently
        if (error.code === 11000) {
          results.skipped++
        } else {
          console.error('Error adding parameter:', error)
          results.errors++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${results.added} parameters, skipped ${results.skipped} duplicates`,
      results,
    })

  } catch (error: any) {
    console.error('Add parameters error:', error)
    return NextResponse.json(
      { error: 'Failed to add lab parameters' },
      { status: 500 }
    )
  }
}

// DELETE - Delete all lab parameters for the user (clear data)
export async function DELETE() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const result = await LabParameter.deleteMany({ userId: user.userId })

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} parameters`,
      deletedCount: result.deletedCount,
    })

  } catch (error: any) {
    console.error('Delete parameters error:', error)
    return NextResponse.json(
      { error: 'Failed to delete lab parameters' },
      { status: 500 }
    )
  }
}

