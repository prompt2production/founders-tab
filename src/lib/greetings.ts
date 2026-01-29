export function getTimeBasedGreeting(name: string): string {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) return `Good morning, ${name}`
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name}`
  if (hour >= 17 && hour < 21) return `Good evening, ${name}`
  if (hour >= 21 && hour < 24) return `Working late, ${name}?`
  if (hour >= 0 && hour < 5) return `Burning the midnight oil, ${name}?`

  return `Hello, ${name}`
}

export function getContextMessage(
  pendingApprovalCount: number,
  userPendingCount: number,
  userRole: 'FOUNDER' | 'MEMBER'
): string {
  if (userRole === 'FOUNDER' && pendingApprovalCount > 0) {
    return `You have ${pendingApprovalCount} item${pendingApprovalCount === 1 ? '' : 's'} needing your attention`
  }
  if (userPendingCount > 0) {
    return `${userPendingCount} of your expense${userPendingCount === 1 ? '' : 's'} ${userPendingCount === 1 ? 'is' : 'are'} pending approval`
  }
  return "You're all caught up"
}
