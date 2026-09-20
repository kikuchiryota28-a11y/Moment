import type { ActionResult } from "@/types/action";

/**
 * Type guard to narrow ActionResult to its successful variant.
 * After calling this, TypeScript knows that `result.data` is present.
 */
export function isSuccess<T>(result: ActionResult<T>): result is ActionResult<T> & { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to narrow ActionResult to its failed variant.
 */
export function isFailure<T>(result: ActionResult<T>): result is ActionResult<T> & { success: false; error: string; code?: string } {
  return result.success === false;
}