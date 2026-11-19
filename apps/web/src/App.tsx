import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { ImportBookModal } from './components/domain/ImportBookModal.js';
import { IsbnScannerModal } from './components/domain/IsbnScannerModal.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { BookDetailPage } from './pages/BookDetailPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { CurationPage } from './pages/CurationPage.js';

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
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/livros/:id" element={<BookDetailPage />} />
              <Route path="/curadoria" element={<CurationPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>

          <Footer />

          <ImportBookModal
            isOpen={isImportModalOpen}
            initialQuery={scannedIsbn}
            onClose={() => {
              setIsImportModalOpen(false);
              setScannedIsbn('');
            }}
          />

          <IsbnScannerModal
            isOpen={isScannerModalOpen}
            onClose={() => setIsScannerModalOpen(false)}
            onDetected={(isbn13) => {
              setIsScannerModalOpen(false);
              setScannedIsbn(isbn13);
              setIsImportModalOpen(true);
            }}
          />
        </div>
      </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
