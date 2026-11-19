import type {
  AdminUsersQuery,
  AuditLogDto,
  BookDto,
  BookListQuery,
  CreateReviewBody,
  ExternalBookResult,
  HelpfulVoteResponse,
  ImportBookResponse,
  InviteUserBody,
  PaginatedBooks,
  PaginatedReviews,
  PaginatedUsers,
  Review,
  ReviewListQuery,
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
};
