import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nameUz, nameRu, code, regionId, geometry, center } = body;

    if (!nameUz || !code || !regionId) {
      return NextResponse.json(
        { error: 'nameUz, code, and regionId are required' },
        { status: 400 }
      );
    }

    const district = await prisma.district.update({
      where: { id },
      data: {
        nameUz,
        nameRu: nameRu || null,
        code,
        regionId,
        ...(geometry && { geometry }),
        ...(center && { center }),
      },
    });

    return NextResponse.json(district);
  } catch (error: any) {
    console.error('Error updating district:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'District not found' },
        { status: 404 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update district' },
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

    await prisma.district.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting district:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'District not found' },
        { status: 404 }
      );
    }
    if (error.code === 'P2014') {
      return NextResponse.json(
        { error: 'Cannot delete district with related mahallas or streets' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete district' },
      { status: 500 }
    );
  }
}
