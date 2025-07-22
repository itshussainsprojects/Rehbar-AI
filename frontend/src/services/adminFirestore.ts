// Admin Firestore Service for Admin Portal CRUD Operations
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProfile, PlanApproval, PlanDetails, ChatHistory } from './firestore';

// Admin-specific types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  totalRevenue: number;
  newUsersToday: number;
  plansDistribution: { [planName: string]: number };
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  userId?: string;
  action: string;
  timestamp: Timestamp;
  metadata?: any;
}

// Admin Service
export const adminService = {
  // User Management
  async getAllUsers(limitCount: number = 100): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  async getUsersByState(state: UserProfile['state']): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('state', '==', state),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
    } catch (error) {
      console.error('Error getting users by state:', error);
      throw error;
    }
  },

  async updateUserState(userId: string, state: UserProfile['state'], adminId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Update user state
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        state,
        updatedAt: serverTimestamp(),
        ...(state === 'approved' && { approvedAt: serverTimestamp() })
      });

      // Log the action
      const logRef = doc(collection(db, 'systemLogs'));
      batch.set(logRef, {
        level: 'info',
        message: `User state updated to ${state}`,
        userId,
        action: 'user_state_update',
        adminId,
        timestamp: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error updating user state:', error);
      throw error;
    }
  },

  async deleteUser(userId: string, adminId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete user
      const userRef = doc(db, 'users', userId);
      batch.delete(userRef);

      // Delete related data
      const userApprovals = await getDocs(query(
        collection(db, 'planApprovals'),
        where('userId', '==', userId)
      ));
      
      userApprovals.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Log the action
      const logRef = doc(collection(db, 'systemLogs'));
      batch.set(logRef, {
        level: 'warning',
        message: 'User deleted',
        userId,
        action: 'user_delete',
        adminId,
        timestamp: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Plan Approval Management
  async getAllPlanApprovals(): Promise<PlanApproval[]> {
    try {
      const q = query(
        collection(db, 'planApprovals'),
        orderBy('requestedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlanApproval));
    } catch (error) {
      console.error('Error getting plan approvals:', error);
      throw error;
    }
  },

  async getPendingApprovals(): Promise<PlanApproval[]> {
    try {
      const q = query(
        collection(db, 'planApprovals'),
        where('status', '==', 'pending'),
        orderBy('requestedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlanApproval));
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      throw error;
    }
  },

  async approveUser(approvalId: string, adminId: string, notes: string = ''): Promise<void> {
    try {
      console.log('🔄 AdminService: Starting approveUser...');
      console.log('📋 AdminService: Approval ID:', approvalId);
      console.log('👤 AdminService: Admin ID:', adminId);
      console.log('📝 AdminService: Notes:', notes);

      const batch = writeBatch(db);

      // Get approval document
      console.log('🔍 AdminService: Getting approval document...');
      const approvalRef = doc(db, 'planApprovals', approvalId);
      const approvalDoc = await getDoc(approvalRef);

      if (!approvalDoc.exists()) {
        console.error('❌ AdminService: Approval document not found');
        throw new Error('Approval not found');
      }

      const approval = approvalDoc.data() as PlanApproval;
      console.log('✅ AdminService: Approval document found:', approval);
      
      // Update approval status
      console.log('📝 AdminService: Updating approval status...');
      batch.update(approvalRef, {
        status: 'approved',
        approvedBy: adminId,
        approvedAt: serverTimestamp(),
        notes
      });

      // Update user state
      console.log('👤 AdminService: Updating user state...');
      const userRef = doc(db, 'users', approval.userId);
      batch.update(userRef, {
        state: 'approved',
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Log the action
      console.log('📊 AdminService: Creating system log...');
      const logRef = doc(collection(db, 'systemLogs'));
      batch.set(logRef, {
        level: 'info',
        message: `User approved for plan: ${approval.planDetails?.name || approval.planRequested}`,
        userId: approval.userId,
        action: 'user_approve',
        adminId,
        metadata: { planId: approval.planRequested, notes },
        timestamp: serverTimestamp()
      });

      console.log('💾 AdminService: Committing batch...');
      await batch.commit();
      console.log('✅ AdminService: User approved successfully');
    } catch (error: any) {
      console.error('❌ AdminService: Error approving user:', error);
      console.error('❌ AdminService: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  },

  async rejectUser(approvalId: string, adminId: string, notes: string = ''): Promise<void> {
    try {
      console.log('🔄 AdminService: Starting rejectUser...');
      console.log('📋 AdminService: Approval ID:', approvalId);
      console.log('👤 AdminService: Admin ID:', adminId);
      console.log('📝 AdminService: Notes:', notes);

      const batch = writeBatch(db);

      // Get approval document
      console.log('🔍 AdminService: Getting approval document...');
      const approvalRef = doc(db, 'planApprovals', approvalId);
      const approvalDoc = await getDoc(approvalRef);

      if (!approvalDoc.exists()) {
        console.error('❌ AdminService: Approval document not found');
        throw new Error('Approval not found');
      }

      const approval = approvalDoc.data() as PlanApproval;
      console.log('✅ AdminService: Approval document found:', approval);
      
      // Update approval status
      console.log('📝 AdminService: Updating approval status to rejected...');
      batch.update(approvalRef, {
        status: 'rejected',
        approvedBy: adminId,
        approvedAt: serverTimestamp(),
        notes
      });

      // Update user state
      console.log('👤 AdminService: Updating user state to rejected...');
      const userRef = doc(db, 'users', approval.userId);
      batch.update(userRef, {
        state: 'rejected',
        updatedAt: serverTimestamp()
      });

      // Log the action
      console.log('📊 AdminService: Creating system log...');
      const logRef = doc(collection(db, 'systemLogs'));
      batch.set(logRef, {
        level: 'warning',
        message: `User rejected for plan: ${approval.planDetails?.name || approval.planRequested}`,
        userId: approval.userId,
        action: 'user_reject',
        adminId,
        metadata: { planId: approval.planRequested, notes },
        timestamp: serverTimestamp()
      });

      console.log('💾 AdminService: Committing batch...');
      await batch.commit();
      console.log('✅ AdminService: User rejected successfully');
    } catch (error: any) {
      console.error('❌ AdminService: Error rejecting user:', error);
      console.error('❌ AdminService: Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  },

  // Plan Management
  async createPlan(planData: Omit<PlanDetails, 'id'>): Promise<string> {
    try {
      const planRef = await addDoc(collection(db, 'plans'), {
        ...planData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return planRef.id;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  },

  async updatePlan(planId: string, updates: Partial<PlanDetails>): Promise<void> {
    try {
      const planRef = doc(db, 'plans', planId);
      await updateDoc(planRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  },

  async deletePlan(planId: string): Promise<void> {
    try {
      const planRef = doc(db, 'plans', planId);
      await deleteDoc(planRef);
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  },

  // Analytics and Stats
  async getAdminStats(): Promise<AdminStats> {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => doc.data() as UserProfile);
      
      // Get pending approvals
      const pendingSnapshot = await getDocs(query(
        collection(db, 'planApprovals'),
        where('status', '==', 'pending')
      ));

      // Calculate stats
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.state === 'active' || user.state === 'approved').length;
      const pendingApprovals = pendingSnapshot.size;
      
      // Get today's new users
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = users.filter(user => {
        const createdAt = user.createdAt?.toDate();
        return createdAt && createdAt >= today;
      }).length;

      // Plans distribution
      const plansDistribution: { [planName: string]: number } = {};
      users.forEach(user => {
        if (user.planDetails?.name) {
          plansDistribution[user.planDetails.name] = (plansDistribution[user.planDetails.name] || 0) + 1;
        }
      });

      return {
        totalUsers,
        activeUsers,
        pendingApprovals,
        totalRevenue: 0, // TODO: Calculate from payments
        newUsersToday,
        plansDistribution
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting admin stats:', error);
      }
      throw error;
    }
  },

  // System Logs
  async getSystemLogs(limitCount: number = 100): Promise<SystemLog[]> {
    try {
      const q = query(
        collection(db, 'systemLogs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemLog));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting system logs:', error);
      }
      throw error;
    }
  },

  async addSystemLog(log: Omit<SystemLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, 'systemLogs'), {
        ...log,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding system log:', error);
      throw error;
    }
  }
};

// Real-time admin listeners
export const adminRealtimeService = {
  // Listen to pending approvals
  subscribeToPendingApprovals(callback: (approvals: PlanApproval[]) => void) {
    const q = query(
      collection(db, 'planApprovals'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const approvals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlanApproval));
      callback(approvals);
    });
  },

  // Listen to all users
  subscribeToUsers(callback: (users: UserProfile[]) => void) {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      callback(users);
    });
  },

  // Listen to system logs
  subscribeToSystemLogs(callback: (logs: SystemLog[]) => void) {
    const q = query(
      collection(db, 'systemLogs'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemLog));
      callback(logs);
    });
  }
};
