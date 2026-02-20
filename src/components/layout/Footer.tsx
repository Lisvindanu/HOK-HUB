import { Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-dark-400 border-t border-white/5 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>for the HoK community</span>
          </div>

          {/* Center */}
          <div className="text-sm text-gray-500">
            <p>© 2026 HoK Hub. Not affiliated with Tencent or Honor of Kings.</p>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/Lisvindanu/HonorOfKingsApi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm">GitHub</span>
            </a>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-4 pt-4 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">
            Powered by{' '}
            <a
              href="http://hokapi.project-n.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300"
            >
              HoK API
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
