import React from 'react';
import { Heart, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PulsePath ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-[100dvh] h-[100dvh] w-full bg-romantic-dark text-white flex flex-col items-center justify-center p-6 text-center pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pl-[max(1.5rem,env(safe-area-inset-left,0px))] pr-[max(1.5rem,env(safe-area-inset-right,0px))]"
          style={{ minHeight: 'calc(var(--vh, 1vh) * 100)', height: 'calc(var(--vh, 1vh) * 100)' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-glow-sm mb-6 animate-pulse">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Something needed a moment ❤️
          </h2>
          <p className="text-rose-200/75 text-sm max-w-md mb-6 leading-relaxed">
            Our private space encountered a brief hiccup. Click below to reconnect your journey.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm flex items-center gap-2 shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reconnect Space</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
