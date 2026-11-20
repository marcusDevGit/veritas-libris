import type {
  AdminUsersQuery,
  AuditLogDto,
  BookDto,
  BookListQuery,
  CreateReviewBody,
  CreateSuggestionBody,
  CurationQueueQuery,
  CurationQueueResponse,
  DeleteReviewResponse,
  ExternalBookResult,
  HelpfulVoteResponse,
  ImportBookResponse,
  InviteUserBody,
  NotificationListResponse,
  PaginatedBooks,
  PaginatedReviews,
  PaginatedUsers,
  ReadingListResponse,
  ReadingListStatusResponse,
  Review,
  ReviewListQuery,
  SuggestionDto,
  SuggestionListQuery,
  SuggestionListResponse,
  UpdateBookEditorialBody,
  UpdateSuggestionStatusBody,
  UserDto,
  UserRole,
} from '@app/shared';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

type TokenProvider = () => Promise<string | null>;
let getAuthToken: TokenProvider | null = null;

export function setAuthTokenProvider(provider: TokenProvider | null) {
  getAuthToken = provider;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (requiresAuth && getAuthToken && !headers.has('Authorization')) {
    const token = await getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || 'Erro na requisição à API';
    const errorCode = data?.code || 'UNKNOWN_ERROR';
    throw new ApiError(response.status, errorCode, errorMsg);
  }

  return data as T;
}

export const api = {
  getBooks: async (query: Partial<BookListQuery> = {}): Promise<PaginatedBooks> => {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.adequacy) params.set('adequacy', query.adequacy);
    if (query.age) params.set('age', query.age);
    if (query.tags && query.tags.length > 0) params.set('tags', query.tags.join(','));
    if (query.familyMode) params.set('familyMode', 'true');
    if (query.hasImprimatur) params.set('hasImprimatur', 'true');
    if (query.stamp) params.set('stamp', query.stamp);
    if (query.sort) params.set('sort', query.sort);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const queryString = params.toString();
    return request<PaginatedBooks>(`/books${queryString ? `?${queryString}` : ''}`);
  },

  getBookById: async (id: string): Promise<BookDto> => {
    return request<BookDto>(`/books/${id}`);
  },

  searchExternal: async (q: string, limit = 10): Promise<{ items: ExternalBookResult[] }> => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    return request<{ items: ExternalBookResult[] }>(`/books/external-search?${params.toString()}`);
  },

  importBook: async (isbn13: string): Promise<ImportBookResponse> => {
    return request<ImportBookResponse>('/books/import', {
      method: 'POST',
      body: JSON.stringify({ isbn13 }),
    }, true);
  },

  refreshBookMetadata: async (id: string): Promise<BookDto> => {
    return request<BookDto>(`/books/${id}/refresh-metadata`, {
      method: 'PATCH',
    });
  },

  getReviewsByBook: async (bookId: string, query: Partial<ReviewListQuery> = {}): Promise<PaginatedReviews> => {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const queryString = params.toString();
    return request<PaginatedReviews>(`/books/${bookId}/reviews${queryString ? `?${queryString}` : ''}`);
  },

  submitReview: async (bookId: string, body: CreateReviewBody): Promise<Review & { _id: string }> => {
    return request<Review & { _id: string }>(`/books/${bookId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(body),
    }, true);
  },

  voteReviewHelpful: async (reviewId: string): Promise<HelpfulVoteResponse> => {
    return request<HelpfulVoteResponse>(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    }, true);
  },

  deleteReview: async (reviewId: string): Promise<DeleteReviewResponse> => {
    return request<DeleteReviewResponse>(
      `/reviews/${reviewId}`,
      { method: 'DELETE' },
      true,
    );
  },

  getCurrentUser: async (): Promise<UserDto> => {
    return request<UserDto>('/auth/me', {}, true);
  },

  listAdminUsers: async (query: Partial<AdminUsersQuery> = {}): Promise<PaginatedUsers> => {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.role) params.set('role', query.role);
    if (query.sort) params.set('sort', query.sort);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const queryString = params.toString();
    return request<PaginatedUsers>(`/admin/users${queryString ? `?${queryString}` : ''}`, {}, true);
  },

  inviteAdminUser: async (body: InviteUserBody): Promise<UserDto> => {
    return request<UserDto>('/admin/users/invite', {
      method: 'POST',
      body: JSON.stringify(body),
    }, true);
  },

  updateUserRole: async (uid: string, role: UserRole): Promise<UserDto> => {
    return request<UserDto>(`/admin/users/${encodeURIComponent(uid)}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }, true);
  },

  listAdminAuditLogs: async (): Promise<{ items: AuditLogDto[] }> => {
    return request<{ items: AuditLogDto[] }>('/admin/audit-logs', {}, true);
  },

  listCurationBooks: async (query: Partial<CurationQueueQuery> = {}): Promise<CurationQueueResponse> => {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.filter) params.set('filter', query.filter);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const queryString = params.toString();
    return request<CurationQueueResponse>(`/curation/books${queryString ? `?${queryString}` : ''}`, {}, true);
  },

  updateBookEditorial: async (bookId: string, body: UpdateBookEditorialBody): Promise<BookDto> => {
    return request<BookDto>(`/books/${bookId}/editorial`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, true);
  },

  getReadingList: async (): Promise<ReadingListResponse> => {
    return request<ReadingListResponse>('/reading-list', {}, true);
  },

  getReadingListStatus: async (bookId: string): Promise<ReadingListStatusResponse> => {
    return request<ReadingListStatusResponse>(`/reading-list/${bookId}/status`, {}, true);
  },

  addToReadingList: async (bookId: string): Promise<ReadingListStatusResponse> => {
    return request<ReadingListStatusResponse>('/reading-list', {
      method: 'POST',
      body: JSON.stringify({ bookId }),
    }, true);
  },

  removeFromReadingList: async (bookId: string): Promise<ReadingListStatusResponse> => {
    return request<ReadingListStatusResponse>(`/reading-list/${bookId}`, {
      method: 'DELETE',
    }, true);
  },

  createSuggestion: async (body: CreateSuggestionBody): Promise<SuggestionDto> => {
    return request<SuggestionDto>('/suggestions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  listSuggestions: async (
    query: Partial<SuggestionListQuery> = {},
  ): Promise<SuggestionListResponse> => {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.type) params.set('type', query.type);
    if (query.q) params.set('q', query.q);
    if (query.limit) params.set('limit', String(query.limit));
    const qs = params.toString();
    return request<SuggestionListResponse>(`/suggestions${qs ? `?${qs}` : ''}`, {}, true);
  },

  triageSuggestion: async (
    id: string,
    body: UpdateSuggestionStatusBody,
  ): Promise<SuggestionDto> => {
    return request<SuggestionDto>(
      `/suggestions/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      true,
    );
  },

  listNotifications: async (): Promise<NotificationListResponse> => {
    return request<NotificationListResponse>('/notifications', {}, true);
  },

  markAllNotificationsRead: async (): Promise<{ updated: number }> => {
    return request<{ updated: number }>('/notifications/read-all', { method: 'PATCH' }, true);
  },

  markNotificationRead: async (id: string): Promise<{ read: boolean }> => {
    return request<{ read: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }, true);
  },
};
