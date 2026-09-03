import { CareHome, Resident, CheckInStatus } from '../types';

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
  homes: CareHome[];
  residents: Resident[];
  source: 'firestore' | 'local_fallback';
  timestamp: string;
}

export const api = {
  async getStatus(): Promise<DatabaseStatus> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Could not fetch database health status:', e);
      return {
        status: 'error',
        firebaseInitialized: false,
        firebaseConnected: false,
        projectId: 'frailcare-checkin',
        clientEmail: 'firebase-adminsdk-fbsvc@frailcare-checkin.iam.gserviceaccount.com',
        residentCount: 0,
        error: String(e),
      };
    }
  },

  async getData(): Promise<AppDataResponse | null> {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('API getData fallback triggered:', e);
      return null;
    }
  },

  async recordCheckIn(residentId: string, status: CheckInStatus, checkInTime?: string): Promise<boolean> {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ residentId, status, checkInTime }),
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to send checkin to backend:', e);
      return false;
    }
  },

  async addResident(resident: Partial<Resident>): Promise<boolean> {
    try {
      const res = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resident),
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to add resident to backend:', e);
      return false;
    }
  },

  async updateResident(id: string, updates: Partial<Resident>): Promise<boolean> {
    try {
      const res = await fetch(`/api/residents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`/api/residents/${id}`, {
        method: 'DELETE',
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
        headers: { 'Content-Type': 'application/json' },
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
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to reset demo data:', e);
      return false;
    }
  },
};
