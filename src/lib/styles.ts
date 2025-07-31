// ✅ Helper functions
export function getStatusStyles(status: string) {
    const statusStyles = {
      'in-progress': { backgroundColor: '#e3f2fd', color: '#1976d2' },
      completed: { backgroundColor: '#e8f5e8', color: '#2e7d32' },
      rejected: { backgroundColor: '#ffebee', color: '#d32f2f' },
      'not-started': { backgroundColor: '#f5f5f5', color: '#666' },
    }
    return statusStyles[status as keyof typeof statusStyles] || statusStyles['not-started']
  }
  
  export function getLogActionStyle(action: string) {
    const actionStyles = {
      approved: { color: '#2e7d32', fontWeight: '600' },
      rejected: { color: '#d32f2f', fontWeight: '600' },
      commented: { color: '#1976d2', fontWeight: '600' },
      started: { color: '#ed6c02', fontWeight: '600' },
      completed: { color: '#2e7d32', fontWeight: '600' },
      escalated: { color: '#9c27b0', fontWeight: '600' },
    }
    return actionStyles[action as keyof typeof actionStyles] || { color: '#666' }
  }
  
  // ✅ CSS-in-JS styles instead of styled-jsx
  export const styles = {
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
    statusTitle: {
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
    workflowLogs: {
      backgroundColor: '#f7fafd', // subtle blue-tinted background
      border: '1px solid #d0e3f1',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(30, 64, 175, 0.04)',
    },
    logsTitle: {
      fontSize: '17px',
      fontWeight: '600',
      marginBottom: '18px',
      color: '#205081',
      margin: '0 0 18px 0',
      letterSpacing: '0.01em',
    },
    emptyLogs: {
      color: '#8ca0b3',
      fontStyle: 'italic',
      margin: 0,
      fontSize: '15px',
      textAlign: 'center',
    },
    logEntry: {
      marginBottom: '16px',
      padding: '12px',
      borderRadius: '6px',
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
    },
    logHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    logStep: {
      fontSize: '14px',
      color: '#333',
      fontWeight: '500',
    },
    logAction: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
    },
    logTime: {
      fontSize: '12px',
      color: '#666',
    },
    logComment: {
      fontSize: '14px',
      color: '#333',
      fontStyle: 'italic',
      backgroundColor: '#f8f9fa',
      padding: '8px',
      borderRadius: '4px',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    logCommentLabel: {
      fontSize: '16px',
    },
  } as const