import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { FeedbackModal } from './components/layout/FeedbackModal';

function MascotGreeting() {
  const [visible, setVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      <div
        className="fixed bottom-16 md:bottom-0 left-4 z-[9999] flex flex-col items-center"
        style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
      >
        {/* Speech bubble */}
        <button
          onClick={() => setShowFeedback(true)}
          className="mb-1 ml-16 bg-white text-dark-400 text-xs font-bold px-3 py-1.5 rounded-xl rounded-bl-none shadow-lg whitespace-nowrap hover:bg-yellow-50 transition-colors"
        >
          Punya saran? Klik aku! 💬
        </button>

        {/* Video + close button */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setVisible(false); }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-dark-300 border border-white/20 rounded-full text-gray-400 hover:text-white flex items-center justify-center z-10 shadow"
            title="Tutup"
          >
            <X className="w-3 h-3" />
          </button>
          <div onClick={() => setShowFeedback(true)} className="cursor-pointer">
            <video
              ref={videoRef}
              src="/assets/arli-hai-nobg.webm"
              autoPlay
              muted
              playsInline
              loop
              className="w-40 md:w-52"
            />
          </div>
        </div>
      </div>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  );
}


// Create a new query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <MascotGreeting />
    </QueryClientProvider>
  );
}

export default App;
