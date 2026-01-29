import { Environment, environmentDisplayNames } from '../config.js'
import { selectOption } from '../prompts.js'

export type MenuOption = 'clear-data' | 'delete-user' | 'list-primary-users' | 'migrate-multi-tenant' | 'reset-expenses' | 'seed-demo' | 'seed-users' | 'seed-expenses' | 'exit'

export async function showMainMenu(environment: Environment): Promise<MenuOption> {
  console.log('═══════════════════════════════════════')
  console.log('       Database Console Menu')
  console.log(`       Environment: ${environmentDisplayNames[environment]}`)
  console.log('═══════════════════════════════════════')

  const option = await selectOption<MenuOption>(
    'What would you like to do?',
    [
      { value: 'seed-demo', label: '🚀 Full demo seed (clear + seed everything)' },
      { value: 'seed-users', label: 'Seed users' },
      { value: 'seed-expenses', label: 'Seed expense data' },
      { value: 'list-primary-users', label: '👤 List primary users (registered)' },
      { value: 'migrate-multi-tenant', label: '🏢 Migrate to multi-tenant' },
      { value: 'clear-data', label: 'Clear all data' },
      { value: 'delete-user', label: 'Delete a user' },
      { value: 'reset-expenses', label: 'Reset expenses to unapproved' },
      { value: 'exit', label: 'Exit' },
    ]
  )

  return option
}
