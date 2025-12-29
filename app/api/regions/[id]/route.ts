import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nameUz, nameRu, code, geometry, center } = body;

    if (!nameUz || !code) {
      return NextResponse.json(
        { error: 'nameUz and code are required' },
        { status: 400 }
      );
    }

    const region = await prisma.region.update({
      where: { id },
      data: {
        nameUz,
        nameRu: nameRu || null,
        code,
        ...(geometry && { geometry }),
        ...(center && { center }),
      },
    });

    return NextResponse.json(region);
  } catch (error: any) {
    console.error('Error updating region:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update region' },
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

    await prisma.region.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting region:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }
    if (error.code === 'P2014') {
      return NextResponse.json(
        { error: 'Cannot delete region with related districts' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete region' },
      { status: 500 }
    );
  }
}
