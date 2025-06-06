import { existsSync } from 'fs'
import { spawnSync } from 'child_process'

if (!existsSync('.next')) {
  console.log('No build found. Running "next build" first...')
  const result = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: true })
  if (result.status !== 0) {
    console.error('Build failed. Exiting.')
    process.exit(result.status ?? 1)
  }
}

