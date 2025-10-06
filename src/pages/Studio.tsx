import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { AudioPlayer } from '../components/AudioPlayer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Generation, GenerationModel } from '../types/database';
import { calculateTokens, downloadAudio, getModelDisplayName } from '../lib/utils';
import { Music, Sparkles, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SessionTrack {
  id: string;
  title: string;
  audioUrl: string;
  generation: Generation;
}

export const Studio = () => {
  const { profile, refreshProfile } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<GenerationModel>('V3_5');
  const [duration, setDuration] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null);
  const [sessionTracks, setSessionTracks] = useState<SessionTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<SessionTrack | null>(null);
  const [generationProgress, setGenerationProgress] = useState('');

  useEffect(() => {
    if (profile?.default_model) {
      setModel(profile.default_model);
    }
  }, [profile]);

  const tokenCost = calculateTokens(model, duration);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!profile || profile.token_balance < tokenCost) {
      setError('Insufficient tokens. Please purchase more tokens.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGenerationProgress('Creating generation...');

    try {
      const { data: generation, error: genError } = await supabase
        .from('generations')
        .insert({
          user_id: profile.id,
          prompt: prompt.trim(),
          model,
          duration_seconds: duration,
          tokens_used: tokenCost,
          status: 'pending',
        })
        .select()
        .single();

      if (genError) throw genError;

      const { error: txError } = await supabase.from('token_transactions').insert({
        user_id: profile.id,
        generation_id: generation.id,
        transaction_type: 'usage',
        token_amount: -tokenCost,
      });

      if (txError) throw txError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          token_balance: profile.token_balance - tokenCost,
          total_tokens_used: profile.total_tokens_used + tokenCost,
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setCurrentGeneration(generation);
      simulateGeneration(generation);
    } catch (err: any) {
      setError(err.message || 'Failed to create generation');
      setIsGenerating(false);
    }
  };

  const simulateGeneration = async (generation: Generation) => {
    setGenerationProgress('Processing your request...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setGenerationProgress('Generating music...');

    const { error: statusError } = await supabase
      .from('generations')
      .update({ status: 'processing' })
      .eq('id', generation.id);

    if (statusError) console.error(statusError);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    setGenerationProgress('Finalizing...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    const { data: updatedGen, error: completeError } = await supabase
      .from('generations')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', generation.id)
      .select()
      .single();

    if (completeError) {
      setError('Failed to complete generation');
      setIsGenerating(false);
      return;
    }

    const newTrack: SessionTrack = {
      id: updatedGen.id,
      title: `Generation ${sessionTracks.length + 1}`,
      audioUrl: mockAudioUrl,
      generation: updatedGen,
    };

    setSessionTracks((prev) => [newTrack, ...prev]);
    setActiveTrack(newTrack);
    setIsGenerating(false);
    setGenerationProgress('');
    setCurrentGeneration(null);

    if (profile?.auto_download) {
      handleDownload(mockAudioUrl, newTrack.title);
    }
  };

  const handleDownload = async (audioUrl: string, filename: string) => {
    try {
      await downloadAudio(audioUrl, `${filename}.mp3`);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleNewGeneration = () => {
    setPrompt('');
    setActiveTrack(null);
  };

  const maxDuration = model === 'V3_5' ? 240 : model === 'V4' ? 300 : 480;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Music Studio</h1>
          <p className="text-gray-400">Transform your ideas into music with AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Describe the music you want to create
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A upbeat electronic dance track with energetic synths and a catchy melody..."
                rows={5}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isGenerating}
              />
            </div>

            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4">Generation Options</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['V3_5', 'V4', 'V4_5'] as GenerationModel[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setModel(m)}
                        disabled={isGenerating}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          model === m
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <p className="font-semibold text-white mb-1">{getModelDisplayName(m)}</p>
                        <p className="text-xs text-gray-400">
                          {m === 'V3_5' && '10 tokens/min'}
                          {m === 'V4' && '15 tokens/min'}
                          {m === 'V4_5' && '25 tokens/min'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration: {Math.floor(duration / 60)}m {duration % 60}s
                  </label>
                  <input
                    type="range"
                    min="30"
                    max={maxDuration}
                    step="30"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    disabled={isGenerating}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>30s</span>
                    <span>{Math.floor(maxDuration / 60)}m</span>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Token Cost:</span>
                    <span className="text-xl font-bold text-white">{tokenCost} tokens</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-400 text-sm">{error}</p>
                  {error.includes('Insufficient tokens') && (
                    <Link to="/billing" className="text-red-300 hover:text-red-200 text-sm underline mt-1 inline-block">
                      Buy more tokens
                    </Link>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || (profile && profile.token_balance < tokenCost)}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{generationProgress}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Music</span>
                </>
              )}
            </button>

            {activeTrack && (
              <div className="space-y-4">
                <AudioPlayer
                  audioUrl={activeTrack.audioUrl}
                  title={activeTrack.title}
                  onDownload={() => handleDownload(activeTrack.audioUrl, activeTrack.title)}
                  autoPlay={profile?.auto_download === false}
                />
                <button
                  onClick={handleNewGeneration}
                  className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all"
                >
                  Generate Another
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4">Session Tracks</h3>
              {sessionTracks.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No tracks in this session yet</p>
                  <p className="text-gray-500 text-xs mt-2">
                    Audio will be lost after download or page refresh
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessionTracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => setActiveTrack(track)}
                      className={`w-full p-4 rounded-lg border transition-all text-left ${
                        activeTrack?.id === track.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white mb-1">{track.title}</p>
                          <p className="text-xs text-gray-400 truncate">{track.generation.prompt}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6">
              <h4 className="font-semibold text-white mb-2">Session Note</h4>
              <p className="text-sm text-gray-300">
                Audio files are stored in memory only. Download your tracks before leaving this page or refreshing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
