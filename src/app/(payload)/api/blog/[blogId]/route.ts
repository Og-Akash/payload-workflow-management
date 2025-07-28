import { NextRequest, NextResponse } from 'next/server'
import { CollectionSlug, getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> },
) {
  const { blogId } = await params
  const searchParams = req.nextUrl.searchParams
  const collection = searchParams.get('collecton') as CollectionSlug
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const matchedBlog = await payload.findByID({
    collection: collection || 'blog',
    id: blogId,
  })

  return NextResponse.json(matchedBlog)
}
