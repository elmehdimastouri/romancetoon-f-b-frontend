const assert = require('assert')

console.log('[TEST] Phase 4: Rate Limiting & Proxy Architecture Tests')

function getClientIp(req) {
  const cfIp = req.headers['cf-connecting-ip']
  if (cfIp && typeof cfIp === 'string') {
    const cleanCfIp = cfIp.trim()
    if (cleanCfIp) return cleanCfIp
  }

  const remoteAddr = req.socket?.remoteAddress || ''
  const isLoopback = remoteAddr.includes('127.0.0.1') || remoteAddr.includes('::1') || remoteAddr.includes('::ffff:127.0.0.1')

  if (isLoopback) {
    const xff = req.headers['x-forwarded-for']
    if (xff && typeof xff === 'string') {
      const parts = xff.split(',').map(s => s.trim()).filter(Boolean)
      if (parts.length > 0) {
        return parts[0]
      }
    }
  }

  return req.ip || remoteAddr || '127.0.0.1'
}

const loginAttempts = new Map()

function isRateLimited(ip) {
  const record = loginAttempts.get(ip)
  if (!record) return false
  if (Date.now() > record.resetTime) {
    loginAttempts.delete(ip)
    return false
  }
  return record.attempts >= 5
}

function recordFailedAttempt(ip) {
  const record = loginAttempts.get(ip) || { attempts: 0, resetTime: Date.now() + 15 * 60 * 1000 }
  record.attempts += 1
  loginAttempts.set(ip, record)
}

// Test 1: Cloudflare Connecting IP isolation
console.log('Test 1: Multiple users through Cloudflare proxy have isolated limits')
const reqUserA = {
  headers: { 'cf-connecting-ip': '198.51.100.10' },
  socket: { remoteAddress: '127.0.0.1' }
}
const reqUserB = {
  headers: { 'cf-connecting-ip': '203.0.113.50' },
  socket: { remoteAddress: '127.0.0.1' }
}

const ipA = getClientIp(reqUserA)
const ipB = getClientIp(reqUserB)

assert.strictEqual(ipA, '198.51.100.10')
assert.strictEqual(ipB, '203.0.113.50')

// Simulate User A failing 5 times
for (let i = 0; i < 5; i++) {
  assert.strictEqual(isRateLimited(ipA), false)
  recordFailedAttempt(ipA)
}

// User A is now blocked
assert.strictEqual(isRateLimited(ipA), true, 'User A should be rate limited after 5 attempts')

// User B must NOT be blocked!
assert.strictEqual(isRateLimited(ipB), false, 'User B must NOT be affected by User A rate limit')
console.log('✔ Test 1 passed: Distinct users do NOT share rate limits')

// Test 2: Spoofed X-Forwarded-For attack cannot bypass rate limit when behind Cloudflare
console.log('Test 2: Spoofed X-Forwarded-For header cannot bypass rate limit')
const reqSpoofer = {
  headers: {
    'cf-connecting-ip': '198.51.100.10', // real edge IP from Cloudflare
    'x-forwarded-for': '1.1.1.1, 2.2.2.2' // attacker spoofed header
  },
  socket: { remoteAddress: '127.0.0.1' }
}

const spooferResolvedIp = getClientIp(reqSpoofer)
assert.strictEqual(spooferResolvedIp, '198.51.100.10', 'Should trust CF-Connecting-IP over client-injected X-Forwarded-For')
assert.strictEqual(isRateLimited(spooferResolvedIp), true, 'Spoofer remains blocked despite injected headers')
console.log('✔ Test 2 passed: Rate limit bypass via X-Forwarded-For is prevented')

console.log('All Phase 4 tests passed successfully!')
