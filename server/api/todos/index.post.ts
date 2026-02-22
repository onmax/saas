import { count, eq } from 'drizzle-orm'
import { FREE_TODO_LIMIT, resolveTodoPlan } from '../../utils/todo-plan'
import { toTodoItemResponse } from '../../utils/todo-items'

interface CreateTodoBody {
  title: string
}

function parseCreateTodoBody(body: unknown): CreateTodoBody {
  if (!body || typeof body !== 'object' || !('title' in body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid todo payload'
    })
  }

  const title = String((body as { title: unknown }).title || '').trim()

  if (!title || title.length > 140) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Todo title must be between 1 and 140 characters'
    })
  }

  return { title }
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const payload = parseCreateTodoBody(await readBody(event))
  const limits = await resolveTodoPlan(event)

  if (limits.plan === 'free') {
    const [{ value: totalItems }] = await db
      .select({ value: count() })
      .from(schema.todoItem)
      .where(eq(schema.todoItem.userId, user.id))

    if (totalItems >= FREE_TODO_LIMIT) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Free todo limit reached',
        data: {
          code: 'FREE_TODO_LIMIT_REACHED',
          maxItems: FREE_TODO_LIMIT
        }
      })
    }
  }

  const [todo] = await db
    .insert(schema.todoItem)
    .values({
      id: crypto.randomUUID(),
      userId: user.id,
      title: payload.title,
      completed: false
    })
    .returning()

  return {
    item: toTodoItemResponse(todo)
  }
})
