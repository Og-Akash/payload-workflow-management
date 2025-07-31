import { PayloadHandler, PayloadRequest } from "payload"
import { checkStepPermission, logWorkflowAction } from "./workflow"
import { CollectionSlug } from "payload"
import { Post } from "@/payload-types"

// Custom API endpoints
export const triggerWorkflowHandler: PayloadHandler = async (req) => {
    const { user, payload } = req
  
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  
    if (typeof req.json !== 'function') {
      return new Response(JSON.stringify({ error: 'Request body parser not available' }), {
        status: 400,
      })
    }
    const { documentId, collection, stepId, action, comment } = await req.json()
  
    console.log('handler req object:', { documentId, collection, stepId, action, comment })
  
    // Find the document
    const doc = await payload.findByID({ collection, id: documentId })
    if (!doc) {
      return new Response(JSON.stringify({ error: 'Document not found' }), { status: 404 })
    }
  
    // Find the workflow
    const workflows = await payload.find({
      collection: 'workflows',
      where: {
        and: [{ targetCollection: { equals: collection } }, { isActive: { equals: true } }],
      },
    })
  
    if (workflows.docs.length === 0) {
      return new Response(JSON.stringify({ error: 'Workflow not found' }), { status: 404 })
    }
  
    const workflow = workflows.docs[0]
    const step = workflow.steps?.find((s: any) => s.order.toString() === stepId)
  
    if (!step) {
      return new Response(JSON.stringify({ error: 'Step not found' }), { status: 404 })
    }
  
    const hasPermission = await checkStepPermission(step, user, payload)
    if (!hasPermission) {
      return new Response(JSON.stringify({ error: 'Unauthorized for this step' }), { status: 403 })
    }
  
    const updateData: any = {}
  
    if (action === 'approve') {
      const nextStep = workflow.steps?.find((s: any) => s.order === step.order + 1)
      updateData.currentWorkflowStep = nextStep ? nextStep.order.toString() : null
      updateData.workflowStatus = nextStep ? 'in-progress' : 'completed'
    } else if (action === 'reject') {
      updateData.workflowStatus = 'rejected'
      updateData.currentWorkflowStep = null
    }
  
    const updatedDoc = await payload.update({ collection, id: documentId, data: updateData })
  
    await logWorkflowAction({
      workflowId: workflow.id,
      documentId,
      collection: documentId.toString(),
      stepId,
      stepName: step.stepName,
      action,
      user: user.id,
      comment,
      payload,
    })
  
    return new Response(
      JSON.stringify({
        success: true,
        message: `Workflow ${action} processed successfully`,
        document: updatedDoc,
      }),
      { status: 200 },
    )
  }
  
  export const getWorkflowStatusHandler = async (req: PayloadRequest): Promise<Response> => {
    try {
      // ✅ Use routeParams instead of params
      const routeParams = await req.routeParams
  
      const { docId, collection } = routeParams as { docId: string; collection: CollectionSlug }
  
      console.log('[Workflow API] Status request params:', { collection, docId })
  
      const { payload, user } = req
  
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      // Test document lookup
      try {
        const doc = (await payload.findByID({
          collection: collection as CollectionSlug,
          id: docId,
        })) as Post
  
        return Response.json(
          {
            success: true,
            docId,
            collection,
            document: {
              id: doc.id,
              title: doc.title || 'No title',
              workflowStatus: doc.workflowStatus || 'not-started',
              currentWorkflowStep: doc.currentWorkflowStep || null,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 200 },
        )
      } catch (docError) {
        console.error('[Workflow API] Document not found:', docError)
        return Response.json(
          {
            success: false,
            error: 'Document not found',
            docId,
            collection,
          },
          { status: 404 },
        )
      }
    } catch (error) {
      console.error('[Workflow API] Status error:', error)
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
  