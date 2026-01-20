export function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200 py-4">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Team Flow. All rights reserved.</p>
          <a
            href="https://developman.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-600 transition-colors text-right"
          >
            Developed by developman
          </a>
        </div>
      </div>
    </footer>
  );
}
