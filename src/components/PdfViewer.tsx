import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { convertFileSrc } from '@tauri-apps/api/core';
import { MediaItem, AppLanguage } from '../types';
import { t } from '../services/i18n';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  RotateCw,
  PanelLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SunMoon,
} from 'lucide-react';

// Configure pdf.js worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfViewerProps {
  item: MediaItem;
  currentIndex: number;
  totalCount: number;
  hudVisible: boolean;
  language: AppLanguage;
  isMiniPip?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

interface PageRenderItemProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNum: number;
  scale: number;
  rotation: number;
  onVisible: (pageNum: number) => void;
}

const PageRenderItem: React.FC<PageRenderItemProps> = ({
  pdfDoc,
  pageNum,
  scale,
  rotation,
  onVisible,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 600, height: 800 });

  useEffect(() => {
    let isCancelled = false;

    pdfDoc.getPage(pageNum).then((page) => {
      if (isCancelled) return;
      const viewport = page.getViewport({ scale: 1, rotation });
      setDimensions({ width: viewport.width * scale, height: viewport.height * scale });
    }).catch(console.warn);

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNum, scale, rotation]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            onVisible(pageNum);
          }
        });
      },
      { threshold: [0.1, 0.4, 0.8] }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [pageNum, onVisible]);

  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const renderContext = {
          canvasContext: ctx,
          canvas: canvas,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!isCancelled) {
          setIsRendered(true);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`Error rendering page ${pageNum}:`, err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale, rotation]);

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNum}`}
      style={{
        width: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`,
      }}
      className="relative mx-auto my-3 bg-white dark:bg-slate-900 shadow-xl rounded-sm transition-all"
    >
      <canvas ref={canvasRef} className="block w-full h-full select-none" />
      {!isRendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 text-xs font-mono">
          Trang {pageNum}
        </div>
      )}
    </div>
  );
};

