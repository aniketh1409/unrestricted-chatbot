const https = require('https');
const http = require('http');

class ChatbotTester {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: jsonBody,
              rawBody: body
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body,
              rawBody: body
            });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async test(name, testFn) {
    console.log(`🔍 Running test: ${name}`);
    try {
      await testFn();
      console.log(`✅ PASSED: ${name}`);
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ FAILED: ${name} - ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Chatbot Test Suite...\n');

    // Test 1: Health Check
    await this.test('Health Check', async () => {
      const response = await this.makeRequest('/api/health');
      this.assert(response.status === 200, `Expected status 200, got ${response.status}`);
      this.assert(response.body.status === 'healthy', 'Health check should return healthy status');
    });

    // Test 2: Models Endpoint
    await this.test('Get Available Models', async () => {
      const response = await this.makeRequest('/api/chat/models');
      this.assert(response.status === 200, `Expected status 200, got ${response.status}`);
      this.assert(response.body.openai, 'Should return OpenAI models');
      this.assert(response.body.anthropic, 'Should return Anthropic models');
      this.assert(response.body.local, 'Should return local models');
    });

    // Test 3: Chat Endpoint (without API key - should fail gracefully)
    await this.test('Chat Endpoint Error Handling', async () => {
      const response = await this.makeRequest('/api/chat', 'POST', {
        message: 'Hello, this is a test message',
        provider: 'openai'
      });
      
      // Should either work or fail gracefully
      this.assert(
        response.status === 200 || response.status === 500,
        `Expected status 200 or 500, got ${response.status}`
      );
      
      if (response.status === 500) {
        this.assert(response.body.error, 'Error response should include error message');
      }
    });

    // Test 4: Rate Limiting
    await this.test('Rate Limiting', async () => {
      // Make multiple rapid requests to test rate limiting
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(this.makeRequest('/api/health'));
      }
      
      const responses = await Promise.all(requests);
      // All should pass since health endpoint has lenient rate limiting
      responses.forEach((response, index) => {
        this.assert(
          response.status === 200 || response.status === 429,
          `Request ${index + 1} should return 200 or 429 (rate limited)`
        );
      });
    });

    // Test 5: Admin Endpoints (without auth - should fail)
    await this.test('Admin Authentication', async () => {
      const response = await this.makeRequest('/api/admin/stats');
      this.assert(response.status === 401, 'Admin endpoints should require authentication');
      this.assert(response.body.error, 'Should return error message for unauthorized access');
    });

    // Test 6: Admin Health Check (public endpoint)
    await this.test('Admin Health Check', async () => {
      const response = await this.makeRequest('/api/admin/health');
      this.assert(response.status === 200, `Expected status 200, got ${response.status}`);
      this.assert(response.body.status === 'healthy', 'Admin health check should return healthy status');
      this.assert(typeof response.body.uptime === 'number', 'Should include uptime');
      this.assert(response.body.memory, 'Should include memory information');
    });

    // Test 7: Invalid Chat Request
    await this.test('Invalid Chat Request', async () => {
      const response = await this.makeRequest('/api/chat', 'POST', {
        // Missing required message field
        provider: 'openai'
      });
      this.assert(response.status === 400, 'Should return 400 for invalid request');
      this.assert(response.body.error === 'Message is required', 'Should return specific error message');
    });

    // Test 8: Unsupported Provider
    await this.test('Unsupported Provider', async () => {
      const response = await this.makeRequest('/api/chat', 'POST', {
        message: 'Hello',
        provider: 'unsupported_provider'
      });
      this.assert(response.status === 500, 'Should return 500 for unsupported provider');
      this.assert(response.body.error, 'Should return error message');
    });

    // Test Results
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100)}%`);

    if (this.results.failed > 0) {
      console.log('\n💥 Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => console.log(`   - ${test.name}: ${test.error}`));
    }

    console.log('\n🎯 Test Suite Complete!');
    
    return this.results.failed === 0;
  }
}

// Command line usage
if (require.main === module) {
  const tester = new ChatbotTester();
  
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test suite failed to run:', error);
      process.exit(1);
    });
}

module.exports = ChatbotTester; 