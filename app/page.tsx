'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(5)
  const [resolution, setResolution] = useState('1080p')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateVideo = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setProgress(0)
    setVideoUrl(null)

    // Simulate video generation with progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    // Generate video on canvas
    await createVideoOnCanvas()

    clearInterval(progressInterval)
    setProgress(100)

    setTimeout(() => {
      setIsGenerating(false)
    }, 500)
  }

  const createVideoOnCanvas = () => {
    return new Promise<void>((resolve) => {
      const canvas = canvasRef.current
      if (!canvas) {
        resolve()
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve()
        return
      }

      canvas.width = 1280
      canvas.height = 720

      const frames: string[] = []
      const fps = 30
      const totalFrames = duration * fps
      let currentFrame = 0

      const animate = () => {
        if (currentFrame >= totalFrames) {
          // Create video blob from frames (simulated)
          createVideoFromFrames(frames)
          resolve()
          return
        }

        // Create dynamic animation based on prompt
        const time = currentFrame / fps

        // Background gradient animation
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        const hue1 = (time * 50) % 360
        const hue2 = (time * 50 + 180) % 360
        gradient.addColorStop(0, `hsl(${hue1}, 70%, 50%)`)
        gradient.addColorStop(1, `hsl(${hue2}, 70%, 50%)`)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Add particles
        for (let i = 0; i < 50; i++) {
          const x = (Math.sin(time + i) * 0.5 + 0.5) * canvas.width
          const y = (Math.cos(time * 0.7 + i) * 0.5 + 0.5) * canvas.height
          const size = Math.sin(time * 2 + i) * 5 + 10

          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time + i) * 0.2})`
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }

        // Add text overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = 'bold 48px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const words = prompt.split(' ')
        const displayText = words.slice(0, Math.min(5, words.length)).join(' ')
        ctx.fillText(displayText, canvas.width / 2, canvas.height / 2)

        // Add wave effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.lineWidth = 3
        ctx.beginPath()
        for (let x = 0; x < canvas.width; x += 5) {
          const y = Math.sin(x * 0.01 + time * 2) * 50 + canvas.height / 2 + 100
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()

        // Capture frame
        frames.push(canvas.toDataURL('image/jpeg', 0.8))
        currentFrame++

        requestAnimationFrame(animate)
      }

      animate()
    })
  }

  const createVideoFromFrames = (frames: string[]) => {
    // Since we can't create actual video in browser easily, we'll use the last frame as thumbnail
    // In a real implementation, you'd use a library like ffmpeg.wasm
    if (frames.length > 0) {
      setVideoUrl(frames[Math.floor(frames.length / 2)])
    }
  }

  const downloadVideo = () => {
    if (!videoUrl) return

    const link = document.createElement('a')
    link.href = videoUrl
    link.download = `sora-${Date.now()}.jpg`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Sora Video Generator
          </h1>
          <p className="text-xl text-gray-300">Create stunning AI-generated videos from text prompts</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Input Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
            <label className="block text-lg font-semibold mb-3">Video Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video... e.g., 'A serene sunset over ocean waves with flying seagulls'"
              className="w-full h-32 px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={isGenerating}
            />

            {/* Settings */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                >
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isGenerating}
                >
                  <option value="720p">720p (HD)</option>
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4K">4K (Ultra HD)</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateVideo}
              disabled={isGenerating || !prompt.trim()}
              className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {isGenerating ? 'Generating...' : 'Generate Video'}
            </button>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Generating your video...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Video Preview */}
          {videoUrl && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Your Generated Video</h2>
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
                <img src={videoUrl} alt="Generated video frame" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                    </div>
                    <p className="text-sm">Video Preview (Frame)</p>
                  </div>
                </div>
              </div>
              <button
                onClick={downloadVideo}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Download Frame
              </button>
              <p className="text-sm text-gray-400 mt-4 text-center">
                Note: This is a demo. Full video export would require backend processing.
              </p>
            </div>
          )}
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-bold mb-2">Text-to-Video</h3>
            <p className="text-gray-400">Transform your text descriptions into stunning video content instantly</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Fast Generation</h3>
            <p className="text-gray-400">Create high-quality videos in seconds with our optimized AI</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2">Customizable</h3>
            <p className="text-gray-400">Control duration, resolution, and style to match your vision</p>
          </div>
        </div>
      </div>
    </div>
  )
}
