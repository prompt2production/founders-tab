import fs from 'fs'
import path from 'path'

export interface Story {
  id: string
  title: string
  description: string
  acceptance_criteria: string[]
  passes: boolean
}

export interface FeatureProgress {
  name: string
  folderName: string
  stories: Story[]
  completed: number
  total: number
  percentage: number
  recentActivity: string[]
}

export interface OverallProgress {
  features: FeatureProgress[]
  totalCompleted: number
  totalStories: number
  overallPercentage: number
  currentFeature: FeatureProgress | null
}

function getFeaturesDir(): string {
  return path.join(process.cwd(), 'features')
}

function parseProgressTxt(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    if (!content.trim()) return []
    
    // Split by story entries (marked by ---)
    const entries = content.split('---').filter(e => e.trim())
    
    // Get last 5 entries, most recent first
    return entries
      .slice(-5)
      .reverse()
      .map(entry => {
        const lines = entry.trim().split('\n')
        const storyLine = lines.find(l => l.startsWith('Story:'))
        return storyLine ? storyLine.replace('Story:', '').trim() : entry.trim().split('\n')[0]
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

function parseFeatureFolder(folderPath: string, folderName: string): FeatureProgress | null {
  const prdJsonPath = path.join(folderPath, 'prd.json')
  const progressTxtPath = path.join(folderPath, 'progress.txt')
  
  if (!fs.existsSync(prdJsonPath)) {
    return null
  }
  
  try {
    const prdContent = fs.readFileSync(prdJsonPath, 'utf-8')
    const prd = JSON.parse(prdContent)
    
    const stories: Story[] = prd.stories || []
    const completed = stories.filter(s => s.passes).length
    const total = stories.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    const recentActivity = parseProgressTxt(progressTxtPath)
    
    return {
      name: prd.feature || folderName,
      folderName,
      stories,
      completed,
      total,
      percentage,
      recentActivity
    }
  } catch {
    return null
  }
}

export function getProgress(): OverallProgress {
  const featuresDir = getFeaturesDir()
  const features: FeatureProgress[] = []
  
  if (!fs.existsSync(featuresDir)) {
    return {
      features: [],
      totalCompleted: 0,
      totalStories: 0,
      overallPercentage: 0,
      currentFeature: null
    }
  }
  
  const folders = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  
  for (const folder of folders) {
    const folderPath = path.join(featuresDir, folder)
    const feature = parseFeatureFolder(folderPath, folder)
    if (feature) {
      features.push(feature)
    }
  }
  
  const totalCompleted = features.reduce((sum, f) => sum + f.completed, 0)
  const totalStories = features.reduce((sum, f) => sum + f.total, 0)
  const overallPercentage = totalStories > 0 ? Math.round((totalCompleted / totalStories) * 100) : 0
  
  // Current feature is one that's in progress (has some but not all complete)
  const currentFeature = features.find(f => f.completed > 0 && f.completed < f.total) 
    || features.find(f => f.completed === 0 && f.total > 0)
    || null
  
  return {
    features,
    totalCompleted,
    totalStories,
    overallPercentage,
    currentFeature
  }
}
