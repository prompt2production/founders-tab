'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Loader2, Clock, FolderOpen, Activity } from 'lucide-react'

interface Story {
  id: string
  title: string
  description: string
  acceptance_criteria: string[]
  passes: boolean
}

interface FeatureProgress {
  name: string
  folderName: string
  stories: Story[]
  completed: number
  total: number
  percentage: number
  recentActivity: string[]
}

interface OverallProgress {
  features: FeatureProgress[]
  totalCompleted: number
  totalStories: number
  overallPercentage: number
  currentFeature: FeatureProgress | null
}

function ProgressBar({ percentage, size = 'md' }: { percentage: number; size?: 'sm' | 'md' | 'lg' }) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
  
  return (
    <div className={`w-full bg-slate-200 rounded-full ${heights[size]} overflow-hidden`}>
      <div
        className={`${heights[size]} rounded-full transition-all duration-500 ease-out ${
          percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

function StoryItem({ story, isNext }: { story: Story; isNext: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        story.passes
          ? 'bg-emerald-50 border border-emerald-200'
          : isNext
          ? 'bg-amber-50 border border-amber-300 ring-2 ring-amber-200'
          : 'bg-slate-50 border border-slate-200'
      }`}
    >
      <div className="mt-0.5">
        {story.passes ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        ) : isNext ? (
          <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
        ) : (
          <Circle className="w-5 h-5 text-slate-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
            story.passes 
              ? 'bg-emerald-200 text-emerald-800' 
              : isNext 
              ? 'bg-amber-200 text-amber-800'
              : 'bg-slate-200 text-slate-600'
          }`}>
            {story.id}
          </span>
          {isNext && (
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              IN PROGRESS
            </span>
          )}
        </div>
        <p className={`text-sm font-medium mt-1 ${
          story.passes ? 'text-emerald-900' : 'text-slate-900'
        }`}>
          {story.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
          {story.description}
        </p>
      </div>
    </div>
  )
}

function FeatureCard({ feature, isExpanded, onToggle }: { 
  feature: FeatureProgress
  isExpanded: boolean
  onToggle: () => void
}) {
  const isComplete = feature.percentage === 100
  const isInProgress = feature.completed > 0 && feature.completed < feature.total
  const firstIncompleteIndex = feature.stories.findIndex(s => !s.passes)
  
  return (
    <div className={`rounded-xl border ${
      isComplete 
        ? 'border-emerald-200 bg-emerald-50/50' 
        : isInProgress 
        ? 'border-indigo-200 bg-white shadow-sm' 
        : 'border-slate-200 bg-white'
    }`}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors rounded-xl"
      >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          isComplete 
            ? 'bg-emerald-100 text-emerald-600' 
            : isInProgress 
            ? 'bg-indigo-100 text-indigo-600' 
            : 'bg-slate-100 text-slate-500'
        }`}>
          <FolderOpen className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">{feature.name}</h3>
            {isComplete && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                COMPLETE
              </span>
            )}
            {isInProgress && (
              <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full animate-pulse">
                BUILDING
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            features/{feature.folderName}
          </p>
        </div>
        
        <div className="text-right">
          <p className={`text-2xl font-bold ${
            isComplete ? 'text-emerald-600' : 'text-slate-900'
          }`}>
            {feature.percentage}%
          </p>
          <p className="text-sm text-slate-500">
            {feature.completed}/{feature.total} stories
          </p>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <ProgressBar percentage={feature.percentage} size="sm" />
          
          <div className="space-y-2">
            {feature.stories.map((story, index) => (
              <StoryItem
                key={story.id}
                story={story}
                isNext={index === firstIncompleteIndex}
              />
            ))}
          </div>
          
          {feature.recentActivity.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" />
                Recent Activity
              </h4>
              <ul className="space-y-1">
                {feature.recentActivity.map((activity, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProgressDashboard() {
  const [progress, setProgress] = useState<OverallProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set())
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/dev/progress')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProgress(data)
      setLastUpdated(new Date())
      setError(null)
      
      // Auto-expand features that are in progress
      if (data.currentFeature) {
        setExpandedFeatures(prev => new Set([...prev, data.currentFeature.folderName]))
      }
    } catch (e) {
      setError('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
    
    // Poll every 3 seconds
    const interval = setInterval(fetchProgress, 3000)
    return () => clearInterval(interval)
  }, [])

  const toggleFeature = (folderName: string) => {
    setExpandedFeatures(prev => {
      const next = new Set(prev)
      if (next.has(folderName)) {
        next.delete(folderName)
      } else {
        next.add(folderName)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-slate-600">Loading progress...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchProgress}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!progress || progress.features.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Ralph Progress Dashboard</h1>
          <p className="text-slate-600 mb-8">Track feature development progress in real-time</p>
          
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 mb-2">No Features Yet</h2>
            <p className="text-slate-600 max-w-md mx-auto">
              Start by planning a feature with Claude. Say &quot;Plan feature:&quot; followed by your description.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-slate-900">Ralph Progress Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              {lastUpdated && (
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          <p className="text-slate-600">Track feature development progress in real-time</p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Overall Progress</h2>
              <p className="text-sm text-slate-500">
                {progress.features.length} feature{progress.features.length !== 1 ? 's' : ''} tracked
              </p>
            </div>
            <div className="text-right">
              <p className={`text-4xl font-bold ${
                progress.overallPercentage === 100 ? 'text-emerald-600' : 'text-indigo-600'
              }`}>
                {progress.overallPercentage}%
              </p>
              <p className="text-sm text-slate-500">
                {progress.totalCompleted}/{progress.totalStories} stories
              </p>
            </div>
          </div>
          <ProgressBar percentage={progress.overallPercentage} size="lg" />
        </div>

        {/* Current Feature Highlight */}
        {progress.currentFeature && progress.currentFeature.percentage < 100 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-indigo-900">
                  Currently building: <strong>{progress.currentFeature.name}</strong>
                </p>
                <p className="text-sm text-indigo-700">
                  {progress.currentFeature.completed} of {progress.currentFeature.total} stories complete
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-4">
          {progress.features.map(feature => (
            <FeatureCard
              key={feature.folderName}
              feature={feature}
              isExpanded={expandedFeatures.has(feature.folderName)}
              onToggle={() => toggleFeature(feature.folderName)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Auto-refreshes every 3 seconds</p>
        </div>
      </div>
    </div>
  )
}
