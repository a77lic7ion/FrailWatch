import { CareHome, Resident } from '../types';

// Default facility definitions for care administration (no mock residents)
export const INITIAL_HOMES: CareHome[] = [
  {
    id: 'home-benoni-01',
    name: 'Benoni Frail Care & Assisted Living',
    location: 'Willow Lane, Benoni',
    totalResidents: 0,
    cutoffTime: '09:15',
    careStaffOnDuty: 4,
    primaryNurse: 'Sr. Sarah Botha, RN',
    providerPartner: '4TIFY SECURITY & Care Solutions',
  },
  {
    id: 'home-stjude-02',
    name: 'St. Jude Senior Manor',
    location: 'Highland Ridge, Bryanston',
    totalResidents: 0,
    cutoffTime: '09:00',
    careStaffOnDuty: 3,
    primaryNurse: 'Sr. Thandi Ndlovu',
    providerPartner: '4TIFY SECURITY & Care Solutions',
  }
];

// All mock residents stripped. The database starts clean.
// Real residents are added through the Admin interface and stored directly in Firebase Firestore.
export const INITIAL_RESIDENTS: Resident[] = [];
