export interface ReviewDeletionDecision {
  allowed: boolean;
  isModeration: boolean;
}

/**
 * Avalia se o usuário autenticado pode remover um parecer.
 * - O próprio autor sempre pode remover seu parecer (`isModeration = false`).
 * - Curadores e administradores podem moderar pareceres de terceiros (`isModeration = true`).
 */
export function evaluateReviewDeletion(
  reviewAuthorUid: string,
  actor: { uid: string; isCurator: boolean },
): ReviewDeletionDecision {
  if (reviewAuthorUid === actor.uid) {
    return { allowed: true, isModeration: false };
  }

  if (actor.isCurator) {
    return { allowed: true, isModeration: true };
  }

  return { allowed: false, isModeration: false };
}
