// Rehbar AI - Complete User Database System
// Handles users, plans, admin approvals, and user states

const fs = require('fs');
const path = require('path');

// Database file paths
const DB_DIR = path.join(__dirname, 'data');
const USERS_DB = path.join(DB_DIR, 'users.json');
const PLANS_DB = path.join(DB_DIR, 'plans.json');
const APPROVALS_DB = path.join(DB_DIR, 'approvals.json');
const ADMIN_DB = path.join(DB_DIR, 'admins.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// User States
const USER_STATES = {
  REGISTERED: 'registered',           // Just signed up
  PLAN_SELECTED: 'plan_selected',     // Selected a plan
  PENDING_APPROVAL: 'pending_approval', // Waiting for admin approval
  APPROVED: 'approved',               // Admin approved
  ACTIVE: 'active',                   // Using the system
  SUSPENDED: 'suspended',             // Temporarily suspended
  REJECTED: 'rejected'                // Plan rejected
};

// Plan Types
const PLAN_TYPES = {
  FREE: {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    duration: '3 days',
    features: [
      'Chrome Extension Access',
      'Basic AI Suggestions',
      'Google Meet Support',
      'Limited Voice Recognition'
    ],
    limits: {
      meetingsPerDay: 3,
      voiceMinutesPerDay: 30,
      aiSuggestionsPerDay: 50
    }
  },
  PRO: {
    id: 'pro',
    name: 'Professional',
    price: 29,
    duration: 'monthly',
    features: [
      'All Free Features',
      'Advanced AI Suggestions',
      'All Meeting Platforms',
      'Unlimited Voice Recognition',
      'Desktop App Access',
      'Priority Support'
    ],
    limits: {
      meetingsPerDay: 'unlimited',
      voiceMinutesPerDay: 'unlimited',
      aiSuggestionsPerDay: 'unlimited'
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium Enterprise',
    price: 99,
    duration: 'monthly',
    features: [
      'All Pro Features',
      'Custom AI Training',
      'Team Management',
      'Analytics Dashboard',
      'API Access',
      'White-label Options',
      'Dedicated Support'
    ],
    limits: {
      meetingsPerDay: 'unlimited',
      voiceMinutesPerDay: 'unlimited',
      aiSuggestionsPerDay: 'unlimited',
      teamMembers: 'unlimited'
    }
  }
};

// Initialize database files
function initializeDatabase() {
  // Initialize users database
  if (!fs.existsSync(USERS_DB)) {
    fs.writeFileSync(USERS_DB, JSON.stringify([], null, 2));
  }
  
  // Initialize plans database
  if (!fs.existsSync(PLANS_DB)) {
    fs.writeFileSync(PLANS_DB, JSON.stringify(PLAN_TYPES, null, 2));
  }
  
  // Initialize approvals database
  if (!fs.existsSync(APPROVALS_DB)) {
    fs.writeFileSync(APPROVALS_DB, JSON.stringify([], null, 2));
  }
  
  // Initialize admin database with default admin
  if (!fs.existsSync(ADMIN_DB)) {
    const defaultAdmins = [
      {
        id: 'admin_1',
        email: 'admin@rehbar.ai',
        password: 'admin123', // In production, this should be hashed
        name: 'System Administrator',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];
    fs.writeFileSync(ADMIN_DB, JSON.stringify(defaultAdmins, null, 2));
  }
  
  console.log('✅ Database initialized successfully');
}

// User Management Functions
class UserDatabase {
  static getAllUsers() {
    try {
      const data = fs.readFileSync(USERS_DB, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users database:', error);
      return [];
    }
  }
  
  static saveUsers(users) {
    try {
      fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving users database:', error);
      return false;
    }
  }
  
  static createUser(userData) {
    const users = this.getAllUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      displayName: userData.displayName,
      provider: userData.provider || 'email',
      state: USER_STATES.REGISTERED,
      plan: null,
      planRequestedAt: null,
      approvedAt: null,
      approvedBy: null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      usage: {
        meetingsToday: 0,
        voiceMinutesToday: 0,
        aiSuggestionsToday: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      }
    };
    
    users.push(newUser);
    
    if (this.saveUsers(users)) {
      return { success: true, user: newUser };
    } else {
      return { success: false, error: 'Failed to save user' };
    }
  }
  
  static getUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(u => u.email === email);
  }
  
  static getUserById(id) {
    const users = this.getAllUsers();
    return users.find(u => u.id === id);
  }
  
  static updateUser(userId, updates) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }
    
    users[userIndex] = { ...users[userIndex], ...updates };
    
    if (this.saveUsers(users)) {
      return { success: true, user: users[userIndex] };
    } else {
      return { success: false, error: 'Failed to update user' };
    }
  }
  
  static selectPlan(userId, planId) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }
    
    if (!PLAN_TYPES[planId.toUpperCase()]) {
      return { success: false, error: 'Invalid plan' };
    }
    
    users[userIndex].plan = planId.toLowerCase();
    users[userIndex].state = USER_STATES.PENDING_APPROVAL;
    users[userIndex].planRequestedAt = new Date().toISOString();
    
    // Create approval request
    this.createApprovalRequest(users[userIndex]);
    
    if (this.saveUsers(users)) {
      return { success: true, user: users[userIndex] };
    } else {
      return { success: false, error: 'Failed to update user plan' };
    }
  }
  
  static createApprovalRequest(user) {
    try {
      const approvals = JSON.parse(fs.readFileSync(APPROVALS_DB, 'utf8'));
      
      const newApproval = {
        id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        userEmail: user.email,
        userName: user.displayName,
        planRequested: user.plan,
        requestedAt: user.planRequestedAt,
        status: 'pending',
        approvedBy: null,
        approvedAt: null,
        notes: ''
      };
      
      approvals.push(newApproval);
      fs.writeFileSync(APPROVALS_DB, JSON.stringify(approvals, null, 2));
      
      return { success: true, approval: newApproval };
    } catch (error) {
      console.error('Error creating approval request:', error);
      return { success: false, error: 'Failed to create approval request' };
    }
  }
  
  static getUsersByState(state) {
    const users = this.getAllUsers();
    return users.filter(u => u.state === state);
  }
  
  static resetDailyUsage(userId) {
    const today = new Date().toISOString().split('T')[0];
    const updates = {
      usage: {
        meetingsToday: 0,
        voiceMinutesToday: 0,
        aiSuggestionsToday: 0,
        lastResetDate: today
      }
    };
    
    return this.updateUser(userId, updates);
  }
}

