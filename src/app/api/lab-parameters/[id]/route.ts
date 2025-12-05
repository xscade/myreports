import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import LabParameter from '@/models/LabParameter'
import { getCurrentUser } from '@/lib/auth'

// DELETE - Delete a specific lab parameter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { id } = await params

    await connectToDatabase()

    const result = await LabParameter.findOneAndDelete({
      _id: id,
      userId: user.userId,
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Parameter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Parameter deleted successfully',
    })

  } catch (error: any) {
    console.error('Delete parameter error:', error)
    return NextResponse.json(
      { error: 'Failed to delete parameter' },
      { status: 500 }
    )
  }
}

