// Rehbar AI Backend Server - Complete System
// Handles user management, plan selection, admin approval, and downloads

const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { UserDatabase, AdminDatabase, USER_STATES, PLAN_TYPES } = require('./database');

// Simple in-memory token storage (for session management)
const tokens = new Map();

// Add test user for immediate testing
const testUserResult = UserDatabase.createUser({
  email: 'test@rehbar.ai',
  displayName: 'Test User',
  provider: 'email'
});

if (testUserResult.success) {
  console.log('✅ Test user created successfully');
} else if (testUserResult.error === 'User already exists') {
  console.log('✅ Test user already exists');
} else {
  console.error('❌ Failed to create test user:', testUserResult.error);
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Generate simple token
function generateToken(email) {
  const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  tokens.set(token, { email, createdAt: Date.now() });
  return token;
}

// Handle requests
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Collect request body
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      
      console.log(`${method} ${path}`, data);

      // Root endpoint - Welcome message
      if (path === '/' && method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Rehbar AI Backend Server',
          version: '2.0.0',
          status: 'running',
          endpoints: {
            health: '/api/health',
            login: '/api/auth/login',
            register: '/api/auth/register',
            config: '/api/auth/config'
          },
          timestamp: new Date().toISOString()
        }));
        return;
      }

      // Routes
      if (path === '/api/auth/register' && method === 'POST') {
        const { email, password, displayName } = data;
        
        if (!email || !password) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Email and password are required'
          }));
          return;
        }

        // Create user in database
        const result = UserDatabase.createUser({
          email,
          displayName: displayName || email.split('@')[0],
          provider: 'email'
        });

        if (!result.success) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: result.error
          }));
          return;
        }

        // Generate token
        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        tokens.set(token, {
          userId: result.user.id,
          email: result.user.email,
          createdAt: Date.now()
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            user: {
              id: result.user.id,
              email: result.user.email,
              displayName: result.user.displayName,
              state: result.user.state,
              plan: result.user.plan,
              createdAt: result.user.createdAt
            },
            token,
            refreshToken: token + '_refresh'
          }
        }));

      } else if (path === '/api/auth/login' && method === 'POST') {
        const { email, password } = data;

        if (!email || !password) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Email and password are required'
          }));
          return;
        }

        // For now, allow test user login (in production, verify password properly)
        const user = UserDatabase.getUserByEmail(email);
        if (!user || (email === 'test@rehbar.ai' && password !== 'test123')) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid credentials'
          }));
          return;
        }

        // Update last login
        UserDatabase.updateUser(user.id, { lastLogin: new Date().toISOString() });

        // Generate token
        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        tokens.set(token, {
          userId: user.id,
          email: user.email,
          createdAt: Date.now()
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              state: user.state,
              plan: user.plan,
              createdAt: user.createdAt,
              lastLogin: user.lastLogin
            },
            token,
            refreshToken: token + '_refresh'
          }
        }));

      } else if (path === '/api/auth/validate' && method === 'POST') {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token || !tokens.has(token)) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid token'
          }));
          return;
        }

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: { valid: true }
        }));

      } else if (path === '/api/auth/google' && method === 'POST') {
        const { idToken, userData } = data;

        if (!idToken || !userData || !userData.email) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Missing required fields for Google authentication'
          }));
          return;
        }

        // For now, simulate Google auth success (Firebase would verify the idToken)
        const user = {
          email: userData.email,
          displayName: userData.displayName || userData.email.split('@')[0],
          profilePicture: userData.profilePicture,
          provider: 'google',
          createdAt: new Date().toISOString()
        };

        // Store user (in production, verify idToken with Firebase Admin SDK)
        users.set(userData.email, user);

        // Generate token
        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const refreshToken = `${token}_refresh`;

        tokens.set(token, {
          email: userData.email,
          createdAt: Date.now()
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            user,
            token,
            refreshToken
          }
        }));

      } else if (path === '/api/auth/phone' && method === 'POST') {
        const { idToken, phoneNumber, displayName } = data;

        if (!idToken || !phoneNumber) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Missing required fields for phone authentication'
          }));
          return;
        }

        // For now, simulate phone auth success (Firebase would verify the idToken)
        const user = {
          phoneNumber,
          displayName: displayName || `User_${phoneNumber.slice(-4)}`,
          provider: 'phone',
          createdAt: new Date().toISOString()
        };

        // Store user (in production, verify idToken with Firebase Admin SDK)
        users.set(phoneNumber, user);

        // Generate token
        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const refreshToken = `${token}_refresh`;

        tokens.set(token, {
          phoneNumber,
          createdAt: Date.now()
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            user,
            token,
            refreshToken
          }
        }));

      } else if (path === '/api/user/dashboard' && method === 'GET') {
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

        const user = UserDatabase.getUserById(tokenData.userId);
        if (!user) {
          res.writeHead(404);
          res.end(JSON.stringify({
            success: false,
            error: 'User not found'
          }));
          return;
        }

        // Reset daily usage if needed
        const today = new Date().toISOString().split('T')[0];
        if (user.usage.lastResetDate !== today) {
          UserDatabase.resetDailyUsage(user.id);
          // Get updated user data
          const updatedUser = UserDatabase.getUserById(user.id);
          Object.assign(user, updatedUser);
        }

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              state: user.state,
              plan: user.plan,
              planDetails: user.plan ? PLAN_TYPES[user.plan.toUpperCase()] : null,
              usage: user.usage,
              createdAt: user.createdAt,
              lastLogin: user.lastLogin,
              approvedAt: user.approvedAt
            },
            availablePlans: PLAN_TYPES,
            canSelectPlan: user.state === USER_STATES.REGISTERED || user.state === USER_STATES.REJECTED,
            canDownload: user.state === USER_STATES.APPROVED || user.state === USER_STATES.ACTIVE
          }
        }));

      } else if (path === '/api/user/select-plan' && method === 'POST') {
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

        const { planId } = data;
        if (!planId || !PLAN_TYPES[planId.toUpperCase()]) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Valid plan ID required (free, pro, premium)'
          }));
          return;
        }

        const result = UserDatabase.selectPlan(tokenData.userId, planId);

        if (result.success) {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: {
              user: result.user,
              message: 'Plan selected successfully. Waiting for admin approval.'
            }
          }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: result.error
          }));
        }

      } else if (path === '/api/plans' && method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            plans: PLAN_TYPES
          }
        }));

      } else if (path === '/api/auth/config' && method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            firebase: {
              apiKey: "demo-key",
              authDomain: "demo.firebaseapp.com",
              projectId: "demo"
            },
            authMethods: {
              email: true,
              google: true,
              phone: true
            }
          }
        }));

      } else if (path === '/api/admin/login' && method === 'POST') {
        const { email, password } = data;

        if (!email || !password) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Email and password are required'
          }));
          return;
        }

        const admin = AdminDatabase.getAdminByEmail(email);
        if (!admin || admin.password !== password) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid admin credentials'
          }));
          return;
        }

        // Generate admin token
        const token = `admin_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        tokens.set(token, {
          adminId: admin.id,
          email: admin.email,
          role: admin.role,
          createdAt: Date.now()
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            admin: {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role
            },
            token,
            refreshToken: token + '_refresh'
          }
        }));

      } else if (path === '/api/admin/approvals' && method === 'GET') {
        // Verify admin token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Admin authorization required'
          }));
          return;
        }

        const token = authHeader.substring(7);
        const tokenData = tokens.get(token);

        if (!tokenData || !tokenData.adminId) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid admin token'
          }));
          return;
        }

        const approvals = AdminDatabase.getAllApprovals();
        const users = UserDatabase.getAllUsers();

        // Enrich approvals with user data
        const enrichedApprovals = approvals.map(approval => {
          const user = users.find(u => u.id === approval.userId);
          return {
            ...approval,
            planDetails: PLAN_TYPES[approval.planRequested.toUpperCase()]
          };
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          data: {
            approvals: enrichedApprovals,
            stats: {
              pending: approvals.filter(a => a.status === 'pending').length,
              approved: approvals.filter(a => a.status === 'approved').length,
              rejected: approvals.filter(a => a.status === 'rejected').length
            }
          }
        }));

      } else if (path === '/api/admin/approve' && method === 'POST') {
        // Verify admin token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Admin authorization required'
          }));
          return;
        }

        const token = authHeader.substring(7);
        const tokenData = tokens.get(token);

        if (!tokenData || !tokenData.adminId) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid admin token'
          }));
          return;
        }

        const { approvalId, notes } = data;
        if (!approvalId) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Approval ID required'
          }));
          return;
        }

        const result = AdminDatabase.approveUser(approvalId, tokenData.adminId, notes);

        if (result.success) {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: result.approval,
            message: 'User approved successfully'
          }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: result.error
          }));
        }

      } else if (path === '/api/admin/reject' && method === 'POST') {
        // Verify admin token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Admin authorization required'
          }));
          return;
        }

        const token = authHeader.substring(7);
        const tokenData = tokens.get(token);

        if (!tokenData || !tokenData.adminId) {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid admin token'
          }));
          return;
        }

        const { approvalId, notes } = data;
        if (!approvalId) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: 'Approval ID required'
          }));
          return;
        }

        const result = AdminDatabase.rejectUser(approvalId, tokenData.adminId, notes);

        if (result.success) {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            data: result.approval,
            message: 'User rejected successfully'
          }));
        } else {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            error: result.error
          }));
        }

      } else if (path.startsWith('/downloads/') && method === 'GET') {
        // Serve download files
        const fs = require('fs');
        const path_module = require('path');

        const fileName = path.substring(11); // Remove '/downloads/' prefix
        const filePath = path_module.join(__dirname, '..', 'frontend', 'public', 'downloads', fileName);

        try {
          if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath);

            // Set appropriate headers for download
            res.writeHead(200, {
              'Content-Type': 'application/octet-stream',
              'Content-Disposition': `attachment; filename="${fileName}"`,
              'Content-Length': fileContent.length
            });
            res.end(fileContent);
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({
              success: false,
              error: 'Download file not found'
            }));
          }
        } catch (error) {
          res.writeHead(500);
          res.end(JSON.stringify({
            success: false,
            error: 'Failed to serve download file'
          }));
        }

      } else if (path === '/api/health' && method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Server is running!',
          timestamp: new Date().toISOString(),
          users: users.size,
          tokens: tokens.size
        }));

      } else {
        // 404 Not Found
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: 'Endpoint not found',
          path,
          method
        }));
      }

    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }));
    }
  });
}

// Create and start server
const server = http.createServer(handleRequest);
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log('\n🚀 REHBAR AI BACKEND SERVER STARTED!');
  console.log('='.repeat(50));
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
  console.log('🔧 AVAILABLE ENDPOINTS:');
  console.log('   GET  / - Server info');
  console.log('   POST /api/auth/register - Register new user');
  console.log('   POST /api/auth/login - Login user');
  console.log('   POST /api/auth/google - Google authentication');
  console.log('   POST /api/auth/phone - Phone authentication');
  console.log('   POST /api/auth/validate - Validate token');
  console.log('   GET  /api/auth/config - Get auth config');
  console.log('   GET  /api/user/dashboard - User dashboard data');
  console.log('   POST /api/user/select-plan - Select pricing plan');
  console.log('   GET  /api/plans - Get available plans');
  console.log('   POST /api/admin/login - Admin login');
  console.log('   GET  /api/admin/approvals - Get pending approvals');
  console.log('   POST /api/admin/approve - Approve user plan');
  console.log('   POST /api/admin/reject - Reject user plan');
  console.log('   GET  /downloads/* - Download files');
  console.log('   GET  /api/health - Health check');
  console.log('='.repeat(50));
  console.log('✅ CHROME EXTENSION CAN NOW AUTHENTICATE!');
  console.log('🎯 READY FOR TESTING!');
  console.log('='.repeat(50));
  console.log('');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
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
