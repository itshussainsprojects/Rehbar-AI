const http = require('http');

console.log('🚀 Starting Rehbar AI Backend Server...');

// Simple in-memory storage
const users = new Map();
const admins = new Map();
const tokens = new Map();

// Add test user
users.set('test@rehbar.ai', {
  id: 'user_test_123',
  email: 'test@rehbar.ai',
  displayName: 'Test User',
  state: 'registered',
  plan: null,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  usage: {
    meetingsToday: 0,
    voiceMinutesToday: 0,
    aiSuggestionsToday: 0,
    lastResetDate: new Date().toISOString().split('T')[0]
  }
});

// Add admin user
admins.set('admin@rehbar.ai', {
  id: 'admin_123',
  email: 'admin@rehbar.ai',
  displayName: 'System Administrator',
  role: 'admin',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
});

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // Health check
  if (path === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'Rehbar AI Backend is running',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Registration endpoint
  if (path === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Registration attempt for:', data.email);

        // Check if user already exists
        if (users.has(data.email)) {
          res.writeHead(409);
          res.end(JSON.stringify({
            success: false,
            error: 'User already exists'
          }));
          return;
        }

        // Create new user
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: data.email,
          displayName: data.displayName || data.email.split('@')[0],
          state: 'registered',
          plan: null,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          usage: {
            meetingsToday: 0,
            voiceMinutesToday: 0,
            aiSuggestionsToday: 0,
            lastResetDate: new Date().toISOString().split('T')[0]
          }
        };

        users.set(data.email, newUser);

        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        tokens.set(token, {
          userId: newUser.id,
          email: newUser.email,
          type: 'user',
          createdAt: Date.now()
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            user: newUser,
            token: token,
            refreshToken: token + '_refresh'
          }
        }));
      } catch (error) {
        console.error('Registration error:', error);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid request data'
        }));
      }
    });
    return;
  }

  // Login endpoint
  if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Login attempt for:', data.email);

        // Check if it's a user login
        if (data.email === 'test@rehbar.ai' && data.password === 'test123') {
          const user = users.get(data.email);
          const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          tokens.set(token, {
            userId: user.id,
            email: user.email,
            type: 'user',
            createdAt: Date.now()
          });

          user.lastLogin = new Date().toISOString();

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              user: user,
              token: token,
              refreshToken: token + '_refresh'
            }
          }));
        }
        // Check if it's an admin login
        else if (data.email === 'admin@rehbar.ai' && data.password === 'admin123') {
          const admin = admins.get(data.email);
          const token = `admin_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          tokens.set(token, {
            userId: admin.id,
            email: admin.email,
            type: 'admin',
            createdAt: Date.now()
          });

          admin.lastLogin = new Date().toISOString();

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              user: admin,
              token: token,
              refreshToken: token + '_refresh'
            }
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid credentials'
          }));
        }
      } catch (error) {
        console.error('Login error:', error);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid request data'
        }));
      }
    });
    return;
  }

  // User dashboard
  if (path === '/api/user/dashboard' && req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        error: 'Authorization token required'
      }));
      return;
    }

    const token = authHeader.substring(7);
    const tokenData = tokens.get(token);
    
    if (!tokenData) {
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        error: 'Invalid token'
      }));
      return;
    }

    const user = users.get(tokenData.email);
    if (!user) {
      res.writeHead(404);
      res.end(JSON.stringify({
        success: false,
        error: 'User not found'
      }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        user: user,
        availablePlans: {
          FREE: { id: 'free', name: 'Free Trial', price: 0, duration: '3 days' },
          PRO: { id: 'pro', name: 'Professional', price: 29, duration: 'monthly' },
          PREMIUM: { id: 'premium', name: 'Premium Enterprise', price: 99, duration: 'monthly' }
        },
        canSelectPlan: user.state === 'registered',
        canDownload: user.state === 'approved' || user.state === 'active'
      }
    }));
    return;
  }

  // Plan selection
  if (path === '/api/user/select-plan' && req.method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        error: 'Authorization token required'
      }));
      return;
    }

    const token = authHeader.substring(7);
    const tokenData = tokens.get(token);
    
    if (!tokenData) {
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        error: 'Invalid token'
      }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const user = users.get(tokenData.email);
        
        if (user) {
          user.plan = data.planId;
          user.state = 'pending_approval';
          user.planRequestedAt = new Date().toISOString();
          
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              user: user,
              message: 'Plan selected successfully. Waiting for admin approval.'
            }
          }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({
            success: false,
            error: 'User not found'
          }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid request data'
        }));
      }
    });
    return;
  }

  // Admin login endpoint
  if (path === '/api/admin/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Admin login attempt for:', data.email);

        if (data.email === 'admin@rehbar.ai' && data.password === 'admin123') {
          const admin = admins.get(data.email);
          const token = `admin_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          tokens.set(token, {
            userId: admin.id,
            email: admin.email,
            type: 'admin',
            createdAt: Date.now()
          });

          admin.lastLogin = new Date().toISOString();

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              admin: admin,
              token: token,
              refreshToken: token + '_refresh'
            }
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid admin credentials'
          }));
        }
      } catch (error) {
        console.error('Admin login error:', error);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid request data'
        }));
      }
    });
    return;
  }

  // Admin approvals endpoint
  if (path === '/api/admin/approvals' && req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        error: 'Authorization token required'
      }));
      return;
    }

    const token = authHeader.substring(7);
    const tokenData = tokens.get(token);

    if (!tokenData || tokenData.type !== 'admin') {
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        error: 'Admin access required'
      }));
      return;
    }

    // Get all users pending approval
    const pendingUsers = Array.from(users.values()).filter(user =>
      user.state === 'pending_approval'
    );

    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        pendingApprovals: pendingUsers,
        totalUsers: users.size,
        totalPending: pendingUsers.length
      }
    }));
    return;
  }

  // Admin approve user endpoint
  if (path === '/api/admin/approve' && req.method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        error: 'Authorization token required'
      }));
      return;
    }

    const token = authHeader.substring(7);
    const tokenData = tokens.get(token);

    if (!tokenData || tokenData.type !== 'admin') {
      res.writeHead(401);
      res.end(JSON.stringify({
        success: false,
        error: 'Admin access required'
      }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const user = Array.from(users.values()).find(u => u.id === data.userId);

        if (user) {
          user.state = 'approved';
          user.approvedAt = new Date().toISOString();
          user.approvedBy = tokenData.email;

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              user: user,
              message: 'User approved successfully'
            }
          }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({
            success: false,
            error: 'User not found'
          }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid request data'
        }));
      }
    });
    return;
  }

  // Default 404
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    error: 'Endpoint not found'
  }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log('');
  console.log('🚀 REHBAR AI BACKEND SERVER STARTED!');
  console.log('='.repeat(50));
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
  console.log('🔧 Available endpoints:');
  console.log('   GET  /api/health - Health check');
  console.log('   POST /api/auth/register - User registration');
  console.log('   POST /api/auth/login - User/Admin login');
  console.log('   GET  /api/user/dashboard - User dashboard');
  console.log('   POST /api/user/select-plan - Select plan');
  console.log('   POST /api/admin/login - Admin login');
  console.log('   GET  /api/admin/approvals - Get pending approvals');
  console.log('   POST /api/admin/approve - Approve user plan');
  console.log('');
  console.log('🔑 PRODUCTION CREDENTIALS:');
  console.log('   User: test@rehbar.ai / test123');
  console.log('   Admin: admin@rehbar.ai / admin123');
  console.log('');
  console.log('✅ PRODUCTION SERVER READY!');
  console.log('='.repeat(50));
});

// Clean up old tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [token, data] of tokens.entries()) {
    if (now - data.createdAt > oneHour) {
      tokens.delete(token);
    }
  }
}, 5 * 60 * 1000);
