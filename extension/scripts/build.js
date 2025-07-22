#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

console.log('🚀 Building Rehbar AI Extension...\n')

try {
  // Clean and build
  console.log('📦 Building extension...')
  execSync('npm run build', { stdio: 'inherit' })

  // Create build info
  const buildInfo = {
    version: process.env.npm_package_version || '1.0.0',
    buildTime: new Date().toISOString(),
    gitCommit: process.env.GITHUB_SHA || 'local',
    environment: process.env.NODE_ENV || 'production'
  }

  const distPath = join(process.cwd(), 'dist')
  if (!existsSync(distPath)) {
    mkdirSync(distPath, { recursive: true })
  }

  writeFileSync(
    join(distPath, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  )

  console.log('\n✅ Build completed successfully!')
  console.log(`📁 Output: ${distPath}`)
  console.log(`🏷️  Version: ${buildInfo.version}`)
  console.log(`⏰ Built: ${buildInfo.buildTime}`)

} catch (error) {
  console.error('\n❌ Build failed:', error.message)
  process.exit(1)
}
