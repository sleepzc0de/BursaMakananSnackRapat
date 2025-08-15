import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    let currentUser = null;
    
    if (token) {
      currentUser = await verifyToken(token);
    }

    const providers = await prisma.provider.findMany({
      include: {
        ratings: currentUser ? {
          where: { userId: currentUser.id },
          select: {
            rating: true,
            comment: true,
          },
        } : false,
        foods: {
          orderBy: [
            { category: 'asc' },
            { name: 'asc' }
          ],
        },
        _count: {
          select: { ratings: true }
        }
      },
      orderBy: {
        averageRating: 'desc',
      },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Get providers error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const {
      name,
      canGiveReceipt,
      hasStamp,
      canCredit,
      description,
      address,
      phone,
    } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Nama provider harus diisi' },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.create({
      data: {
        name,
        canGiveReceipt: canGiveReceipt || false,
        hasStamp: hasStamp || false,
        canCredit: canCredit || false,
        description: description || null,
        address: address || null,
        phone: phone || null,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error('Create provider error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}