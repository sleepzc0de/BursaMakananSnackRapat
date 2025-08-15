import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request, { params }) {
  try {
    const food = await prisma.food.findUnique({
      where: { id: params.id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!food) {
      return NextResponse.json(
        { message: 'Makanan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(food);
  } catch (error) {
    console.error('Get food error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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

    if (!name || !category || !providerId) {
      return NextResponse.json(
        { message: 'Nama, kategori, dan provider harus diisi' },
        { status: 400 }
      );
    }

    // Check if food exists
    const existingFood = await prisma.food.findUnique({
      where: { id: params.id },
    });

    if (!existingFood) {
      return NextResponse.json(
        { message: 'Makanan tidak ditemukan' },
        { status: 404 }
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

    const food = await prisma.food.update({
      where: { id: params.id },
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

    return NextResponse.json(food);
  } catch (error) {
    console.error('Update food error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    // Check if food exists
    const existingFood = await prisma.food.findUnique({
      where: { id: params.id },
    });

    if (!existingFood) {
      return NextResponse.json(
        { message: 'Makanan tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.food.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Makanan berhasil dihapus' });
  } catch (error) {
    console.error('Delete food error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}