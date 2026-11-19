import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { CatalogPage } from './pages/CatalogPage.js';

const BookDetailPage = lazy(() =>
  import('./pages/BookDetailPage.js').then((m) => ({ default: m.BookDetailPage })),
);
const ReadingListPage = lazy(() =>
  import('./pages/ReadingListPage.js').then((m) => ({ default: m.ReadingListPage })),
);
const CurationPage = lazy(() =>
  import('./pages/CurationPage.js').then((m) => ({ default: m.CurationPage })),
);
const AdminPage = lazy(() =>
  import('./pages/AdminPage.js').then((m) => ({ default: m.AdminPage })),
);
const CriteriaPage = lazy(() =>
  import('./pages/CriteriaPage.js').then((m) => ({ default: m.CriteriaPage })),
);
const AboutCurationPage = lazy(() =>
  import('./pages/AboutCurationPage.js').then((m) => ({ default: m.AboutCurationPage })),
);
const SuggestionsPage = lazy(() =>
  import('./pages/SuggestionsPage.js').then((m) => ({ default: m.SuggestionsPage })),
);
const ImportBookModal = lazy(() =>
  import('./components/domain/ImportBookModal.js').then((m) => ({ default: m.ImportBookModal })),
);
const IsbnScannerModal = lazy(() =>
  import('./components/domain/IsbnScannerModal.js').then((m) => ({ default: m.IsbnScannerModal })),
);

const PageLoader: React.FC = () => (
  <div className="pt-[108px] pb-16 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
    <div className="h-56 rounded-2xl bg-surface-container animate-pulse" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scannedIsbn, setScannedIsbn] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-surface text-on-surface">
            <Navbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenImportModal={() => {
                setScannedIsbn('');
                setIsImportModalOpen(true);
              }}
              onOpenScanner={() => setIsScannerModalOpen(true)}
            />

            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<CatalogPage />} />
                  <Route path="/livros/:id" element={<BookDetailPage />} />
                  <Route path="/minha-lista" element={<ReadingListPage />} />
                  <Route path="/criterios" element={<CriteriaPage />} />
                  <Route path="/sobre" element={<AboutCurationPage />} />
                  <Route path="/sugestoes" element={<SuggestionsPage />} />
                  <Route path="/curadoria" element={<CurationPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />

            {isImportModalOpen && (
              <Suspense fallback={null}>
                <ImportBookModal
                  isOpen={isImportModalOpen}
                  initialQuery={scannedIsbn}
                  onClose={() => {
                    setIsImportModalOpen(false);
                    setScannedIsbn('');
                  }}
                />
              </Suspense>
            )}

            {isScannerModalOpen && (
              <Suspense fallback={null}>
                <IsbnScannerModal
                  isOpen={isScannerModalOpen}
                  onClose={() => setIsScannerModalOpen(false)}
                  onDetected={(isbn13) => {
                    setIsScannerModalOpen(false);
                    setScannedIsbn(isbn13);
                    setIsImportModalOpen(true);
                  }}
                />
              </Suspense>
            )}
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
