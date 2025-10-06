import { Link } from 'react-router-dom';
import { Music, Sparkles, Zap, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Music className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">Mureza</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-slate-950 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Create Amazing Music with{' '}
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                AI Magic
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Transform your ideas into professional music tracks in seconds. No music theory required.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-lg transition-all"
            >
              <span>Start Creating Music</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Mureza?
            </h2>
            <p className="text-gray-400">Powerful features to bring your musical ideas to life</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 rounded-lg p-8 border border-slate-800">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-gray-400">
                Advanced AI models that understand your creative vision and generate high-quality music instantly.
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-8 border border-slate-800">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">
                Generate complete tracks in seconds, not hours. Perfect for rapid prototyping and iteration.
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-8 border border-slate-800">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Simple & Intuitive</h3>
              <p className="text-gray-400">
                Just describe what you want in plain English. No complex software or music theory needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400">Create music in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Describe Your Music</h3>
              <p className="text-gray-400">
                Tell us what kind of music you want to create in natural language.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Choose Your Settings</h3>
              <p className="text-gray-400">
                Select your preferred model, duration, and quality settings.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Download & Enjoy</h3>
              <p className="text-gray-400">
                Get your track instantly and download it in high quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple Pricing
            </h2>
            <p className="text-gray-400">Choose the package that fits your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-900 rounded-lg p-8 border border-slate-800">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <p className="text-gray-400 mb-6">Perfect for trying out Mureza</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$9.99</span>
              </div>
              <div className="bg-slate-800 rounded-lg py-3 px-4 mb-6">
                <p className="text-2xl font-bold text-blue-400">100</p>
                <p className="text-sm text-gray-400">tokens</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                  All model access
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                  High-quality downloads
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">For regular music creators</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$39.99</span>
              </div>
              <div className="bg-slate-800 rounded-lg py-3 px-4 mb-6">
                <p className="text-2xl font-bold text-blue-400">500</p>
                <p className="text-sm text-gray-400">tokens</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                  All model access
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                  High-quality downloads
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                  Priority support
                </li>
              </ul>
            </div>
            <div className="bg-slate-900 rounded-lg p-8 border border-slate-800">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-gray-400 mb-6">For power users and studios</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$129.99</span>
              </div>
              <div className="bg-slate-800 rounded-lg py-3 px-4 mb-6">
                <p className="text-2xl font-bold text-blue-400">2000</p>
                <p className="text-sm text-gray-400">tokens</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                  All model access
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                  High-quality downloads
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-2" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Create Amazing Music?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of creators using Mureza to bring their musical ideas to life
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-lg transition-all"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Music className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold text-white">Mureza</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Mureza Music Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
