export type Environment = 'development' | 'test' | 'production'

export const environmentDisplayNames: Record<Environment, string> = {
  development: 'Development',
  test: 'Test',
  production: 'Production',
}

export function getConnectionString(environment: Environment): string {
  const envVarMap: Record<Environment, string> = {
    development: 'DATABASE_URL_DEV',
    test: 'DATABASE_URL_TEST',
    production: 'DATABASE_URL_PROD',
  }

  const envVar = envVarMap[environment]
  const connectionString = process.env[envVar]

  if (!connectionString) {
    throw new Error(`Environment variable ${envVar} is not set. Please check your .env file.`)
  }

  return connectionString
}
