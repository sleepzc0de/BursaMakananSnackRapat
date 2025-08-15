import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

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
    if (!user) {
      return NextResponse.json(
        { message: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const { providerId, rating, comment } = await request.json();

    if (!providerId || !rating) {
      return NextResponse.json(
        { message: 'Provider ID dan rating harus diisi' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating harus antara 1-5' },
        { status: 400 }
      );
    }

    // Check if user already rated this provider
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_providerId: {
          userId: user.id,
          providerId,
        },
      },
    });

    let newRating;
    if (existingRating) {
      // Update existing rating
      newRating = await prisma.rating.update({
        where: {
          userId_providerId: {
            userId: user.id,
            providerId,
          },
        },
        data: {
          rating,
          comment: comment || null,
        },
      });
    } else {
      // Create new rating
      newRating = await prisma.rating.create({
        data: {
          userId: user.id,
          providerId,
          rating,
          comment: comment || null,
        },
      });
    }

    // Recalculate provider's average rating
    const allRatings = await prisma.rating.findMany({
      where: { providerId },
      select: { rating: true },
    });

    const totalRatings = allRatings.length;
    const averageRating = totalRatings > 0 
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    // Update provider with new average rating
    await prisma.provider.update({
      where: { id: providerId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings,
      },
    });

    return NextResponse.json(newRating);
  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}