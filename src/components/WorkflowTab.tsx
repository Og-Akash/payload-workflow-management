// src/components/WorkflowTab.tsx (or WorkflowField.tsx)
'use client'
import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui/providers/DocumentInfo'
import { usePayloadAPI } from '@payloadcms/ui'

export const WorkflowTab = () => {
  // ✅ Get document info
  const { id: docId, collectionSlug } = useDocumentInfo()

  // ✅ Use usePayloadAPI to fetch workflow data
  const [{ data: workflowData, isLoading: loading, isError }] = usePayloadAPI(
    docId ? `/api/workflows/status?collection=${collectionSlug}&docId=${docId}` : '',
    { initialParams: { depth: 2 } } // Adjust depth if needed for relationships
  )

  const [comment, setComment] = React.useState('')
  const [processing, setProcessing] = React.useState(false)

  React.useEffect(() => {
    if (isError) {
      console.error('Failed to fetch workflow data:')
    }
  }, [isError])

  const handleWorkflowAction = async (action: string, stepId: string) => {
    if (!docId || !collectionSlug) return

    try {
      setProcessing(true)
      const response = await fetch('/api/workflows/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: docId,
          collection: collectionSlug,
          stepId,
          action,
          comment: comment.trim() || undefined,
        }),
      })

      if (response.ok) {
        setComment('')
        // Optionally refresh the page
        window.location.reload()
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
  if (!docId) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>
          📝 Save the document first to see workflow information.
        </div>
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
        <div style={styles.message}>
          ℹ️ No active workflow found or error loading data.
        </div>
      </div>
    )
  }
