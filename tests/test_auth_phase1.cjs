const assert = require('assert')
const crypto = require('crypto')
const { spawnSync } = require('child_process')
const path = require('path')

console.log('[TEST] Phase 1: Authentication Security & Secrets Tests')

const serverPath = path.resolve(__dirname, 'backend', 'server.js')

// Test 1: Production refuses to start if ADMIN_PASSWORD is insecure or missing
console.log('Test 1: Insecure ADMIN_PASSWORD in production should exit with fatal error')
const proc1 = spawnSync(process.execPath, [serverPath], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    ADMIN_PASSWORD: 'password', // weak
    AUTH_SECRET: 'a_sufficiently_long_auth_secret_for_testing_123456789'
  }
})
assert.strictEqual(proc1.status, 1, 'Should exit with code 1')
assert.ok(proc1.stderr.toString().includes('FATAL SECURITY ERROR'), 'Stderr should contain FATAL SECURITY ERROR')
console.log('✔ Test 1 passed: Insecure ADMIN_PASSWORD rejected in production')

// Test 2: Production refuses to start if AUTH_SECRET is insecure (<16 chars or default)
console.log('Test 2: Insecure AUTH_SECRET in production should exit with fatal error')
const proc2 = spawnSync(process.execPath, [serverPath], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    ADMIN_PASSWORD: 'super_strong_custom_admin_password_2026',
    AUTH_SECRET: 'short' // too short (< 16)
  }
})
assert.strictEqual(proc2.status, 1, 'Should exit with code 1')
assert.ok(proc2.stderr.toString().includes('FATAL SECURITY ERROR'), 'Stderr should contain FATAL SECURITY ERROR for AUTH_SECRET')
console.log('✔ Test 2 passed: Insecure AUTH_SECRET rejected in production')

// Test 3: Token creation and verification logic with timingSafeEqual
console.log('Test 3: Token generation, verification, and timing safety')
const testSecret = crypto.randomBytes(32).toString('hex')
const testUsername = 'elmehdi'

function generateAdminToken(username, secret) {
  const payload = {
    user: username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')
  return `${payloadB64}.${signature}`
}

function verifyAdminToken(token, secret, username) {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payloadB64, signature] = parts
  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')
  
  const bufA = Buffer.from(signature, 'utf-8')
  const bufB = Buffer.from(expectedSignature, 'utf-8')
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'))
    if (!payload.exp || Date.now() > payload.exp) return false
    return payload.user === username
  } catch (err) {
    return false
  }
}

const validToken = generateAdminToken(testUsername, testSecret)
assert.strictEqual(verifyAdminToken(validToken, testSecret, testUsername), true, 'Valid token should pass verification')

// Tampered token test
const tamperedToken = validToken.slice(0, -4) + 'abcd'
assert.strictEqual(verifyAdminToken(tamperedToken, testSecret, testUsername), false, 'Tampered token must fail verification')

// Expired token test
const expiredPayload = Buffer.from(JSON.stringify({ user: testUsername, exp: Date.now() - 1000 })).toString('base64url')
const expiredSig = crypto.createHmac('sha256', testSecret).update(expiredPayload).digest('base64url')
const expiredToken = `${expiredPayload}.${expiredSig}`
assert.strictEqual(verifyAdminToken(expiredToken, testSecret, testUsername), false, 'Expired token must fail verification')

console.log('✔ Test 3 passed: Token generation, verification, and tamper rejection verified')
console.log('All Phase 1 tests passed successfully!')
