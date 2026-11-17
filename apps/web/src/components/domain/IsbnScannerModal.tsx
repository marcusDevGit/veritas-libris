import React, { useEffect, useRef, useState } from 'react';
import { isValidIsbn13, stripIsbn } from '@app/shared';
import { X, ScanBarcode, Camera, AlertCircle, Search } from 'lucide-react';

export interface IsbnScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (isbn13: string) => void;
}

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect(source: HTMLVideoElement): Promise<BarcodeDetectorResult[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): BarcodeDetectorInstance;
    };
  }
}

/**
 * IsbnScannerModal — Leitor de Código de Barras ISBN-13 via Câmera
 *
 * Utiliza as APIs nativas do navegador (getUserMedia + BarcodeDetector)
 * com fallback de digitação manual validada por isValidIsbn13 (@app/shared).
 */
export const IsbnScannerModal: React.FC<IsbnScannerModalProps> = ({
  isOpen,
  onClose,
  onDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [manualIsbn, setManualIsbn] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    let intervalId: number | null = null;

    const stopStream = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    };

    const startCamera = async () => {
      setErrorMsg(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMsg('Este navegador não permite acesso à câmera. Digite o ISBN manualmente abaixo.');
        return;
      }

      if (!hasBarcodeDetector || !window.BarcodeDetector) {
        setErrorMsg(
          'Seu navegador não possui leitor nativo BarcodeDetector. Digite o ISBN-13 manualmente abaixo.'
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsCameraActive(true);
        }

        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a'],
        });

        intervalId = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            for (const barcode of barcodes) {
              const cleaned = stripIsbn(barcode.rawValue);
              if (isValidIsbn13(cleaned)) {
                stopStream();
                onDetected(cleaned);
                return;
              }
            }
          } catch {
          }
        }, 250);
      } catch {
        setErrorMsg(
          'Não foi possível acessar a câmera (permissão negada ou dispositivo ausente). Você pode digitar o ISBN abaixo.'
        );
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [isOpen, hasBarcodeDetector, onDetected]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = stripIsbn(manualIsbn);
    if (!isValidIsbn13(cleaned)) {
      setErrorMsg('ISBN-13 inválido. Verifique os 13 dígitos da contracapa.');
      return;
    }
    onDetected(cleaned);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface-container-lowest border border-outline/20 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-on-primary">
          <div className="flex items-center gap-2.5">
            <ScanBarcode className="w-5 h-5 text-secondary-container" />
            <div>
              <h3 className="font-editorial text-base font-bold text-white">
                Leitor de Código de Barras ISBN
              </h3>
              <p className="text-[11px] text-on-primary-container">
                Aponte a câmera para o código EAN-13 na contracapa do livro
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-primary-container hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="relative aspect-video w-full rounded-xl bg-tertiary overflow-hidden flex items-center justify-center border border-outline/20">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-3/4 h-20 border-2 border-secondary-container/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
              </div>
            )}

            {!isCameraActive && (
              <div className="flex flex-col items-center justify-center p-6 text-center text-on-tertiary/80 gap-2">
                <Camera className="w-10 h-10 text-secondary-container/80 stroke-[1.5]" />
                <span className="text-xs">
                  {errorMsg ? 'Câmera indisponível neste dispositivo' : 'Iniciando câmera...'}
                </span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-secondary-container/25 border border-secondary-container/50 text-xs text-on-secondary-fixed-variant flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="text-xs font-semibold text-primary block">
              Ou digite o ISBN-13 manualmente:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualIsbn}
                onChange={(e) => setManualIsbn(e.target.value)}
                placeholder="Ex: 9788535914849"
                className="flex-1 h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline/25 text-xs font-mono text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="px-4 h-10 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
