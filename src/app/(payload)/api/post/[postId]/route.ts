import { NextRequest, NextResponse } from 'next/server'
import { CollectionSlug, getPayload } from 'payload'
import config from '@payload-config'
import { Post } from '@/payload-types'

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  const searchParams = req.nextUrl.searchParams
  const collection = searchParams.get('collection') as CollectionSlug
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const doc = (await payload.findByID({
    collection: collection as CollectionSlug,
    id: postId,
  })) as Post

  const activityLogs = await payload.find({
    collection: 'workflowLogs',
    where: {
      documentId: { equals: doc.id },
      collection: { equals: collection },
    },
    sort: '-createdAt',
  })

  return Response.json(
    {
      success: true,
      doc: doc,
      collection,
      document: {
        id: doc.id,
        title: doc.title || 'No title',
        workflowStatus: doc.workflowStatus || 'not-started',
        currentWorkflowStep: doc.currentWorkflowStep || null,
        activityLogs: activityLogs.docs,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  )
}
