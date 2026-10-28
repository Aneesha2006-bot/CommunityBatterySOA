/**
 * Centralized Business & Compliance Configuration (W-BIZ)
 * Governs all factual assertions, organization identities, and legal contact points.
 * Rule: Fail production build if placeholders remain in production mode.
 */

export type SiteMode = 'demo' | 'production';

export interface BusinessConfig {
  siteMode: SiteMode;
  organizationName: string;
  projectName: string;
  academicAffiliation: string;
  registrationNumber: string | null;
  registeredAddress: string | null;
  supportEmail: string;
  dpoEmail: string;
  grievanceOfficerName: string;
  grievanceOfficerEmail: string;
  batterySpecs: {
    totalCapacityKwh: number;
    initialChargeKwh: number;
    defaultReserveFloorKwh: number;
    defaultMemberDailyCapKwh: number;
    absoluteSafetyMarginKwh: number;
  };
  syntheticDisclaimer: string;
  legalDraftNotice: string;
}

export const BUSINESS_CONFIG: BusinessConfig = {
  siteMode: (import.meta.env.VITE_SITE_MODE as SiteMode) || 'demo',
  
  organizationName: 'Community Battery Research & Clean Energy Cooperative',
  projectName: 'Community Battery Reserve Priority System (SOA s10.t03)',
  academicAffiliation: 'Course SOA s10.t03 Demonstration Project',

  // Real business credentials: null in demo mode; must be filled before production
  registrationNumber: null, // e.g. "CIN-U40106DL2026PTC999999" (Unset in demo)
  registeredAddress: null,  // e.g. "Sector 62, Noida, Uttar Pradesh 201309, India" (Unset in demo)

  supportEmail: 'support@communitybattery.local',
  dpoEmail: 'dpo@communitybattery.local',
  grievanceOfficerName: 'Aditi Sharma (Designated DPDP Grievance Officer - Simulation)',
  grievanceOfficerEmail: 'grievance@communitybattery.local',

  batterySpecs: {
    totalCapacityKwh: 100.0,
    initialChargeKwh: 80.0,
    defaultReserveFloorKwh: 30.0,
    defaultMemberDailyCapKwh: 50.0,
    absoluteSafetyMarginKwh: 5.0,
  },

  syntheticDisclaimer:
    'SYNTHETIC DEMO ENVIRONMENT: All persons, grid telemetry, energy units (kWh), accounts, and transactions displayed on this platform are simulated for academic evaluation (SOA s10.t03). No live grid dispatch or financial payments occur.',
  
  legalDraftNotice:
    'DRAFT - REQUIRES REVIEW BY A QUALIFIED LAWYER BEFORE PRODUCTION USE: Designed to support compliance with India’s Digital Personal Data Protection (DPDP) Act 2023 and DPDP Rules 2025. This document does not constitute formal legal advice.',
};
