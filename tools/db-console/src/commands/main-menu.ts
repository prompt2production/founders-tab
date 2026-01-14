import { Environment, environmentDisplayNames } from '../config.js'
import { selectOption } from '../prompts.js'

export type MenuOption = 'clear-data' | 'seed-users' | 'seed-expenses' | 'exit'

export async function showMainMenu(environment: Environment): Promise<MenuOption> {
  console.log('═══════════════════════════════════════')
  console.log('       Database Console Menu')
  console.log(`       Environment: ${environmentDisplayNames[environment]}`)
  console.log('═══════════════════════════════════════')

  const option = await selectOption<MenuOption>(
    'What would you like to do?',
    [
      { value: 'clear-data', label: 'Clear all data' },
      { value: 'seed-users', label: 'Seed users' },
      { value: 'seed-expenses', label: 'Seed expense data' },
      { value: 'exit', label: 'Exit' },
    ]
  )

  return option
}
