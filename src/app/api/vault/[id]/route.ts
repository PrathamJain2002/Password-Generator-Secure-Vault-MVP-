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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateUser(request);
    const { cipher, iv, titleHint } = await request.json();

    if (!cipher || !iv) {
      return NextResponse.json(
        { error: 'Cipher and IV are required' },
        { status: 400 }
      );
    }

    const { id } = await params;
    const vaultItem = await VaultItem.findOneAndUpdate(
      { _id: id, ownerId: userId },
      { cipher, iv, titleHint, updatedAt: new Date() },
      { new: true }
    );

    if (!vaultItem) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: vaultItem._id,
      cipher: vaultItem.cipher,
      iv: vaultItem.iv,
      titleHint: vaultItem.titleHint,
      createdAt: vaultItem.createdAt,
      updatedAt: vaultItem.updatedAt,
    });
  } catch (error) {
    console.error('Update vault item error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateUser(request);

    const { id } = await params;
    const vaultItem = await VaultItem.findOneAndDelete({
      _id: id,
      ownerId: userId,
    });

    if (!vaultItem) {
      return NextResponse.json(
        { error: 'Vault item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete vault item error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}
