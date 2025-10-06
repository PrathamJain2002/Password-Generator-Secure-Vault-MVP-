import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VaultItem from '@/models/VaultItem';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

async function authenticateUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  
  await connectDB();
  const user = await User.findById(decoded.userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  return user._id;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateUser(request);

    const vaultItems = await VaultItem.find({ ownerId: userId })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json(vaultItems);
  } catch (error) {
    console.error('Get vault items error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateUser(request);
    const { cipher, iv, titleHint } = await request.json();

    if (!cipher || !iv) {
      return NextResponse.json(
        { error: 'Cipher and IV are required' },
        { status: 400 }
      );
    }

    const vaultItem = new VaultItem({
      ownerId: userId,
      cipher,
      iv,
      titleHint,
    });

    await vaultItem.save();

    return NextResponse.json({
      _id: vaultItem._id,
      cipher: vaultItem.cipher,
      iv: vaultItem.iv,
      titleHint: vaultItem.titleHint,
      createdAt: vaultItem.createdAt,
      updatedAt: vaultItem.updatedAt,
    });
  } catch (error) {
    console.error('Create vault item error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}
