import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

export async function GET(request) {
  try {
    const foods = await prisma.food.findMany({
      include: {
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error('Get foods error:', error);
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
      description,
      price,
      category,
      providerId,
      isAvailable,
    } = await request.json();

    console.log('Creating food:', { name, description, price, category, providerId, isAvailable });

    if (!name || !category || !providerId) {
      return NextResponse.json(
        { message: 'Nama, kategori, dan provider harus diisi' },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { message: 'Provider tidak ditemukan' },
        { status: 400 }
      );
    }

    const food = await prisma.food.create({
      data: {
        name,
        description: description || null,
        price: price ? parseFloat(price) : null,
        category,
        providerId,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log('Food created:', food);
    return NextResponse.json(food, { status: 201 });
  } catch (error) {
    console.error('Create food error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}