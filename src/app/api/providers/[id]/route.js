import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request, { params }) {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: params.id },
      include: {
        foods: true,
        ratings: true,
        _count: {
          select: { ratings: true }
        }
      },
    });

    if (!provider) {
      return NextResponse.json(
        { message: 'Provider tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Get provider error:', error);
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

    // Check if provider exists
    const existingProvider = await prisma.provider.findUnique({
      where: { id: params.id },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { message: 'Provider tidak ditemukan' },
        { status: 404 }
      );
    }

    const provider = await prisma.provider.update({
      where: { id: params.id },
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

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Update provider error:', error);
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

    // Check if provider exists
    const existingProvider = await prisma.provider.findUnique({
      where: { id: params.id },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { message: 'Provider tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete provider (this will cascade delete related foods and ratings)
    await prisma.provider.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Provider berhasil dihapus' });
  } catch (error) {
    console.error('Delete provider error:', error);
    
    // Check if it's a foreign key constraint error
    if (error.code === 'P2003') {
      return NextResponse.json(
        { message: 'Tidak dapat menghapus provider karena masih memiliki data terkait' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}