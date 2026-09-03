import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app, db } from '../firebase';
export const auth = getAuth(app);

export interface DatabaseStatus {
  status: string;
  firebaseInitialized: boolean;
  firebaseConnected: boolean;
  projectId: string;
  clientEmail: string;
  residentCount: number;
  error?: string | null;
}

export interface AppDataResponse {
  homes: any[];
  residents: any[];
  source: 'firestore' | 'local_fallback';
  timestamp: string;
}

let staffSession: { uid: string; email?: string; role?: string; homeId?: string } | null = null;

export function setStaffSession(s: { uid: string; email?: string; role?: string; homeId?: string } | null) {
  staffSession = s;
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  async getStatus(): Promise<DatabaseStatus> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/health', { headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Could not fetch database health status:', e);
      return {
        status: 'error',
        firebaseInitialized: false,
        firebaseConnected: false,
        projectId: 'frailcare-checkin',
        clientEmail: 'firebase-adminsdk@frailcare-checkin.iam.gserviceaccount.com',
        residentCount: 0,
        error: String(e),
      };
    }
  },

  async getData(): Promise<AppDataResponse | null> {
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (staffSession?.homeId && staffSession.role !== 'superadmin' && staffSession.homeId !== '*') {
        params.set('homeId', staffSession.homeId);
      }
      const res = await fetch(`/api/data?${params.toString()}`, { headers });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('API getData fallback triggered:', e);
      return null;
    }
  },

  async recordCheckIn(residentId: string, status: string, checkInTime?: string): Promise<boolean> {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ residentId, status, checkInTime }),
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to send checkin to backend:', e);
      return false;
    }
  },

  async addResident(resident: any): Promise<{ success: boolean; resident?: any; verificationToken?: string; verificationUrl?: string }> {
    try {
      const res = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify(resident),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn('Failed to add resident to backend:', e);
      return { success: false };
    }
  },

  async getResidentProfile(idOrToken: string): Promise<{ resident?: any; home?: any } | null> {
    try {
      const res = await fetch(`/api/resident/${encodeURIComponent(idOrToken)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('Error fetching resident profile:', e);
      return null;
    }
  },

  async updateResident(id: string, updates: any): Promise<boolean> {
    try {
      const res = await fetch(`/api/residents/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to update resident:', e);
      return false;
    }
  },

  async deleteResident(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/residents/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { ...(await getAuthHeaders()) },
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to delete resident:', e);
      return false;
    }
  },

  async updateCutoff(homeId: string, cutoffTime: string): Promise<boolean> {
    try {
      const res = await fetch('/api/cutoff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({ homeId, cutoffTime }),
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to update cutoff:', e);
      return false;
    }
  },

  async resetDemo(): Promise<boolean> {
    try {
      const res = await fetch('/api/reset-demo', {
        method: 'POST',
        headers: { ...(await getAuthHeaders()) },
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to reset demo data:', e);
      return false;
    }
  },

  async createHome(payload: { id: string; name: string; location?: string; cutoffTime?: string; careStaffOnDuty?: number; primaryNurse?: string; providerPartner?: string }): Promise<any> {
    try {
      const res = await fetch('/api/homes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn('Failed to create home:', e);
      throw e;
    }
  },

  async updateHome(id: string, updates: any): Promise<boolean> {
    try {
      const res = await fetch(`/api/homes/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to update home:', e);
      return false;
    }
  },

  async deleteHome(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/homes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { ...(await getAuthHeaders()) },
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to delete home:', e);
      return false;
    }
  },

  async updateStaff(uid: string, updates: any): Promise<boolean> {
    try {
      const res = await fetch(`/api/staff/${encodeURIComponent(uid)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify(updates),
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to update staff:', e);
      return false;
    }
  },

  async deleteStaff(uid: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/staff/${encodeURIComponent(uid)}`, {
        method: 'DELETE',
        headers: { ...(await getAuthHeaders()) },
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to delete staff:', e);
      return false;
    }
  },
};
