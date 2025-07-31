// src/components/WorkflowTab.tsx (or WorkflowField.tsx)
'use client'
import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui/providers/DocumentInfo'
import { usePayloadAPI } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { getLogActionStyle, getStatusStyles, styles } from '@/lib/styles'

export const WorkflowTab = () => {
  // ✅ Get document info
  const { id: postId, collectionSlug } = useDocumentInfo()

  const router = useRouter()
  const val = 1

  // ✅ Use  usePayloadAPI to fetc  workflow data
  const [{ data: workflowData, isLoading: loading, isError }] = usePayloadAPI(
    val ? `/api/post/${val}?collection=${`contracts`}` : '',
  )

  const [comment, setComment] = React.useState('')
  const [processing, setProcessing] = React.useState(false)

  React.useEffect(() => {
    if (isError) {
      console.error('Failed to fetch workflow data:')
    }
  }, [isError])

  const handleWorkflowAction = async (action: string, stepId: string) => {
    if (!postId || !collectionSlug) return

    try {
      setProcessing(true)
      const response = await fetch('/api/workflows/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: postId,
          collection: collectionSlug,
          stepId,
          action,
          comment: comment.trim() || undefined,
        }),
      })

      if (response.ok) {
        setComment('')
        // Optionally refresh the page
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to process workflow action'}`)
      }
    } catch (error) {
      console.error('Workflow action failed:', error)
      alert('Failed to process workflow action')
    } finally {
      setProcessing(false)
    }
  }

  // Handle unsaved document
  if (!val) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>📝 Save the document first to see workflow information.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>⏳ Loading workflow information...</div>
      </div>
    )
  }

  if (isError || !workflowData) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>ℹ️ No active workflow found or error loading data.</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🔄 {workflowData.document.title}</h3>
      </div>

      <div>
        <h2 style={{ color: '#1a1a1a' }}>Status: </h2>
        <div
          style={{...styles.statusBadge,
            ...getStatusStyles(workflowData.document.workflowStatus),
          }}
        >
          {workflowData.document.workflowStatus.replace('-', ' ').toUpperCase()}
        </div>
        {workflowData.document.currentWorkflowStep && (
          <div style={styles.currentStep}>
            Current Step ID: {workflowData.document.currentWorkflowStep}
          </div>
        )}
      </div>

      {workflowData.document.currentWorkflowStep &&
        workflowData.document.workflowStatus === 'in-progress' && (
          <div style={styles.workflowActions}>
            <h4 style={styles.actionsTitle}>Available Actions</h4>
            <textarea
              style={styles.commentInput}
              placeholder="Add a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div style={styles.actionButtons}>
              <button
                style={{
                  ...styles.actionButton,
                  ...styles.approveBtn,
                  opacity: processing ? 0.6 : 1,
                }}
                onClick={() =>
                  handleWorkflowAction('approve', workflowData.document.currentWorkflowStep)
                }
                disabled={processing}
              >
                {processing ? 'Processing...' : '✅ Approve'}
              </button>
              <button
                style={{
                  ...styles.actionButton,
                  ...styles.rejectBtn,
                  opacity: processing ? 0.6 : 1,
                }}
                onClick={() =>
                  handleWorkflowAction('reject', workflowData.document.currentWorkflowStep)
                }
                disabled={processing}
              >
                {processing ? 'Processing...' : '❌ Reject'}
              </button>
              <button
                style={{
                  ...styles.actionButton,
                  ...styles.commentBtn,
                  opacity: processing || !comment.trim() ? 0.6 : 1,
                }}
                onClick={() =>
                  handleWorkflowAction('comment', workflowData.document.currentWorkflowStep)
                }
                disabled={processing || !comment.trim()}
              >
                {processing ? 'Processing...' : '💬 Add Comment'}
              </button>
            </div>
          </div>
        )}

      <div style={styles.workflowLogs}>
        <h4 style={styles.logsTitle}>📋 Activity Log</h4>
        {workflowData.document.activityLogs.map((log: any) => (
          <div key={log.id}>
            <div style={styles.logEntry}>
              <div style={styles.logHeader}>
                <span style={styles.logStep}>{log.stepName || '—'}</span>
                <span style={{ ...styles.logAction, ...getLogActionStyle(log.action) }}>
                  {log.action ? log.action.charAt(0).toUpperCase() + log.action.slice(1) : ''}
                </span>{' '}
              </div>
              {log.comment && (
                <div style={styles.logComment}>
                  {' '}
                  <span style={styles.logCommentLabel}>💬</span>
                  <span>{log.comment}</span>{' '}
                </div>
              )}
              <span style={styles.logTime}>{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


export default WorkflowTab
