'use client'

import { useState } from 'react'
import { useToast } from './Toast'
import { 
  TrashIcon, 
  PencilIcon, 
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

interface BulkAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  requiresConfirmation?: boolean
  confirmationTitle?: string
  confirmationMessage?: string
  adminOnly?: boolean
}

interface BulkActionsProps {
  selectedItems: string[]
  totalItems: number
  entityType: 'users' | 'wines' | 'orders'
  onAction: (actionId: string, selectedIds: string[]) => Promise<void>
  onSelectAll?: () => void
  onClearSelection?: () => void
  customActions?: BulkAction[]
  isAdmin?: boolean
}

export default function BulkActions({ 
  selectedItems, 
  totalItems, 
  entityType,
  onAction,
  onSelectAll,
  onClearSelection,
  customActions = [],
  isAdmin = false
}: BulkActionsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const toast = useToast()

  const defaultActions: Record<string, BulkAction[]> = {
    users: [
      {
        id: 'verify',
        label: 'Verify Selected',
        icon: CheckIcon,
        color: 'success',
        requiresConfirmation: true,
        confirmationTitle: 'Verify Users',
        confirmationMessage: `Are you sure you want to verify ${selectedItems.length} user(s)? This will mark them as verified users.`
      },
      {
        id: 'unverify',
        label: 'Unverify Selected',
        icon: XMarkIcon,
        color: 'warning',
        requiresConfirmation: true,
        confirmationTitle: 'Unverify Users',
        confirmationMessage: `Are you sure you want to unverify ${selectedItems.length} user(s)? This will remove their verified status.`
      },
      {
        id: 'ban',
        label: 'Ban Selected',
        icon: ExclamationTriangleIcon,
        color: 'danger',
        requiresConfirmation: true,
        confirmationTitle: 'Ban Users',
        confirmationMessage: `Are you sure you want to ban ${selectedItems.length} user(s)? They will no longer be able to access the platform.`,
        adminOnly: true
      },
      {
        id: 'export',
        label: 'Export Selected',
        icon: ArrowDownTrayIcon,
        color: 'neutral'
      }
    ],
    wines: [
      {
        id: 'approve',
        label: 'Approve Selected',
        icon: CheckIcon,
        color: 'success',
        requiresConfirmation: true,
        confirmationTitle: 'Approve Wines',
        confirmationMessage: `Are you sure you want to approve ${selectedItems.length} wine(s)? They will become visible to buyers.`
      },
      {
        id: 'reject',
        label: 'Reject Selected',
        icon: XMarkIcon,
        color: 'danger',
        requiresConfirmation: true,
        confirmationTitle: 'Reject Wines',
        confirmationMessage: `Are you sure you want to reject ${selectedItems.length} wine(s)? They will be removed from listings.`
      },
      {
        id: 'feature',
        label: 'Feature Selected',
        icon: EyeIcon,
        color: 'primary',
        requiresConfirmation: true,
        confirmationTitle: 'Feature Wines',
        confirmationMessage: `Are you sure you want to feature ${selectedItems.length} wine(s)? They will appear prominently on the platform.`,
        adminOnly: true
      },
      {
        id: 'export',
        label: 'Export Selected',
        icon: ArrowDownTrayIcon,
        color: 'neutral'
      }
    ],
    orders: [
      {
        id: 'mark-shipped',
        label: 'Mark as Shipped',
        icon: CheckIcon,
        color: 'primary',
        requiresConfirmation: true,
        confirmationTitle: 'Mark Orders as Shipped',
        confirmationMessage: `Are you sure you want to mark ${selectedItems.length} order(s) as shipped? This will update their status and notify customers.`
      },
      {
        id: 'mark-delivered',
        label: 'Mark as Delivered',
        icon: CheckIcon,
        color: 'success',
        requiresConfirmation: true,
        confirmationTitle: 'Mark Orders as Delivered',
        confirmationMessage: `Are you sure you want to mark ${selectedItems.length} order(s) as delivered? This will complete the order process.`
      },
      {
        id: 'cancel',
        label: 'Cancel Selected',
        icon: XMarkIcon,
        color: 'danger',
        requiresConfirmation: true,
        confirmationTitle: 'Cancel Orders',
        confirmationMessage: `Are you sure you want to cancel ${selectedItems.length} order(s)? This action may trigger refunds.`,
        adminOnly: true
      },
      {
        id: 'export',
        label: 'Export Selected',
        icon: ArrowDownTrayIcon,
        color: 'neutral'
      }
    ]
  }

  const getActionColor = (color: BulkAction['color']) => {
    const colors = {
      primary: 'text-primary-700 hover:bg-primary-50',
      success: 'text-green-700 hover:bg-green-50',
      warning: 'text-yellow-700 hover:bg-yellow-50',
      danger: 'text-red-700 hover:bg-red-50',
      neutral: 'text-gray-700 hover:bg-gray-50'
    }
    return colors[color]
  }

  const availableActions = [
    ...defaultActions[entityType],
    ...customActions
  ].filter(action => !action.adminOnly || isAdmin)

  const handleAction = async (action: BulkAction) => {
    if (selectedItems.length === 0) {
      toast.error('No items selected', 'Please select items to perform this action')
      return
    }

    if (action.requiresConfirmation) {
      setConfirmAction(action)
      setIsDropdownOpen(false)
      return
    }

    await executeAction(action)
  }

  const executeAction = async (action: BulkAction) => {
    setIsProcessing(true)
    try {
      await onAction(action.id, selectedItems)
      toast.success(
        `${action.label} completed`,
        `Successfully processed ${selectedItems.length} item(s)`
      )
      onClearSelection?.()
    } catch (error) {
      console.error(`Error executing ${action.label}:`, error)
      toast.error(
        `${action.label} failed`,
        error instanceof Error ? error.message : 'Please try again'
      )
    } finally {
      setIsProcessing(false)
      setConfirmAction(null)
    }
  }

  const cancelConfirmation = () => {
    setConfirmAction(null)
  }

  if (selectedItems.length === 0) {
    return null
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ClipboardDocumentListIcon className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-gray-900">
                {selectedItems.length} of {totalItems} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {onSelectAll && (
                <button
                  onClick={onSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Select All ({totalItems})
                </button>
              )}
              
              {onClearSelection && (
                <button
                  onClick={onClearSelection}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Bulk Actions
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            {isDropdownOpen && !isProcessing && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {availableActions.map((action) => {
                  const IconComponent = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action)}
                      className={`w-full text-left px-4 py-2 text-sm ${getActionColor(action.color)} flex items-center`}
                    >
                      <IconComponent className="h-4 w-4 mr-3" />
                      {action.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                {confirmAction.confirmationTitle}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {confirmAction.confirmationMessage}
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelConfirmation}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => executeAction(confirmAction)}
                disabled={isProcessing}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  confirmAction.color === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : confirmAction.color === 'success'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : confirmAction.color === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Processing...
                  </>
                ) : (
                  `Confirm ${confirmAction.label}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </>
  )
}