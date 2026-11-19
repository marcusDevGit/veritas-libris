import { z } from 'zod';
import { ObjectIdSchema } from './book.schema.js';
import { BookDtoSchema } from './catalog.schema.js';

export const ReadingListItemDtoSchema = z.object({
  book: BookDtoSchema,
  addedAt: z.string(),
});
export type ReadingListItemDto = z.infer<typeof ReadingListItemDtoSchema>;

export const ReadingListStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  recommended: z.number().int().nonnegative(),
  withReservations: z.number().int().nonnegative(),
  notRecommended: z.number().int().nonnegative(),
  imprimatur: z.number().int().nonnegative(),
});
export type ReadingListStats = z.infer<typeof ReadingListStatsSchema>;

export const ReadingListResponseSchema = z.object({
  items: z.array(ReadingListItemDtoSchema),
  stats: ReadingListStatsSchema,
});
export type ReadingListResponse = z.infer<typeof ReadingListResponseSchema>;

export const ReadingListStatusResponseSchema = z.object({
  saved: z.boolean(),
});
export type ReadingListStatusResponse = z.infer<typeof ReadingListStatusResponseSchema>;

export const AddReadingListBodySchema = z.object({
  bookId: ObjectIdSchema,
});
export type AddReadingListBody = z.infer<typeof AddReadingListBodySchema>;
