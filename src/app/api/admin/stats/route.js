import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request) {
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

    try {
      const [
        totalProviders,
        totalFoods,
        totalUsers,
        totalRatings,
      ] = await Promise.all([
        prisma.provider.count(),
        prisma.food.count(),
        prisma.user.count(),
        prisma.rating.count(),
      ]);

      console.log('Stats:', { totalProviders, totalFoods, totalUsers, totalRatings });

      return NextResponse.json({
        totalProviders,
        totalFoods,
        totalUsers,
        totalRatings,
      });
    } catch (dbError) {
      console.error('Database error in stats:', dbError);
      return NextResponse.json({
        totalProviders: 0,
        totalFoods: 0,
        totalUsers: 0,
        totalRatings: 0,
      });
    }
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}