return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🔄 {workflowData.workflow.name}</h3>
        {workflowData.workflow.description && (
          <p style={styles.description}>{workflowData.workflow.description}</p>
        )}
      </div>

      <div style={styles.currentStatus}>
        <div style={{
          ...styles.statusBadge,
          ...getStatusStyles(workflowData.workflowStatus)
        }}>
          {workflowData.workflowStatus.replace('-', ' ').toUpperCase()}
        </div>
        {workflowData.currentStep && (
          <>
            <div style={styles.currentStep}>
              Current Step: {workflowData.currentStep.name}
            </div>
            <div style={styles.stepType}>
              Type: {workflowData.currentStep.type}
            </div>
          </>
        )}
      </div>

      {workflowData.currentStep && workflowData.workflowStatus === 'in-progress' && (
        <div style={styles.workflowActions}>
          <h4 style={styles.actionsTitle}>Available Actions</h4>
          <textarea
            style={styles.commentInput}
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div style={styles.actionButtons}>
            {['approval', 'review', 'sign-off'].includes(workflowData.currentStep.type) && (
              <>
                <button
                  style={{
                    ...styles.actionButton,
                    ...styles.approveBtn,
                    opacity: processing ? 0.6 : 1
                  }}
                  onClick={() => handleWorkflowAction('approve', workflowData.currentStep.id)}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : '✅ Approve'}
                </button>
                <button
                  style={{
                    ...styles.actionButton,
                    ...styles.rejectBtn,
                    opacity: processing ? 0.6 : 1
                  }}
                  onClick={() => handleWorkflowAction('reject', workflowData.currentStep.id)}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : '❌ Reject'}
                </button>
              </>
            )}
            <button
              style={{
                ...styles.actionButton,
                ...styles.commentBtn,
                opacity: (processing || !comment.trim()) ? 0.6 : 1
              }}
              onClick={() => handleWorkflowAction('comment', workflowData.currentStep.id)}
              disabled={processing || !comment.trim()}
            >
              {processing ? 'Processing...' : '💬 Add Comment'}
            </button>
          </div>
        </div>
      )}

      <div style={styles.workflowProgress}>
        <h4 style={styles.progressTitle}>📊 Workflow Progress</h4>
        <div style={styles.progressSteps}>
          {workflowData.workflow.steps.map((step: any) => {
            const isCurrent = workflowData.currentStep?.id === step.id
            const isCompleted = workflowData.currentStep ? 
              parseInt(workflowData.currentStep.id) > step.order : false
            
            return (
              <div key={step.id} style={{
                ...styles.progressStep,
                backgroundColor: isCurrent ? '#e3f2fd' : isCompleted ? '#e8f5e8' : '#f5f5f5'
              }}>
                <div style={{
                  ...styles.stepIndicator,
                  backgroundColor: isCurrent ? '#2196f3' : isCompleted ? '#4caf50' : '#ccc'
                }}>
                  {isCompleted ? '✓' : step.order}
                </div>
                <div style={styles.stepInfo}>
                  <div style={styles.stepName}>{step.name}</div>
                  <div style={styles.stepAssigned}>
                    {step.assignedTo.type === 'role' ? 
                      `👥 Assigned to: ${step.assignedTo.role}` :
                      `👤 Assigned to: User ID ${step.assignedTo.user}`
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={styles.workflowLogs}>
        <h4 style={styles.logsTitle}>📋 Activity Log</h4>
        {workflowData.logs.length === 0 ? (
          <p style={styles.emptyLogs}>No activity yet</p>
        ) : (
          workflowData.logs.map((log: any) => (
            <div key={log.id} style={styles.logEntry}>
              <div style={styles.logHeader}>
                <span style={styles.logAction}>
                  {getActionEmoji(log.action)} {log.action.toUpperCase()}
                </span>
                <span style={styles.logTime}>
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={styles.logStep}>Step: {log.stepName}</div>
              {log.comment && (
                <div style={styles.logComment}>"{log.comment}"</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ✅ Helper functions
function getStatusStyles(status: string) {
  const statusStyles = {
    'in-progress': { backgroundColor: '#e3f2fd', color: '#1976d2' },
    'completed': { backgroundColor: '#e8f5e8', color: '#2e7d32' },
    'rejected': { backgroundColor: '#ffebee', color: '#d32f2f' },
    'not-started': { backgroundColor: '#f5f5f5', color: '#666' }
  }
  return statusStyles[status as keyof typeof statusStyles] || statusStyles['not-started']
}

function getActionEmoji(action: string) {
  const emojiMap: { [key: string]: string } = {
    'approved': '✅',
    'rejected': '❌',
    'commented': '💬',
    'started': '🚀',
    'completed': '✅',
    'escalated': '⚡'
  }
  return emojiMap[action] || '📝'
}

// ✅ CSS-in-JS styles instead of styled-jsx
const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  description: {
    color: '#666',
    fontSize: '14px',
    margin: 0,
  },
  message: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#666',
    fontSize: '16px',
  },
  currentStatus: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '24px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '8px',
  },
  currentStep: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1a1a1a',
  },
  stepType: {
    color: '#666',
    fontSize: '14px',
    marginTop: '4px',
  },
  workflowActions: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '24px',
  },
  actionsTitle: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '12px',
    color: '#1a1a1a',
    margin: '0 0 12px 0',
  },
  commentInput: {
    width: '100%',
    minHeight: '80px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '14px',
    marginBottom: '12px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  approveBtn: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  rejectBtn: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  commentBtn: {
    backgroundColor: '#2196f3',
    color: 'white',
  },
  workflowProgress: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '24px',
  },
  progressTitle: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '16px',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
  },
  progressSteps: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  progressStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    borderRadius: '4px',
  },
  stepIndicator: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontWeight: '500',
    color: '#1a1a1a',
  },
  stepAssigned: {
    fontSize: '12px',
    color: '#666',
    marginTop: '2px',
  },
  workflowLogs: {
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '16px',
  },
  logsTitle: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '16px',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
  },
  emptyLogs: {
    color: '#666',
    fontStyle: 'italic',
    margin: 0,
  },
  logEntry: {
    borderBottom: '1px solid #f0f0f0',
    padding: '12px 0',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  logAction: {
    fontWeight: '500',
    color: '#1a1a1a',
  },
  logTime: {
    fontSize: '12px',
    color: '#666',
  },
  logStep: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  logComment: {
    fontSize: '14px',
    color: '#333',
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '8px',
  },
} as const

export default WorkflowTab
