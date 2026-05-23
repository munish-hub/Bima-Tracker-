export type InsuranceType = 'motor' | 'life' | 'health' | 'loan';

export interface User {
  mobile: string;
  pin: string;
  fullName: string;
  agencyName: string;
  avatar?: string;
}

export interface InsuranceCase {
  id: string;
  customerName: string;
  mobile: string;
  insuranceType: InsuranceType;
  
  // Specific Type metadata
  vehicleType?: 'private' | 'commercial'; // for motor
  policyCategory?: string; // for life, health, loan (e.g. "Term Insurance", "Family Floater", "Home Loan Booster")
  
  vehicleNumber?: string; // only for motor
  vehicleModel?: string; // e.g. "Audi A4", "Swift VXI", or others
  policyNumber: string;
  companyName: string;
  premiumAmount: number; // For non-motor: base. For motor: net premium
  
  // Motor Specific Premium fields
  motorPolicySubtype?: 'own-damage' | 'third-party' | 'package';
  commissionPayoutOn?: 'od' | 'tp' | 'net'; // payout going into Net premium, Own Damage, or Third Party
  odPremium?: number; // Own Damage Premium portion
  tpPremium?: number; // Third Party Premium portion
  netPremium?: number; // Net premium (odPremium + tpPremium) or equal to premiumAmount
  
  gstPercent: number; // typically 18%
  totalAmountWithGst: number;
  
  // Commission structure
  companyPct: number;       // total commission percentage company pays from premium (e.g. 18%)
  myPct: number;            // advisor's kept percentage from premium (e.g. 5%)
  agentPct: number;         // agent's share percentage from premium (e.g. 13%)
  
  // Computed values
  totalCommissionReceived: number; // Premium * companyPct / 100
  myCommissionAmount: number;      // Premium * myPct / 100
  agentCommissionAmount: number;   // Premium * agentPct / 100
  
  policyDate: string;
  remarks?: string;
  status: 'active' | 'pending' | 'lapsed';
  agentPaymentStatus?: 'paid' | 'unpaid';
}

export interface AppSettings {
  defaultGstPercent: number;
  defaultCompanyPct: number;
  currencySymbol: string;
  typeColors?: Record<InsuranceType, string>;
}
