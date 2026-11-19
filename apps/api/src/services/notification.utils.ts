import type { NotificationType } from '@app/shared';

export interface NotificationPayloadInput {
  bookTitle: string;
  type: NotificationType;
  actorUid?: string;
  actorName: string;
  recipientUserIds: string[];
  summaryDetail?: string;
}

export interface BuiltNotification {
  userId: string;
  bookTitle: string;
  type: NotificationType;
  title: string;
  description: string;
}

export function buildNotificationPayloads(
  input: NotificationPayloadInput,
): BuiltNotification[] {
  const uniqueRecipients = Array.from(new Set(input.recipientUserIds)).filter(
    (uid) => uid && uid !== input.actorUid,
  );

  if (uniqueRecipients.length === 0) return [];

  const title =
    input.type === 'NEW_REVIEW'
      ? `Novo parecer em "${input.bookTitle}"`
      : `Parecer oficial atualizado: "${input.bookTitle}"`;

  const description =
    input.type === 'NEW_REVIEW'
      ? `${input.actorName} publicou uma avaliação sobre um livro da sua Lista de Leitura.`
      : `${input.actorName} atualizou a curadoria oficial${
          input.summaryDetail ? ` (${input.summaryDetail})` : ''
        } de um livro da sua Lista de Leitura.`;

  return uniqueRecipients.map((userId) => ({
    userId,
    bookTitle: input.bookTitle,
    type: input.type,
    title,
    description,
  }));
}
