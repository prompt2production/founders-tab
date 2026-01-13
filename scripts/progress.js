#!/usr/bin/env node

/**
 * Ralph Progress CLI
 * Run with: npm run progress
 */

const fs = require('fs')
const path = require('path')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
}

function getProgress() {
  const featuresDir = path.join(process.cwd(), 'features')
  const features = []

  if (!fs.existsSync(featuresDir)) {
    return { features: [], totalCompleted: 0, totalStories: 0 }
  }

  const folders = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  for (const folder of folders) {
    const prdPath = path.join(featuresDir, folder, 'prd.json')
    if (!fs.existsSync(prdPath)) continue

    try {
      const prd = JSON.parse(fs.readFileSync(prdPath, 'utf-8'))
      const stories = prd.stories || []
      const completed = stories.filter(s => s.passes).length

      features.push({
        name: prd.feature || folder,
        folder,
        stories,
        completed,
        total: stories.length,
        percentage: stories.length > 0 ? Math.round((completed / stories.length) * 100) : 0
      })
    } catch (e) {
      // Skip invalid files
    }
  }

  const totalCompleted = features.reduce((sum, f) => sum + f.completed, 0)
  const totalStories = features.reduce((sum, f) => sum + f.total, 0)

  return { features, totalCompleted, totalStories }
}

function progressBar(percentage, width = 30) {
  const filled = Math.round((percentage / 100) * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  return bar
}

function printProgress() {
  const { features, totalCompleted, totalStories } = getProgress()

  console.log()
  console.log(`${colors.bold}${colors.blue}📊 Ralph Progress Dashboard${colors.reset}`)
  console.log(`${colors.dim}${'━'.repeat(50)}${colors.reset}`)
  console.log()

  if (features.length === 0) {
    console.log(`${colors.dim}No features found. Start with "Plan feature:" in Claude.${colors.reset}`)
    console.log()
    return
  }

  // Overall progress
  const overallPercentage = totalStories > 0 ? Math.round((totalCompleted / totalStories) * 100) : 0
  const overallColor = overallPercentage === 100 ? colors.green : colors.blue
  
  console.log(`${colors.bold}Overall Progress${colors.reset}`)
  console.log(`${overallColor}${progressBar(overallPercentage)}${colors.reset} ${overallPercentage}%`)
  console.log(`${colors.dim}${totalCompleted}/${totalStories} stories complete${colors.reset}`)
  console.log()

  // Each feature
  for (const feature of features) {
    const isComplete = feature.percentage === 100
    const isInProgress = feature.completed > 0 && feature.completed < feature.total
    
    const statusIcon = isComplete ? '✅' : isInProgress ? '🔄' : '⬜'
    const statusText = isComplete ? `${colors.green}COMPLETE${colors.reset}` : 
                       isInProgress ? `${colors.yellow}IN PROGRESS${colors.reset}` : 
                       `${colors.dim}PENDING${colors.reset}`
    
    console.log(`${colors.bold}${statusIcon} ${feature.name}${colors.reset} ${statusText}`)
    console.log(`${colors.dim}   features/${feature.folder}${colors.reset}`)
    
    const featureColor = isComplete ? colors.green : colors.blue
    console.log(`   ${featureColor}${progressBar(feature.percentage, 25)}${colors.reset} ${feature.percentage}% (${feature.completed}/${feature.total})`)
    console.log()

    // Show stories
    const firstIncomplete = feature.stories.findIndex(s => !s.passes)
    
    for (let i = 0; i < feature.stories.length; i++) {
      const story = feature.stories[i]
      const isNext = i === firstIncomplete
      
      let icon, color
      if (story.passes) {
        icon = '✅'
        color = colors.green
      } else if (isNext) {
        icon = '🔄'
        color = colors.yellow
      } else {
        icon = '⬜'
        color = colors.dim
      }
      
      const suffix = isNext ? ` ${colors.yellow}← CURRENT${colors.reset}` : ''
      console.log(`   ${icon} ${color}${story.id}${colors.reset}: ${story.title}${suffix}`)
    }
    
    console.log()
  }

  console.log(`${colors.dim}${'━'.repeat(50)}${colors.reset}`)
  console.log(`${colors.dim}Last updated: ${new Date().toLocaleTimeString()}${colors.reset}`)
  console.log(`${colors.dim}Web dashboard: http://localhost:3000/dev/progress${colors.reset}`)
  console.log()
}

// Run
printProgress()
