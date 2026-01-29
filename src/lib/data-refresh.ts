// Global data refresh event system
// All data hooks subscribe to this event and refetch when triggered

export const DATA_REFRESH_EVENT = 'data-refresh'

export type DataRefreshType = 'expenses' | 'dashboard' | 'balances' | 'approvals' | 'all'

interface DataRefreshDetail {
  type: DataRefreshType
}

/**
 * Trigger a global data refresh
 * Components and hooks listening for DATA_REFRESH_EVENT will refetch their data
 *
 * @param type - The type of data to refresh, or 'all' to refresh everything
 */
export function triggerDataRefresh(type: DataRefreshType = 'all') {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent<DataRefreshDetail>(DATA_REFRESH_EVENT, {
      detail: { type },
    })
  )
}

/**
 * Hook helper to subscribe to data refresh events
 *
 * @param callback - Function to call when refresh is triggered
 * @param types - Array of types to listen for (includes 'all' by default)
 */
export function subscribeToDataRefresh(
  callback: () => void,
  types: DataRefreshType[]
): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleRefresh = (event: Event) => {
    const customEvent = event as CustomEvent<DataRefreshDetail>
    const eventType = customEvent.detail?.type || 'all'

    if (eventType === 'all' || types.includes(eventType)) {
      callback()
    }
  }

  window.addEventListener(DATA_REFRESH_EVENT, handleRefresh)
  return () => window.removeEventListener(DATA_REFRESH_EVENT, handleRefresh)
}