// Admin Management Functions
class AdminDatabase {
  static getAllAdmins() {
    try {
      const data = fs.readFileSync(ADMIN_DB, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading admin database:', error);
      return [];
    }
  }
  
  static getAdminByEmail(email) {
    const admins = this.getAllAdmins();
    return admins.find(a => a.email === email);
  }
  
  static getAllApprovals() {
    try {
      const data = fs.readFileSync(APPROVALS_DB, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading approvals database:', error);
      return [];
    }
  }
  
  static approveUser(approvalId, adminId, notes = '') {
    try {
      const approvals = this.getAllApprovals();
      const approvalIndex = approvals.findIndex(a => a.id === approvalId);
      
      if (approvalIndex === -1) {
        return { success: false, error: 'Approval request not found' };
      }
      
      const approval = approvals[approvalIndex];
      
      // Update approval
      approvals[approvalIndex].status = 'approved';
      approvals[approvalIndex].approvedBy = adminId;
      approvals[approvalIndex].approvedAt = new Date().toISOString();
      approvals[approvalIndex].notes = notes;
      
      // Update user
      const userUpdate = UserDatabase.updateUser(approval.userId, {
        state: USER_STATES.APPROVED,
        approvedAt: new Date().toISOString(),
        approvedBy: adminId
      });
      
      if (userUpdate.success) {
        fs.writeFileSync(APPROVALS_DB, JSON.stringify(approvals, null, 2));
        return { success: true, approval: approvals[approvalIndex] };
      } else {
        return { success: false, error: 'Failed to update user' };
      }
    } catch (error) {
      console.error('Error approving user:', error);
      return { success: false, error: 'Failed to approve user' };
    }
  }
  
  static rejectUser(approvalId, adminId, notes = '') {
    try {
      const approvals = this.getAllApprovals();
      const approvalIndex = approvals.findIndex(a => a.id === approvalId);
      
      if (approvalIndex === -1) {
        return { success: false, error: 'Approval request not found' };
      }
      
      const approval = approvals[approvalIndex];
      
      // Update approval
      approvals[approvalIndex].status = 'rejected';
      approvals[approvalIndex].approvedBy = adminId;
      approvals[approvalIndex].approvedAt = new Date().toISOString();
      approvals[approvalIndex].notes = notes;
      
      // Update user
      const userUpdate = UserDatabase.updateUser(approval.userId, {
        state: USER_STATES.REJECTED,
        plan: null
      });
      
      if (userUpdate.success) {
        fs.writeFileSync(APPROVALS_DB, JSON.stringify(approvals, null, 2));
        return { success: true, approval: approvals[approvalIndex] };
      } else {
        return { success: false, error: 'Failed to update user' };
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      return { success: false, error: 'Failed to reject user' };
    }
  }
}

// Initialize database on module load
initializeDatabase();

module.exports = {
  UserDatabase,
  AdminDatabase,
  USER_STATES,
  PLAN_TYPES,
  initializeDatabase
};
