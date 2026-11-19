import { Types } from 'mongoose';
import type {
  ReadingListItemDto,
  ReadingListResponse,
  ReadingListStatusResponse,
} from '@app/shared';
import { NotFoundError } from '../errors/app-error.js';
import { BookModel } from '../models/Book.model.js';
import { ReadingListItemModel } from '../models/ReadingListItem.model.js';
import { toBookDto, type BookLean } from './book.service.js';
import { computeReadingListStats } from './reading-list.utils.js';

export async function listReadingList(userId: string): Promise<ReadingListResponse> {
  const entries = await ReadingListItemModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean<{ bookId: Types.ObjectId; createdAt: Date }[]>();

  if (entries.length === 0) {
    return {
      items: [],
      stats: { total: 0, recommended: 0, withReservations: 0, notRecommended: 0, imprimatur: 0 },
    };
  }

  const bookIds = entries.map((entry) => entry.bookId);
  const books = await BookModel.find({ _id: { $in: bookIds } }).lean<BookLean[]>();
  const bookMap = new Map(books.map((doc) => [doc._id.toString(), toBookDto(doc)]));

  const items: ReadingListItemDto[] = [];
  for (const entry of entries) {
    const bookDto = bookMap.get(entry.bookId.toString());
    if (bookDto) {
      items.push({
        book: bookDto,
        addedAt: entry.createdAt.toISOString(),
      });
    }
  }

  return {
    items,
    stats: computeReadingListStats(items.map((item) => item.book)),
  };
}

export async function isBookInReadingList(
  userId: string,
  bookId: string,
): Promise<ReadingListStatusResponse> {
  const exists = await ReadingListItemModel.exists({
    userId,
    bookId: new Types.ObjectId(bookId),
  });
  return { saved: Boolean(exists) };
}

export async function addBookToReadingList(
  userId: string,
  bookId: string,
): Promise<ReadingListStatusResponse> {
  const bookExists = await BookModel.exists({ _id: new Types.ObjectId(bookId) });
  if (!bookExists) {
    throw new NotFoundError('Livro não encontrado no catálogo');
  }

  await ReadingListItemModel.updateOne(
    { userId, bookId: new Types.ObjectId(bookId) },
    { $setOnInsert: { userId, bookId: new Types.ObjectId(bookId) } },
    { upsert: true },
  );

  return { saved: true };
}

export async function removeBookFromReadingList(
  userId: string,
  bookId: string,
): Promise<ReadingListStatusResponse> {
  await ReadingListItemModel.deleteOne({
    userId,
    bookId: new Types.ObjectId(bookId),
  });

  return { saved: false };
}
