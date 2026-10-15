const { spawnSync } = require('child_process')
const path = require('path')

const testFiles = [
  'test_auth_phase1.cjs',
  'test_publish_phase2.cjs',
  'test_slug_phase3.cjs',
  'test_ratelimit_phase4.cjs'
]

console.log('====================================================')
console.log('   RomanceToon Backend & Security Test Runner')
console.log('====================================================\n')

let anyFailed = false

for (const file of testFiles) {
  const filePath = path.join(__dirname, file)
  console.log(`--> Running ${file}...`)
  const result = spawnSync(process.execPath, [filePath], { stdio: 'inherit' })
  
  if (result.status !== 0) {
    console.error(`\n❌ Suite FAILED: ${file} (Exit code: ${result.status})\n`)
    anyFailed = true
    break
  }
  console.log(`--> ${file} PASSED\n`)
}

if (anyFailed) {
  console.error('====================================================')
  console.error('❌ One or more test suites failed.')
  console.error('====================================================')
  process.exit(1)
} else {
  console.log('====================================================')
  console.log('🎉 ALL 4 TEST SUITES PASSED SUCCESSFULLY (100%)!')
  console.log('====================================================')
  process.exit(0)
}
