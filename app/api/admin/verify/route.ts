import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    // Check if user is admin (you might want to check Firestore for admin status)
    // For this example, we'll just check against a hardcoded UID
    const ADMIN_UID = process.env.ADMIN_UID
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log(token)
    if (token === ADMIN_UID) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 })
    }
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}