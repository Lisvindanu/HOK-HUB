import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { useEffect, useRef, useState } from 'react';

function MascotGreeting() {
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-16 md:bottom-0 left-4 z-[9999] cursor-pointer flex flex-col items-center"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
      onClick={() => setVisible(false)}
      title="Klik untuk tutup"
    >
      {/* Speech bubble */}
      <div className="mb-1 ml-16 bg-white text-dark-400 text-xs font-bold px-3 py-1.5 rounded-xl rounded-bl-none shadow-lg whitespace-nowrap">
        Hai! Welcome to HoK Hub 👋
      </div>
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
