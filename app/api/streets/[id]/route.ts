import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nameUz, nameRu, code, districtId, geometry, center } = body;

    if (!nameUz || !code || !districtId) {
      return NextResponse.json(
        { error: 'nameUz, code, and districtId are required' },
        { status: 400 }
      );
    }

    const street = await prisma.street.update({
      where: { id },
      data: {
        nameUz,
        nameRu: nameRu || null,
        code,
        districtId,
        ...(geometry && { geometry }),
        ...(center && { center }),
      },
    });

    return NextResponse.json(street);
  } catch (error: any) {
    console.error('Error updating street:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Street not found' }, { status: 404 });
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
      { error: 'Failed to update street' },
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

    await prisma.street.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting street:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Street not found' }, { status: 404 });
    }
    if (error.code === 'P2014') {
      return NextResponse.json(
        { error: 'Cannot delete street with related mahallas' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete street' },
      { status: 500 }
    );
  }
}
