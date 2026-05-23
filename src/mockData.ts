import { InsuranceCase } from './types';

export const mockCases: InsuranceCase[] = [
  {
    id: 'case-1',
    customerName: 'Rajesh Kumar',
    mobile: '9876543210',
    insuranceType: 'motor',
    vehicleType: 'private',
    vehicleNumber: 'DL-3C-AQ-1234',
    vehicleModel: 'Maruti Suzuki Swift',
    policyNumber: 'MOT-8890214',
    companyName: 'HDFC Ergo General Insurance',
    motorPolicySubtype: 'package',
    commissionPayoutOn: 'od',
    odPremium: 10000,
    tpPremium: 8500,
    netPremium: 18500,
    premiumAmount: 18500, // net premium (OD + TP)
    gstPercent: 18,
    totalAmountWithGst: 21830, // 18500 * 1.18
    companyPct: 18, // 18% payout
    myPct: 5, // advisor's share % from OD
    agentPct: 13, // sub-agent's share % from OD
    totalCommissionReceived: 1800, // 10000 * 0.18 (calculated on OD premium because private car has OD payout)
    myCommissionAmount: 500, // 10000 * 0.05
    agentCommissionAmount: 1300, // 10000 * 0.13
    policyDate: '2025-06-12', // Expires 2026-06-12 (approaching in 20 days)
    remarks: 'Swift VXI Comprehensive Insurance package',
    status: 'active',
    agentPaymentStatus: 'unpaid'
  },
  {
    id: 'case-2',
    customerName: 'Amit Sharma',
    mobile: '9812345678',
    insuranceType: 'life',
    policyCategory: 'Term Endowment Plan',
    policyNumber: 'LIC-55431029',
    companyName: 'LIC of India',
    premiumAmount: 25000,
    gstPercent: 4.5,
    totalAmountWithGst: 26125,
    companyPct: 25,
    myPct: 25,
    agentPct: 0,
    totalCommissionReceived: 6250, // 25000 * 0.25
    myCommissionAmount: 6250,
    agentCommissionAmount: 0,
    policyDate: '2026-01-15', // Issued Jan 2026, active
    remarks: '20 Years Term Plan with Double Accident Benefit',
    status: 'active',
    agentPaymentStatus: 'paid'
  },
  {
    id: 'case-3',
    customerName: 'Sunita Singh',
    mobile: '8899001122',
    insuranceType: 'health',
    policyCategory: 'Family Floater Plan',
    policyNumber: 'HEA-9908123',
    companyName: 'Star Health & Allied Insurance',
    premiumAmount: 14000,
    gstPercent: 18,
    totalAmountWithGst: 16520,
    companyPct: 15,
    myPct: 3,
    agentPct: 12,
    totalCommissionReceived: 2100, // 14000 * 0.15
    myCommissionAmount: 420, // 14000 * 0.03
    agentCommissionAmount: 1680, // 14000 * 0.12
    policyDate: '2025-05-28', // Expires 2026-05-28 (approaching in 5 days, highly urgent!)
    remarks: 'Star Comprehensive Family Floater 5 Lakhs cover',
    status: 'active',
    agentPaymentStatus: 'unpaid'
  },
  {
    id: 'case-4',
    customerName: 'Vikram Rathore',
    mobile: '7766554433',
    insuranceType: 'motor',
    vehicleType: 'commercial',
    vehicleNumber: 'HR-55-S-9080',
    vehicleModel: 'Mahindra Bolero',
    policyNumber: 'MOT-7731298',
    companyName: 'ICICI Lombard',
    motorPolicySubtype: 'third-party',
    commissionPayoutOn: 'net',
    odPremium: 0,
    tpPremium: 42000,
    netPremium: 42000,
    premiumAmount: 42000,
    gstPercent: 18,
    totalAmountWithGst: 49560,
    companyPct: 10,
    myPct: 2,
    agentPct: 8,
    totalCommissionReceived: 4200, // 42000 * 0.10 (calculated on net premium since it is commercial vehicle)
    myCommissionAmount: 840, // 42000 * 0.02
    agentCommissionAmount: 3360, // 42000 * 0.08
    policyDate: '2025-05-18', // Expires 2026-05-18 (already expired/lapsed by 5 days)
    remarks: 'Commercial Bolero Goods Carrier TP cover',
    status: 'active',
    agentPaymentStatus: 'paid'
  }
];