export const PdfViewer: React.FC<PdfViewerProps> = ({
  item,
  currentIndex,
  totalCount,
  hudVisible,
  language,
  isMiniPip,
  onPrev,
  onNext,
}) => {
  const i18n = t(language);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [scale, setScale] = useState<number>(1.1);
  const [rotation, setRotation] = useState<number>(0);
  const [invertColor, setInvertColor] = useState<boolean>(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF file when path changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setPageInput('1');

    const fileUrl = convertFileSrc(item.path);

    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
      cMapPacked: true,
    });

    loadingTask.promise
      .then((doc) => {
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Failed to load PDF:', err);
          setError(err?.message || i18n.pdf_error);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      loadingTask.destroy().catch(console.warn);
    };
  }, [item.path, i18n.pdf_error]);

  const handleVisiblePage = useCallback((pageNum: number) => {
    setCurrentPage(pageNum);
    setPageInput(pageNum.toString());
  }, []);

  const handleJumpToPage = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
    setPageInput(pageNum.toString());
    const el = document.getElementById(`pdf-page-${pageNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 3.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.4));
  const handleResetZoom = () => setScale(1.0);

  const handleFitWidth = () => {
    if (!containerRef.current || !pdfDoc) return;
    pdfDoc.getPage(1).then((page) => {
      const vp = page.getViewport({ scale: 1, rotation });
      const availableWidth = containerRef.current!.clientWidth - (isThumbnailsOpen ? 180 : 40);
      const newScale = Math.max(availableWidth / vp.width, 0.4);
      setScale(Number(newScale.toFixed(2)));
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handlePrint = () => {
    window.print();
  };

  // Keyboard events for PDF actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsThumbnailsOpen((prev) => !prev);
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setInvertColor((prev) => !prev);
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleFitWidth();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === 'PageDown' || e.key === 'j') {
        e.preventDefault();
        handleJumpToPage(currentPage + 1);
      } else if (e.key === 'PageUp' || e.key === 'k') {
        e.preventDefault();
        handleJumpToPage(currentPage - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleJumpToPage(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        handleJumpToPage(totalPages);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, isThumbnailsOpen, rotation, pdfDoc]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900/40 select-text overflow-hidden">
      {/* Main View Area */}
      <div className="relative flex-1 flex w-full h-full overflow-hidden">
        {/* Left Thumbnails Drawer */}
        {isThumbnailsOpen && pdfDoc && (
          <div className="w-40 shrink-0 h-full border-r border-slate-200/20 dark:border-white/10 bg-slate-900/80 backdrop-blur-md overflow-y-auto p-2.5 space-y-3 z-20 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1 pb-1 border-b border-white/10">
              <span>{i18n.pdf_thumbnails}</span>
              <button
                onClick={() => setIsThumbnailsOpen(false)}
                className="hover:text-white p-0.5 rounded"
              >
                ✕
              </button>
            </div>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => {
              const isCurrent = pNum === currentPage;
              return (
                <button
                  key={pNum}
                  onClick={() => handleJumpToPage(pNum)}
                  className={`w-full text-center p-1.5 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-200 shadow-md'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="w-full aspect-3/4 bg-slate-800 rounded flex items-center justify-center text-xs font-mono">
                    📄 {pNum}
                  </div>
                  <span className="text-[10px] mt-1 block font-mono">Trang {pNum}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable Document Container */}
        <div
          ref={containerRef}
          className={`flex-1 h-full overflow-y-auto px-4 py-8 relative ${
            invertColor ? 'filter invert hue-rotate-180 contrast-105' : ''
          }`}
        >
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300 text-sm">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
              <span>{i18n.pdf_loading}</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-rose-400 text-sm px-4 text-center">
              <span>⚠️ {error}</span>
            </div>
          )}

          {!loading && !error && pdfDoc && (
            <div className="w-full flex flex-col items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <PageRenderItem
                  key={pNum}
                  pdfDoc={pdfDoc}
                  pageNum={pNum}
                  scale={scale}
                  rotation={rotation}
                  onVisible={handleVisiblePage}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Action Bar (Identical Visual Design Language to Viewer & Player) */}
      <div
        className={`absolute bottom-3 left-0 right-0 z-30 transition-all duration-200 pointer-events-none ${
          hudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex justify-center px-4">
          {isMiniPip ? (
            /* MINI PIP COMPACT FROSTED PILL */
            <div
              data-no-drag
              className="bg-black/55 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-2xl flex items-center gap-2 pointer-events-auto select-none"
            >
              <button
                onClick={onPrev}
                title={`${i18n.file_prev} (←)`}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-white/90 font-medium px-1">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={onNext}
                title={`${i18n.file_next} (→)`}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-2.5 flex items-center justify-between gap-3 max-w-4xl w-full shadow-2xl pointer-events-auto text-xs">
              {/* Left Group: Prev / Next file (Exact same position as Viewer/Player) + Thumbnail toggle */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onPrev}
                  title={`${i18n.file_prev} (←)`}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{i18n.file_prev}</span>
                </button>
                <button
                  onClick={onNext}
                  title={`${i18n.file_next} (→)`}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <span>{i18n.file_next}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-1" />

                <button
                  onClick={() => setIsThumbnailsOpen((prev) => !prev)}
                  title={`${i18n.pdf_thumbnails} (T)`}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isThumbnailsOpen
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <PanelLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Center Group: File Info & Page Navigator */}
              <div className="flex-1 flex items-center justify-center gap-2 min-w-0 px-2 font-mono text-[11px]">
                <span className="truncate max-w-[200px] md:max-w-xs text-slate-800 dark:text-slate-200 font-semibold">
                  📄 {item.name}
                </span>
                <span className="shrink-0 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md">
                  [ {currentIndex + 1} / {totalCount} ]
                </span>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400 shrink-0">
                  <span>{i18n.pdf_page}</span>
                  <input
                    type="text"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const parsed = parseInt(pageInput, 10);
                        if (!isNaN(parsed)) handleJumpToPage(parsed);
                      }
                    }}
                    onBlur={() => {
                      const parsed = parseInt(pageInput, 10);
                      if (!isNaN(parsed)) handleJumpToPage(parsed);
                      else setPageInput(currentPage.toString());
                    }}
                    className="w-8 text-center bg-transparent border-b border-slate-400 focus:border-cyan-400 focus:outline-none text-slate-900 dark:text-slate-100 font-semibold"
                  />
                  <span>/ {totalPages || 1}</span>
                </div>
              </div>

              {/* Right Group: Zoom, Fit, Invert, Print, Rotate (No Mark, No Fullscreen) */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Zoom Controls */}
                <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/5 rounded-lg p-0.5 border border-slate-200 dark:border-white/10">
                  <button
                    onClick={handleZoomOut}
                    title={i18n.pdf_zoom_out}
                    className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    title="100% (Cmd+0)"
                    className="px-1.5 py-0.5 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    {Math.round(scale * 100)}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    title={i18n.pdf_zoom_in}
                    className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Fit Width */}
                <button
                  onClick={handleFitWidth}
                  title={i18n.pdf_fit_width}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Dark Mode Invert */}
                <button
                  onClick={() => setInvertColor((prev) => !prev)}
                  title={i18n.pdf_invert}
                  className={`p-1.5 rounded-lg transition-colors ${
                    invertColor
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <SunMoon className="w-4 h-4" />
                </button>

                {/* Native OS Print */}
                <button
                  onClick={handlePrint}
                  title={i18n.pdf_print}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Rotate 90 deg */}
                <button
                  onClick={handleRotate}
                  title={`${i18n.rotate} (R)`}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
