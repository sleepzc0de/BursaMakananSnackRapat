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

    const user = verifyToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Akses ditolak' },
        { status: 403 }
      );
    }

    const recentRatings = await prisma.rating.findMany({
     take: 10,
     orderBy: {
       createdAt: 'desc',
     },
     include: {
       user: {
         select: {
           name: true,
         },
       },
       provider: {
         select: {
           name: true,
         },
       },
     },
   });

   const activity = recentRatings.map(rating => ({
     description: `${rating.user.name} memberikan rating ${rating.rating} bintang untuk ${rating.provider.name}`,
     time: new Date(rating.createdAt).toLocaleString('id-ID'),
   }));

   return NextResponse.json(activity);
 } catch (error) {
   console.error('Get recent activity error:', error);
   return NextResponse.json(
     { message: 'Terjadi kesalahan server' },
     { status: 500 }
   );
 }
}