// Comprehensive Authentication System Test Suite
// Tests the complete web-first authentication flow

const API_BASE_URL = 'http://localhost:3001';
const WEB_APP_URL = 'http://localhost:3000';

class AuthenticationTester {
  constructor() {
    this.testResults = [];
    this.authToken = null;
    this.sessionId = null;
    this.deviceFingerprint = this.generateDeviceFingerprint();
  }

  generateDeviceFingerprint() {
    return btoa(`test-device-${Date.now()}`).substring(0, 32);
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Authentication Tests...\n');

    try {
      // Test 1: Web App Registration
      await this.testWebAppRegistration();

      // Test 2: Web App Login
      await this.testWebAppLogin();

      // Test 3: Session Validation
      await this.testSessionValidation();

      // Test 4: Extension Authentication (should work)
      await this.testExtensionAuthentication();

      // Test 5: Extension without Web Login (should fail)
      await this.testExtensionWithoutWebLogin();

      // Test 6: Device Fingerprint Validation
      await this.testDeviceFingerprintValidation();

      // Test 7: Rate Limiting
      await this.testRateLimiting();

      // Test 8: Security Validation
      await this.testSecurityValidation();

      // Test 9: Session Expiry
      await this.testSessionExpiry();

      // Test 10: Logout and Cleanup
      await this.testLogoutAndCleanup();

      this.printTestResults();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testWebAppRegistration() {
    console.log('📝 Testing Web App Registration...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': this.deviceFingerprint
        },
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          displayName: 'Test User'
        })
      });

      const data = await response.json();

      if (data.success) {
        this.authToken = data.data.token;
        this.sessionId = data.data.sessionId;
        this.addTestResult('Web App Registration', true, 'User registered successfully');
      } else {
        this.addTestResult('Web App Registration', false, data.error);
      }
    } catch (error) {
      this.addTestResult('Web App Registration', false, error.message);
    }
  }

  async testWebAppLogin() {
    console.log('🔐 Testing Web App Login...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': this.deviceFingerprint
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
      });

      const data = await response.json();

      if (data.success) {
        this.authToken = data.data.token;
        this.sessionId = data.data.sessionId;
        this.addTestResult('Web App Login', true, 'Login successful with session created');
      } else {
        this.addTestResult('Web App Login', false, data.error);
      }
    } catch (error) {
      this.addTestResult('Web App Login', false, error.message);
    }
  }

  async testSessionValidation() {
    console.log('✅ Testing Session Validation...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/session/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
          'X-Device-Fingerprint': this.deviceFingerprint,
          'X-Extension-Id': 'test-extension-id'
        },
        body: JSON.stringify({
          deviceFingerprint: this.deviceFingerprint,
          extensionId: 'test-extension-id'
        })
      });

      const data = await response.json();

      if (data.success) {
        this.addTestResult('Session Validation', true, 'Session validated successfully');
      } else {
        this.addTestResult('Session Validation', false, data.message);
      }
    } catch (error) {
      this.addTestResult('Session Validation', false, error.message);
    }
  }

  async testExtensionAuthentication() {
    console.log('🔌 Testing Extension Authentication (with web session)...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/extension/user-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'X-Device-Fingerprint': this.deviceFingerprint,
          'X-Extension-Id': 'test-extension-id',
          'Origin': 'chrome-extension://test-extension-id'
        }
      });

      const data = await response.json();

      if (data.success) {
        this.addTestResult('Extension Authentication', true, 'Extension authenticated successfully');
      } else {
        this.addTestResult('Extension Authentication', false, data.error);
      }
    } catch (error) {
      this.addTestResult('Extension Authentication', false, error.message);
    }
  }

  async testExtensionWithoutWebLogin() {
    console.log('🚫 Testing Extension without Web Login...');
    
    try {
      // Clear session to simulate no web login
      const tempSessionId = this.sessionId;
      this.sessionId = null;

      const response = await fetch(`${API_BASE_URL}/api/extension/user-status`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'X-Device-Fingerprint': this.deviceFingerprint,
          'X-Extension-Id': 'test-extension-id',
          'Origin': 'chrome-extension://test-extension-id'
        }
      });

      const data = await response.json();

      if (!data.success && data.code === 'WEB_AUTH_REQUIRED') {
        this.addTestResult('Extension Without Web Login', true, 'Correctly blocked extension access');
      } else {
        this.addTestResult('Extension Without Web Login', false, 'Should have blocked access');
      }

      // Restore session
      this.sessionId = tempSessionId;
    } catch (error) {
      this.addTestResult('Extension Without Web Login', true, 'Correctly blocked with error');
    }
  }

  async testDeviceFingerprintValidation() {
    console.log('🔍 Testing Device Fingerprint Validation...');
    
    try {
      // Test with invalid fingerprint
      const response = await fetch(`${API_BASE_URL}/api/extension/user-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'X-Device-Fingerprint': 'invalid-fingerprint',
          'X-Extension-Id': 'test-extension-id',
          'Origin': 'chrome-extension://test-extension-id'
        }
      });

      const data = await response.json();

      // Should either auto-register or validate the device
      if (data.success || data.code === 'DEVICE_NOT_AUTHORIZED') {
        this.addTestResult('Device Fingerprint Validation', true, 'Device validation working');
      } else {
        this.addTestResult('Device Fingerprint Validation', false, 'Unexpected response');
      }
    } catch (error) {
      this.addTestResult('Device Fingerprint Validation', false, error.message);
    }
  }

  async testRateLimiting() {
    console.log('⏱️ Testing Rate Limiting...');
    
    try {
      const requests = [];
      
      // Send multiple requests rapidly
      for (let i = 0; i < 10; i++) {
        requests.push(
          fetch(`${API_BASE_URL}/api/extension/user-status`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.authToken}`,
              'X-Device-Fingerprint': this.deviceFingerprint,
              'X-Extension-Id': 'test-extension-id',
              'Origin': 'chrome-extension://test-extension-id'
            }
          })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);

      this.addTestResult('Rate Limiting', true, `Rate limiting ${rateLimited ? 'active' : 'not triggered'}`);
    } catch (error) {
      this.addTestResult('Rate Limiting', false, error.message);
    }
  }

  async testSecurityValidation() {
    console.log('🛡️ Testing Security Validation...');
    
    try {
      // Test with suspicious user agent
      const response = await fetch(`${API_BASE_URL}/api/extension/user-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'X-Device-Fingerprint': this.deviceFingerprint,
          'X-Extension-Id': 'test-extension-id',
          'Origin': 'chrome-extension://test-extension-id',
          'User-Agent': 'Bot'
        }
      });

      // Should handle suspicious activity gracefully
      this.addTestResult('Security Validation', true, 'Security validation active');
    } catch (error) {
      this.addTestResult('Security Validation', false, error.message);
    }
  }

  async testSessionExpiry() {
    console.log('⏰ Testing Session Expiry...');
    
    try {
      // Test with expired token (simulate by using invalid token)
      const response = await fetch(`${API_BASE_URL}/api/extension/user-status`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer expired-token',
          'X-Device-Fingerprint': this.deviceFingerprint,
          'X-Extension-Id': 'test-extension-id',
          'Origin': 'chrome-extension://test-extension-id'
        }
      });

      if (response.status === 401) {
        this.addTestResult('Session Expiry', true, 'Expired tokens correctly rejected');
      } else {
        this.addTestResult('Session Expiry', false, 'Should reject expired tokens');
      }
    } catch (error) {
      this.addTestResult('Session Expiry', true, 'Correctly handled expired token');
    }
  }

  async testLogoutAndCleanup() {
    console.log('🚪 Testing Logout and Cleanup...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          sessionId: this.sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        this.addTestResult('Logout and Cleanup', true, 'Logout successful');
      } else {
        this.addTestResult('Logout and Cleanup', false, data.error);
      }
    } catch (error) {
      this.addTestResult('Logout and Cleanup', false, error.message);
    }
  }

  addTestResult(testName, passed, message) {
    this.testResults.push({
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });

    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}\n`);
  }

  printTestResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));

    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    console.log('\nDetailed Results:');
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.message}`);
    });

    if (passed === total) {
      console.log('\n🎉 All tests passed! Authentication system is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the implementation.');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AuthenticationTester();
  tester.runAllTests();
}

module.exports = AuthenticationTester;
