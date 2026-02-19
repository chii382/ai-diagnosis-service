import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserIdFromSession } from '@/lib/getUserId';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import { Types } from 'mongoose';

function parseId(id: string): Types.ObjectId | null {
  if (!Types.ObjectId.isValid(id)) return null;
  return new Types.ObjectId(id);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const log = (step: string, data?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Diagnosis GET id] ${step}`, data ?? '');
    }
  };

  try {
    const { id } = await params;
    log('1. params', { id });

    const session = await auth();
    log('2. auth', { hasSession: !!session });

    const userId = await getUserIdFromSession(session);

    if (!userId) {
      log('3. userId missing');
      return NextResponse.json(
        { error: 'Unauthorized', debug: { step: 'userId' } },
        { status: 401 }
      );
    }
    log('3. userId ok', { userId: userId.toString() });

    const docId = parseId(id);
    if (!docId) {
      log('4. invalid id');
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    await connectDB();
    const diagnosis = await Diagnosis.findOne({ _id: docId, userId }).lean();

    if (!diagnosis) {
      const withoutUserId = await Diagnosis.findOne({ _id: docId }).lean();
      log('5. not found', {
        docExists: !!withoutUserId,
        docUserId: withoutUserId?.userId?.toString(),
        queryUserId: userId.toString(),
      });
      return NextResponse.json(
        {
          error: 'Not found',
          debug:
            process.env.NODE_ENV === 'development'
              ? {
                  docExists: !!withoutUserId,
                  userIdMismatch: !!withoutUserId && withoutUserId.userId?.toString() !== userId.toString(),
                }
              : undefined,
        },
        { status: 404 }
      );
    }

    log('5. found, returning');
    return NextResponse.json({
      id: diagnosis._id.toString(),
      answers: diagnosis.answers,
      result: diagnosis.result,
      careerRoadmap: diagnosis.careerRoadmap,
      createdAt: diagnosis.createdAt,
      updatedAt: diagnosis.updatedAt,
    });
  } catch (error) {
    console.error('Diagnosis GET [id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = await getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const docId = parseId(id);
    if (!docId) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const { result, careerRoadmap } = body as {
      result?: Record<string, unknown>;
      careerRoadmap?: Record<string, string>;
    };

    await connectDB();
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (result !== undefined) updateData.result = result;
    if (careerRoadmap !== undefined) updateData.careerRoadmap = careerRoadmap;

    const diagnosis = await Diagnosis.findOneAndUpdate(
      { _id: docId, userId },
      { $set: updateData },
      { new: true }
    ).lean();

    if (!diagnosis) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: diagnosis._id.toString(),
      answers: diagnosis.answers,
      result: diagnosis.result,
      careerRoadmap: diagnosis.careerRoadmap,
      createdAt: diagnosis.createdAt,
      updatedAt: diagnosis.updatedAt,
    });
  } catch (error) {
    console.error('Diagnosis PUT [id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = await getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const docId = parseId(id);
    if (!docId) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    await connectDB();
    const result = await Diagnosis.findOneAndDelete({ _id: docId, userId });

    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Diagnosis DELETE [id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
