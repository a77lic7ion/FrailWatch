export type CheckInStatus = 'ok' | 'not_ok' | 'overdue' | 'awaiting';

export interface Resident {
  id: string;
  name: string;
  room: string;
  wing: string;
  phone: string;
  deviceLinked: boolean;
  status: CheckInStatus;
  checkInTime?: string;
  notes?: string;
  medicalAlerts?: string[];
  caregiver: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    notifyOnIssue: boolean;
  };
  sevenDayHistory: {
    date: string;
    day: string;
    status: CheckInStatus;
    time?: string;
  }[];
}

export interface CareHome {
  id: string;
  name: string;
  location: string;
  totalResidents: number;
  cutoffTime: string; // e.g. "09:15"
  careStaffOnDuty: number;
  primaryNurse: string;
  providerPartner: string; // e.g. "4tify Security & Care Network"
}

export type ActiveTab = 'dashboard' | 'resident-phone' | 'family-provider' | 'comparison';
