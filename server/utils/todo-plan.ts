import type { H3Event } from 'h3'

export const FREE_TODO_LIMIT = 3

export type TodoPlan = 'free' | 'pro'

export interface TodoPlanLimits {
  plan: TodoPlan
  maxItems: number | null
}

function toFreePlan(): TodoPlanLimits {
  return {
    plan: 'free',
    maxItems: FREE_TODO_LIMIT
  }
}

export async function resolveTodoPlan(event: H3Event): Promise<TodoPlanLimits> {
  try {
    const customerState = await fetchWithEvent(event, '/api/auth/customer/state')

    const activeSubscriptions = customerState && typeof customerState === 'object' && 'activeSubscriptions' in customerState
      ? (customerState as { activeSubscriptions?: unknown }).activeSubscriptions
      : null

    if (Array.isArray(activeSubscriptions) && activeSubscriptions.length > 0) {
      return {
        plan: 'pro',
        maxItems: null
      }
    }
  } catch {
    return toFreePlan()
  }

  return toFreePlan()
}
