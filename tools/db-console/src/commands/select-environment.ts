import { Environment, environmentDisplayNames } from '../config.js'
import { selectOption, confirm } from '../prompts.js'

export async function selectEnvironment(): Promise<Environment> {
  console.log()
  console.log('╔════════════════════════════════════════╗')
  console.log('║     Founders Tab Database Console      ║')
  console.log('╚════════════════════════════════════════╝')
  console.log()

  const environment = await selectOption<Environment>(
    'Select the environment to connect to:',
    [
      { value: 'development', label: environmentDisplayNames.development },
      { value: 'test', label: environmentDisplayNames.test },
      { value: 'production', label: environmentDisplayNames.production },
    ]
  )

  if (environment === 'production') {
    console.log()
    console.log('⚠️  WARNING: You are about to connect to PRODUCTION!')
    console.log('   Any changes made will affect live data.')
    console.log()

    const confirmed = await confirm('Are you sure you want to proceed?')

    if (!confirmed) {
      console.log('Aborting...')
      process.exit(0)
    }
  }

  console.log()
  console.log(`✓ Connected to ${environmentDisplayNames[environment]} environment`)
  console.log()

  return environment
}
