import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      nameUz,
      nameRu,
      code,
      districtId,
      geometry,
      center,
      uzKadName,
      geoCode,
      oneId,
      hidden,
      mergedIntoId,
      mergedIntoName,
    } = body;

    if (!nameUz || !code || !districtId) {
      return NextResponse.json(
        { error: 'nameUz, code, and districtId are required' },
        { status: 400 }
      );
    }

    const mahalla = await prisma.mahalla.update({
      where: { id },
      data: {
        nameUz,
        nameRu: nameRu || null,
        code,
        districtId,
        ...(geometry && { geometry }),
        ...(center && { center }),
        ...(uzKadName !== undefined && { uzKadName: uzKadName || null }),
        ...(geoCode !== undefined && { geoCode: geoCode || null }),
        ...(oneId !== undefined && { oneId: oneId || null }),
        ...(hidden !== undefined && { hidden }),
        ...(mergedIntoId !== undefined && {
          mergedIntoId: mergedIntoId || null,
        }),
        ...(mergedIntoName !== undefined && {
          mergedIntoName: mergedIntoName || null,
        }),
      },
    });

    return NextResponse.json(mahalla);
  } catch (error: any) {
    console.error('Error updating mahalla:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Mahalla not found' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'District not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update mahalla' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.mahalla.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting mahalla:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Mahalla not found' }, { status: 404 });
    }
    if (error.code === 'P2014') {
      return NextResponse.json(
        { error: 'Cannot delete mahalla with related streets' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete mahalla' },
      { status: 500 }
    );
  }
}
