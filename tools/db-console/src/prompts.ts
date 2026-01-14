import * as readline from 'readline'

let rl: readline.Interface | null = null

function getReadline(): readline.Interface {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
  }
  return rl
}

export function closeReadline(): void {
  if (rl) {
    rl.close()
    rl = null
  }
}

export function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    getReadline().question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

export async function selectOption<T extends string>(
  prompt: string,
  options: { value: T; label: string }[]
): Promise<T> {
  console.log(prompt)
  console.log()
  options.forEach((option, index) => {
    console.log(`  ${index + 1}. ${option.label}`)
  })
  console.log()

  while (true) {
    const answer = await askQuestion('Select an option: ')
    const index = parseInt(answer, 10) - 1

    if (index >= 0 && index < options.length) {
      return options[index].value
    }

    console.log(`Invalid selection. Please enter a number between 1 and ${options.length}.`)
  }
}

export async function confirm(question: string): Promise<boolean> {
  const answer = await askQuestion(`${question} (yes/no): `)
  return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y'
}
