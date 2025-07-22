import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Eye,
  MessageSquare,
  RefreshCw,
  Filter,
  LogOut,
  BarChart3,
  Settings
} from 'lucide-react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { adminService, adminRealtimeService, AdminStats } from '../services/adminFirestore';
import { UserProfile, PlanApproval, userProfileService } from '../services/firestore';

interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
}

const AdminPanel: React.FC = () => {
  const [approvals, setApprovals] = useState<PlanApproval[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({ pending: 0, approved: 0, rejected: 0 });
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'analytics' | 'downloads'>('approvals');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'registered' | 'approved' | 'active' | 'rejected'>('all');
  const [selectedApproval, setSelectedApproval] = useState<PlanApproval | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Clear any local storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminInfo');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force redirect even if signOut fails
      window.location.href = '/auth';
    }
  };

  useEffect(() => {
    console.log('🔧 AdminPanel: Setting up auth state listener...');

    // Wait for auth state to be ready
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔐 AdminPanel: Auth state changed:', currentUser ? currentUser.uid : 'No user');

      if (!currentUser) {
        console.log('❌ AdminPanel: No authenticated user, redirecting to admin login');
        window.location.href = '/admin/login';
        return;
      }

      // Check if user is admin
      try {
        console.log('🔍 AdminPanel: Checking admin privileges for:', currentUser.uid);
        const userProfile = await userProfileService.getUserProfile(currentUser.uid);
        console.log('📋 AdminPanel: User profile:', userProfile);

        if (!userProfile || !userProfile.isAdmin) {
          console.log('❌ AdminPanel: User is not admin, redirecting to login');
          alert('Access denied. Admin privileges required.');
          window.location.href = '/auth';
          return;
        }

        console.log('✅ AdminPanel: Admin privileges confirmed, loading data...');
        // Now fetch data since we know user is authenticated and admin
        await fetchData();

      } catch (error) {
        console.error('❌ AdminPanel: Error checking admin privileges:', error);
        window.location.href = '/admin/login';
        return;
      }
    });

    // Set up real-time listeners
    const unsubscribeApprovals = adminRealtimeService.subscribeToPendingApprovals(
      (pendingApprovals) => {
        setApprovals(pendingApprovals);
        updateStats(pendingApprovals);
      }
    );

    const unsubscribeUsers = adminRealtimeService.subscribeToUsers(
      (allUsers) => {
        setUsers(allUsers);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeApprovals();
      unsubscribeUsers();
    };
  }, []);

  const fetchData = async () => {
    try {
      console.log('📊 AdminPanel: Fetching admin data...');

      // Fetch all data (auth check already done in useEffect)
      const [allApprovals, allUsers, adminStatsData] = await Promise.all([
        adminService.getAllPlanApprovals(),
        adminService.getAllUsers(),
        adminService.getAdminStats()
      ]);

      setApprovals(allApprovals);
      setUsers(allUsers);
      setAdminStats(adminStatsData);
      updateStats(allApprovals);

    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (approvalsList: PlanApproval[]) => {
    const pending = approvalsList.filter(a => a.status === 'pending').length;
    const approved = approvalsList.filter(a => a.status === 'approved').length;
    const rejected = approvalsList.filter(a => a.status === 'rejected').length;

    setStats({ pending, approved, rejected });
  };

  const handleApproval = async (approvalId: string, action: 'approve' | 'reject') => {
    setProcessing(approvalId);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      console.log(`🔄 AdminPanel: Starting ${action} for approval:`, approvalId);
      console.log('🔄 AdminPanel: Current user UID:', currentUser.uid);
      console.log('🔄 AdminPanel: Notes:', notes);

      if (action === 'approve') {
        console.log('✅ AdminPanel: Calling approveUser...');
        await adminService.approveUser(approvalId, currentUser.uid, notes);
        console.log('✅ AdminPanel: approveUser completed');
      } else {
        console.log('❌ AdminPanel: Calling rejectUser...');
        await adminService.rejectUser(approvalId, currentUser.uid, notes);
        console.log('❌ AdminPanel: rejectUser completed');
      }

      console.log('🔄 AdminPanel: Refreshing data...');
      // Refresh data
      await fetchData();
      setSelectedApproval(null);
      setNotes('');

      // Show success message
      console.log(`✅ AdminPanel: ${action} completed successfully`);
      alert(`User ${action}d successfully!`);

    } catch (err: any) {
      console.error(`❌ AdminPanel: Error ${action}ing user:`, err);
      console.error('❌ AdminPanel: Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      setError(`Failed to ${action} user: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  // User CRUD Operations
  const handleEditUser = (user: UserProfile) => {
    setEditingUser({ ...user });
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    setEditingUser({
      id: '',
      uid: '',
      email: '',
      displayName: '',
      state: 'registered',
      isAdmin: false,
      usage: {
        meetingsToday: 0,
        voiceMinutesToday: 0,
        aiSuggestionsToday: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        totalMeetings: 0,
        totalVoiceMinutes: 0,
        totalAiSuggestions: 0
      },
      createdAt: null,
      updatedAt: null,
      lastLogin: null
    } as UserProfile);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    setProcessing(editingUser.id || 'new');
    try {
      if (editingUser.id) {
        // Update existing user
        await userProfileService.updateUserProfile(editingUser.uid, {
          email: editingUser.email,
          displayName: editingUser.displayName,
          state: editingUser.state,
          isAdmin: editingUser.isAdmin,
          plan: editingUser.plan,
          profilePicture: editingUser.profilePicture,
          phoneNumber: editingUser.phoneNumber
        });
        alert('User updated successfully!');
      } else {
        // Create new user (this would typically be done through Firebase Auth)
        alert('Creating users directly is not supported. Users must register through the app.');
      }

      setShowUserModal(false);
      setEditingUser(null);
      await fetchData();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setProcessing(userId);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      console.log('🗑️ AdminPanel: Deleting user:', userId);
      await adminService.deleteUser(userId, currentUser.uid);
      console.log('✅ AdminPanel: User deleted successfully');

      alert('User deleted successfully!');
      setShowDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      console.error('❌ AdminPanel: Error deleting user:', err);
      setError(`Failed to delete user: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateUserState = async (userId: string, newState: UserProfile['state']) => {
    setProcessing(userId);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      console.log('🔄 AdminPanel: Updating user state:', userId, 'to', newState);
      await adminService.updateUserState(userId, newState, currentUser.uid);
      console.log('✅ AdminPanel: User state updated successfully');

      alert(`User state updated to ${newState} successfully!`);
      await fetchData();
    } catch (err: any) {
      console.error('❌ AdminPanel: Error updating user state:', err);
      setError(`Failed to update user state: ${err.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.state === userFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredApprovals = approvals.filter(approval => 
    filter === 'all' || approval.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Manage user plan approvals</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-lg shadow-md p-4 mb-6"
        >
          <div className="flex space-x-1">
            {[
              { id: 'approvals', label: 'Plan Approvals', icon: CheckCircle },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'downloads', label: 'Downloads', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending + stats.approved + stats.rejected}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-4 mb-6"
        >
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex space-x-2">
              {['all', 'pending', 'approved', 'rejected'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'approvals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Plan Approval Requests ({filteredApprovals.length})
            </h2>
          </div>

          {filteredApprovals.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No approval requests found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApprovals.map((approval) => (
                <div key={approval.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {approval.userName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
                          {getStatusIcon(approval.status)}
                          <span className="ml-1">{approval.status}</span>
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Email:</strong> {approval.userEmail}</p>
                        <p><strong>Plan:</strong> {approval.planDetails.name} (${approval.planDetails.price}/{approval.planDetails.duration})</p>
                        <p><strong>Requested:</strong> {new Date(approval.requestedAt).toLocaleString()}</p>
                        {approval.approvedAt && (
                          <p><strong>Processed:</strong> {new Date(approval.approvedAt).toLocaleString()}</p>
                        )}
                        {approval.notes && (
                          <p><strong>Notes:</strong> {approval.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedApproval(approval)}
                        className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>

                      {approval.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproval(approval.id, 'approve')}
                            disabled={processing === approval.id}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          
                          <button
                            onClick={() => handleApproval(approval.id, 'reject')}
                            disabled={processing === approval.id}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </motion.div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* User Search and Filter */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search users by email or name..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="registered">Registered</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={handleCreateUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Users ({filteredUsers.length})
                </h2>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.profilePicture ? (
                                <img className="h-10 w-10 rounded-full" src={user.profilePicture} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-gray-600" />
                                </div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                {user.phoneNumber && (
                                  <div className="text-xs text-gray-400">{user.phoneNumber}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.state)}`}>
                              {getStatusIcon(user.state)}
                              <span className="ml-1">{user.state}</span>
                            </span>
                            {user.isAdmin && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Admin
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.plan || 'No plan'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h2>
            <p className="text-gray-600">Analytics features coming soon...</p>
          </motion.div>
        )}

        {/* Downloads Tab */}
        {activeTab === 'downloads' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Download Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chrome Extension */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Chrome Extension</h3>
                    <p className="text-sm text-gray-600">AI-powered meeting copilot</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">~2.5 MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">✅ Available</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/downloads/rehbar-ai-extension.zip';
                      link.download = 'rehbar-ai-extension.zip';
                      link.click();
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download Extension
                  </button>
                  <button
                    onClick={() => window.open('/chrome-extension/README.md', '_blank')}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Documentation
                  </button>
                </div>
              </div>

              {/* Desktop App */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Desktop App</h3>
                    <p className="text-sm text-gray-600">Cross-platform desktop application</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">~50 MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">✅ Available</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/downloads/rehbar-ai-desktop.zip';
                      link.download = 'rehbar-ai-desktop.zip';
                      link.click();
                    }}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Download Desktop App
                  </button>
                  <button
                    onClick={() => alert('Desktop app documentation coming soon!')}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Documentation
                  </button>
                </div>
              </div>
            </div>

            {/* Download Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-4">Installation Instructions</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-blue-800 mb-2">Chrome Extension:</h5>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Download the extension ZIP file</li>
                    <li>Extract to a folder on your computer</li>
                    <li>Open Chrome → Settings → Extensions</li>
                    <li>Enable "Developer mode"</li>
                    <li>Click "Load unpacked" and select the folder</li>
                  </ol>
                </div>

                <div>
                  <h5 className="font-medium text-blue-800 mb-2">Desktop App:</h5>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Download the desktop app ZIP file</li>
                    <li>Extract to your preferred location</li>
                    <li>Run the executable file</li>
                    <li>Follow the setup wizard</li>
                    <li>Sign in with your account</li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Approval Modal */}
        {selectedApproval && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Process Approval Request
              </h3>
              
              <div className="space-y-3 mb-6">
                <p><strong>User:</strong> {selectedApproval.userName}</p>
                <p><strong>Email:</strong> {selectedApproval.userEmail}</p>
                <p><strong>Plan:</strong> {selectedApproval.planDetails.name}</p>
                <p><strong>Price:</strong> ${selectedApproval.planDetails.price}/{selectedApproval.planDetails.duration}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any notes about this approval..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleApproval(selectedApproval.id, 'approve')}
                  disabled={processing === selectedApproval.id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                
                <button
                  onClick={() => handleApproval(selectedApproval.id, 'reject')}
                  disabled={processing === selectedApproval.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
                
                <button
                  onClick={() => {
                    setSelectedApproval(null);
                    setNotes('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* User Edit Modal */}
        {showUserModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingUser.id ? 'Edit User' : 'Create User'}
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!!editingUser.id} // Can't change email for existing users
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editingUser.displayName}
                    onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editingUser.phoneNumber || ''}
                    onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingUser.state}
                    onChange={(e) => setEditingUser({...editingUser, state: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="registered">Registered</option>
                    <option value="plan_selected">Plan Selected</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <input
                    type="text"
                    value={editingUser.plan || ''}
                    onChange={(e) => setEditingUser({...editingUser, plan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., basic, pro, enterprise"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    checked={editingUser.isAdmin}
                    onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                    Admin privileges
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveUser}
                  disabled={processing === (editingUser.id || 'new')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing === (editingUser.id || 'new') ? 'Saving...' : 'Save'}
                </button>

                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Delete
              </h3>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  disabled={processing === showDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {processing === showDeleteConfirm ? 'Deleting...' : 'Delete'}
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
