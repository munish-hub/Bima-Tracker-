import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Car, Heart, Coins, Percent, FileText, 
  Sparkles, Receipt, User, Phone, CheckCircle2
} from 'lucide-react';
import { InsuranceCase, InsuranceType } from '../types';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCase: Omit<InsuranceCase, 'id'> & { id?: string }) => void;
  defaultGstPercent: number;
  editingCase?: InsuranceCase | null;
}

export default function NewCaseModal({ isOpen, onClose, onSave, defaultGstPercent, editingCase }: NewCaseModalProps) {
  // Primary inputs
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('motor');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Specific Type fields
  const [vehicleType, setVehicleType] = useState<'private' | 'commercial'>('private');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [policyCategory, setPolicyCategory] = useState('');
  
  // Motor Specific policy subtype options and premiums
  const [motorPolicySubtype, setMotorPolicySubtype] = useState<'own-damage' | 'third-party' | 'package'>('package');
  const [commissionPayoutOn, setCommissionPayoutOn] = useState<'od' | 'tp' | 'net'>('od');
  const [odPremium, setOdPremium] = useState<number>(0);
  const [tpPremium, setTpPremium] = useState<number>(0);
  const [netPremium, setNetPremium] = useState<number>(0);

  // Suggestions list interaction state
  const [isCompanyFocused, setIsCompanyFocused] = useState(false);

  // Base details
  const [policyNumber, setPolicyNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [premiumAmount, setPremiumAmount] = useState<number>(0);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [policyDate, setPolicyDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [remarks, setRemarks] = useState('');
  const [agentPaymentStatus, setAgentPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
  
  // Commissions (Percentages)
  const [companyPct, setCompanyPct] = useState<number>(18);
  const [myPct, setMyPct] = useState<number>(5);
  const [agentPct, setAgentPct] = useState<number>(13);

  // Auto-calculated values
  const [totalAmountWithGst, setTotalAmountWithGst] = useState(0);
  const [totalCommissionReceived, setTotalCommissionReceived] = useState(0);
  const [myCommissionAmount, setMyCommissionAmount] = useState(0);
  const [agentCommissionAmount, setAgentCommissionAmount] = useState(0);

  // Quick select lists for Indian Insurance companies
  const companySuggestions = {
    motor: ['HDFC Ergo General', 'ICICI Lombard', 'Bajaj Allianz', 'Tata AIG General', 'SBI General', 'National Insurance'],
    life: ['LIC of India', 'HDFC Life Insurance', 'SBI Life Insurance', 'Max Life Insurance', 'ICICI Prudential'],
    health: ['Star Health & Allied', 'Niva Bupa Health', 'Care Health', 'Aditya Birla Health', 'HDFC Ergo Health'],
    loan: ['HDFC Bank Protection', 'SBI Life Loan Suraksha', 'ICICI Home Protect', 'Axis Loan Shield', 'LIC Loan Cover']
  };

  const defaultPolicyCategories = {
    life: ['Term Plan', 'Endowment Plan', 'Money Back Plan', 'ULIP Plan', 'Child Education Shield'],
    health: ['Family Floater', 'Individual Cover', 'Senior Citizen Plan', 'Critical Illness Guard', 'Group Health Cover'],
    loan: ['Home Loan Protection', 'Car Loan Shield', 'Business Loan Security', 'Personal Loan Protector']
  };

  const isPopulatingRef = React.useRef(false);

  useEffect(() => {
    if (isOpen) {
      if (editingCase) {
        isPopulatingRef.current = true;
        setInsuranceType(editingCase.insuranceType);
        setCustomerName(editingCase.customerName);
        setCustomerPhone(editingCase.mobile === 'N/A' ? '' : editingCase.mobile);
        setVehicleType(editingCase.vehicleType || 'private');
        setVehicleNumber(editingCase.vehicleNumber || '');
        setVehicleModel(editingCase.vehicleModel || '');
        setPolicyCategory(editingCase.policyCategory || '');
        setMotorPolicySubtype(editingCase.motorPolicySubtype || 'package');
        setCommissionPayoutOn(editingCase.commissionPayoutOn || 'od');
        setOdPremium(editingCase.odPremium || 0);
        setTpPremium(editingCase.tpPremium || 0);
        setNetPremium(editingCase.netPremium || 0);
        setPolicyNumber(editingCase.policyNumber);
        setCompanyName(editingCase.companyName);
        setPremiumAmount(editingCase.premiumAmount);
        setGstPercent(editingCase.gstPercent);
        setPolicyDate(editingCase.policyDate);
        setRemarks(editingCase.remarks || '');
        setAgentPaymentStatus(editingCase.agentPaymentStatus || 'unpaid');
        setCompanyPct(editingCase.companyPct);
        setMyPct(editingCase.myPct);
        setAgentPct(editingCase.agentPct);
        setTimeout(() => {
          isPopulatingRef.current = false;
        }, 50);
      } else {
        setInsuranceType('motor');
        setCustomerName('');
        setCustomerPhone('');
        setVehicleType('private');
        setVehicleNumber('');
        setVehicleModel('');
        setPolicyCategory('');
        setMotorPolicySubtype('package');
        setCommissionPayoutOn('od');
        setOdPremium(0);
        setTpPremium(0);
        setNetPremium(0);
        setPolicyNumber('');
        setCompanyName('');
        setPremiumAmount(0);
        setGstPercent(defaultGstPercent);
        setPolicyDate(() => {
          const today = new Date();
          return today.toISOString().split('T')[0];
        });
        setRemarks('');
        setAgentPaymentStatus('unpaid');
        setCompanyPct(12);
        setMyPct(4);
        setAgentPct(8);
      }
      setErrors({});
    }
  }, [isOpen, editingCase, defaultGstPercent]);

  // Switch commercial subtypes to package if own-damage is selected, as commercial vehicles do not utilize own-damage only policies
  useEffect(() => {
    if (isPopulatingRef.current) return;
    if (insuranceType === 'motor') {
      if (vehicleType === 'commercial' && motorPolicySubtype === 'own-damage') {
        setMotorPolicySubtype('third-party');
      }
    }
  }, [vehicleType, insuranceType, motorPolicySubtype]);

  // Synchronize default commission baseline allocation when subtype or vehicle type changes
  useEffect(() => {
    if (isPopulatingRef.current) return;
    if (insuranceType === 'motor') {
      if (motorPolicySubtype === 'own-damage') {
        setCommissionPayoutOn('od');
      } else if (motorPolicySubtype === 'third-party') {
        setCommissionPayoutOn('tp');
      } else { // package
        if (vehicleType === 'private') {
          setCommissionPayoutOn('od'); // default for private vehicles is Own Damage
        } else {
          setCommissionPayoutOn('net'); // default for commercial is Net Premium
        }
      }
    }
  }, [motorPolicySubtype, vehicleType, insuranceType]);

  // Reset category on type switch, apply smart defaults
  useEffect(() => {
    if (isPopulatingRef.current) return;
    if (insuranceType === 'motor') {
      setPolicyCategory('');
      setCompanyPct(12); // Total 12% default
      setMyPct(4);       // My share 4% default
      setAgentPct(8);    // Agent share 8% default
    } else if (insuranceType === 'life') {
      setPolicyCategory(defaultPolicyCategories.life[0]);
      setCompanyPct(25); // Total 25%
      setMyPct(25);      // My share 25%
      setAgentPct(0);    // Agent share 0%
    } else if (insuranceType === 'health') {
      setPolicyCategory(defaultPolicyCategories.health[0]);
      setCompanyPct(15); // Total 15%
      setMyPct(5);       // My share 5%
      setAgentPct(10);   // Agent share 10%
    } else if (insuranceType === 'loan') {
      setPolicyCategory(defaultPolicyCategories.loan[0]);
      setCompanyPct(8);  // Total 8%
      setMyPct(2);       // My share 2%
      setAgentPct(6);    // Agent share 6%
    }
  }, [insuranceType]);

  // Synchronize dynamic premium bindings when subtype or specific premiums change
  useEffect(() => {
    if (isPopulatingRef.current) return;
    if (insuranceType === 'motor') {
      const od = (motorPolicySubtype === 'own-damage' || motorPolicySubtype === 'package') ? Number(odPremium) : 0;
      const tp = (motorPolicySubtype === 'third-party' || motorPolicySubtype === 'package') ? Number(tpPremium) : 0;
      const combinedNet = od + tp;
      setNetPremium(combinedNet);
      setPremiumAmount(combinedNet);
    }
  }, [insuranceType, motorPolicySubtype, odPremium, tpPremium]);

  // Recalculating mathematical formulae dynamically on parameter change
  useEffect(() => {
    const premiumVal = Number(premiumAmount) || 0;
    const gstVal = Number(gstPercent) || 0;
    
    // total premium with GST calculation
    const calculatedGstAmt = premiumVal * (gstVal / 100);
    const calculatedTotalWithGst = premiumVal + calculatedGstAmt;
    setTotalAmountWithGst(Math.round(calculatedTotalWithGst * 100) / 100);

    // Identify baseline for commission distribution as specified by user
    let commBaseline = premiumVal;
    if (insuranceType === 'motor') {
      if (commissionPayoutOn === 'od') {
        commBaseline = Number(odPremium) || 0;
      } else if (commissionPayoutOn === 'tp') {
        commBaseline = Number(tpPremium) || 0;
      } else { // 'net'
        commBaseline = Number(netPremium) || 0;
      }
    }

    // brokerage paid by insurance company
    const totalCompanyComm = commBaseline * (Number(companyPct) / 100);
    setTotalCommissionReceived(Math.round(totalCompanyComm * 100) / 100);

    // how that commission is split between me (the advisor) and the sub-agent
    const myShareComm = commBaseline * (Number(myPct) / 100);
    setMyCommissionAmount(Math.round(myShareComm * 100) / 100);

    const agentShareComm = commBaseline * (Number(agentPct) / 100);
    setAgentCommissionAmount(Math.round(agentShareComm * 100) / 100);
  }, [insuranceType, vehicleType, motorPolicySubtype, commissionPayoutOn, odPremium, tpPremium, netPremium, premiumAmount, gstPercent, companyPct, myPct, agentPct]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.customerName = 'Customer name is required.';
    if (!policyNumber.trim()) newErrors.policyNumber = 'Policy number is required.';
    if (!companyName.trim()) newErrors.companyName = 'Company name is required.';
    
    if (insuranceType === 'motor') {
      if (!vehicleNumber.trim()) {
        newErrors.vehicleNumber = 'Vehicle number is required (e.g. DL-3C-AQ-1234)';
      }
      
      if (motorPolicySubtype === 'own-damage' && odPremium <= 0) {
        newErrors.premiumAmount = 'Please enter a valid Own Damage premium amount';
      } else if (motorPolicySubtype === 'third-party' && tpPremium <= 0) {
        newErrors.premiumAmount = 'Please enter a valid Third Party premium amount';
      } else if (motorPolicySubtype === 'package' && (odPremium <= 0 || tpPremium <= 0)) {
        newErrors.premiumAmount = 'Please enter both Own Damage and Third Party premium amounts for comprehensive package';
      }
    } else {
      if (premiumAmount <= 0) {
        newErrors.premiumAmount = 'Please enter a valid premium amount (> 0)';
      }
    }
    
    // Percentage split helper alert
    if (Math.abs(Number(myPct) + Number(agentPct) - Number(companyPct)) > 0.01) {
      newErrors.splitPercent = 'My kept percentage and Agent share percentage must add up to total Company Commission!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: editingCase ? editingCase.id : undefined,
      customerName: customerName.trim(),
      mobile: customerPhone.trim() || 'N/A',
      insuranceType,
      vehicleType: insuranceType === 'motor' ? vehicleType : undefined,
      policyCategory: insuranceType !== 'motor' ? policyCategory : undefined,
      vehicleNumber: insuranceType === 'motor' ? vehicleNumber.toUpperCase().trim() : undefined,
      vehicleModel: insuranceType === 'motor' ? vehicleModel.trim() : undefined,
      policyNumber: policyNumber.toUpperCase().trim(),
      companyName,
      premiumAmount: premiumAmount,
      motorPolicySubtype: insuranceType === 'motor' ? motorPolicySubtype : undefined,
      commissionPayoutOn: insuranceType === 'motor' ? commissionPayoutOn : undefined,
      odPremium: insuranceType === 'motor' ? odPremium : undefined,
      tpPremium: insuranceType === 'motor' ? tpPremium : undefined,
      netPremium: insuranceType === 'motor' ? netPremium : undefined,
      gstPercent,
      totalAmountWithGst,
      companyPct,
      myPct,
      agentPct,
      totalCommissionReceived,
      myCommissionAmount,
      agentCommissionAmount,
      policyDate,
      remarks: remarks.trim(),
      status: editingCase ? editingCase.status : 'active',
      agentPaymentStatus: agentPaymentStatus
    });

    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setVehicleNumber('');
    setVehicleModel('');
    setOdPremium(0);
    setTpPremium(0);
    setNetPremium(0);
    setPolicyNumber('');
    setPremiumAmount(0);
    setRemarks('');
    setAgentPaymentStatus('unpaid');
    onClose();
  };

  const handleCompanyChange = (val: number) => {
    setCompanyPct(val);
    // Keep myPct same, adjust agentPct
    setAgentPct(Math.max(0, val - myPct));
  };

  const handleMyPctChange = (val: number) => {
    setMyPct(val);
    // agentPct is the remaining percentage of the premium
    setAgentPct(Math.max(0, companyPct - val));
  };

  const handleAgentPctChange = (val: number) => {
    setAgentPct(val);
    // myPct of the premium is the remainder
    setMyPct(Math.max(0, companyPct - val));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div 
        id="new-case-modal"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col font-sans"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between rounded-t-3xl sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{editingCase ? 'Revise Policy Record' : 'Register New Case'}</h2>
            <p className="text-emerald-50 text-xs">{editingCase ? 'Update active parameters & commissions dynamically' : 'All insurance parameters & automated commission calculator'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Step 1: select type using clean visuals */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Choose Insurance Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'motor', icon: Car, label: 'Motor', desc: 'Vehicle Insurance' },
                { id: 'life', icon: Shield, label: 'Life', desc: 'Life Insurance' },
                { id: 'health', icon: Heart, label: 'Health', desc: 'Health Insurance' },
                { id: 'loan', icon: Coins, label: 'Loan', desc: 'Loan Protection' },
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = insuranceType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInsuranceType(item.id as InsuranceType)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50/75 ring-2 ring-emerald-500/20' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 mb-2 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div className={`text-sm font-medium ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                      {item.label}
                    </div>
                    <div className="text-slate-400 text-[10px]">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 my-4" />

          {/* Step 2: Dynamic Inputs based on type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Basic Info */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    errors.customerName ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.customerName && <p className="text-red-500 text-[11px] mt-0.5">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Condition 1: Motor Extra Fields */}
            {insuranceType === 'motor' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Vehicle Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'private', label: 'Private Car / Bike', desc: 'OD payout enabled' },
                      { id: 'commercial', label: 'Commercial Vehicle', desc: 'Net payout (TP only)' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVehicleType(v.id as 'private' | 'commercial')}
                        className={`text-xs py-2 px-3 border rounded-xl font-medium transition-all text-left ${
                          vehicleType === v.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-bold">{v.label}</div>
                        <div className="text-[9px] text-slate-400/80 font-normal">{v.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL-3CAQ-1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase ${
                      errors.vehicleNumber ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.vehicleNumber && <p className="text-red-500 text-[11px] mt-0.5">{errors.vehicleNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Vehicle Make & Model (e.g. Audi A4, Swift VXI, Splendor)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Audi Q5"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Motor policy subtype selection */}
                <div className="col-span-1 md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 mt-2 space-y-2.5">
                  <span className="block text-xs font-bold text-slate-700">Motor Policy Subtype selection</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(vehicleType === 'private' ? [
                      { id: 'own-damage', label: 'Own Damage (OD) Only', desc: 'On-damage cover' },
                      { id: 'third-party', label: 'Third-Party (TP) Only', desc: 'Liability coverage' },
                      { id: 'package', label: 'Bundle / Package Policy', desc: 'Comprehensive package' },
                    ] : [
                      { id: 'third-party', label: 'Third-Party (TP) Only', desc: 'Liability coverage' },
                      { id: 'package', label: 'Package Policy (Comprehensive)', desc: 'Comprehensive package' },
                    ]).map((sub) => {
                      const isSelected = motorPolicySubtype === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setMotorPolicySubtype(sub.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/10'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs font-bold">{sub.label}</div>
                          <div className="text-[9px] text-slate-400 mt-1">{sub.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                  {vehicleType === 'commercial' ? (
                    <p className="text-[10px] text-indigo-800 bg-indigo-50 px-2 rounded-md font-mono py-0.5 inline-block">
                      * Commercial vehicles generally select Package or Third-Party (TP) policies.
                    </p>
                  ) : (
                    <p className="text-[10px] text-teal-850 bg-teal-50 px-2 rounded-md font-mono py-0.5 inline-block">
                      * Private vehicles can opt for Own Damage, Third Party, or Bundle policies.
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Condition 2: Other Types Policy Categories Selection */}
            {insuranceType !== 'motor' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Policy Category
                </label>
                <select
                  value={policyCategory}
                  onChange={(e) => setPolicyCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                >
                  {defaultPolicyCategories[insuranceType]?.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Special Custom Plan">Custom Plan</option>
                </select>
              </div>
            )}

            {/* Standard Identifiers */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Policy Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. POL-12345678"
                required
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase ${
                  errors.policyNumber ? 'border-red-400' : 'border-slate-200'
                }`}
              />
              {errors.policyNumber && <p className="text-red-500 text-[11px] mt-0.5">{errors.policyNumber}</p>}
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Insurance Provider <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Type or select company (e.g. HDFC Ergo, LIC)"
                required
                value={companyName}
                onFocus={() => setIsCompanyFocused(true)}
                onBlur={() => setTimeout(() => setIsCompanyFocused(false), 200)}
                onChange={(e) => setCompanyName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                  errors.companyName ? 'border-red-400' : 'border-slate-200'
                }`}
              />
              {isCompanyFocused && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 animate-fadeIn">
                  {(() => {
                    const filtered = companySuggestions[insuranceType].filter(c =>
                      c.toLowerCase().includes(companyName.toLowerCase())
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="p-3 text-slate-400 text-center text-xs">
                          No registered matches. Press enter to use "{companyName}"
                        </div>
                      );
                    }
                    return filtered.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onMouseDown={() => {
                          setCompanyName(c);
                          setIsCompanyFocused(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer font-medium text-slate-700 text-xs flex justify-between items-center"
                      >
                        <span>{c}</span>
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono capitalize">{insuranceType}</span>
                      </button>
                    ));
                  })()}
                </div>
              )}
              {errors.companyName && <p className="text-red-500 text-[11px] mt-0.5">{errors.companyName}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Policy Issue Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={policyDate}
                  onChange={(e) => setPolicyDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 my-4" />

          {/* Step 3: Financial Calculations */}
          <div className="bg-slate-50 p-5 rounded-2xl space-y-4 border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Premium & Tax Details
            </h3>
            
            {insuranceType === 'motor' ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* OD Input */}
                  {(motorPolicySubtype === 'own-damage' || motorPolicySubtype === 'package') && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Own Damage (OD) Premium (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-450 text-xs font-medium">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 10000"
                          value={odPremium || ''}
                          onChange={(e) => setOdPremium(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full pl-7 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {/* TP Input */}
                  {(motorPolicySubtype === 'third-party' || motorPolicySubtype === 'package') && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Third Party (TP) Premium (₹) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-450 text-xs font-medium">₹</span>
                        <input
                          type="number"
                          placeholder="e.g. 8500"
                          value={tpPremium || ''}
                          onChange={(e) => setTpPremium(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full pl-7 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Net Premium (OD + TP)</span>
                    <span className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">₹ {netPremium.toLocaleString('en-IN')}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-650 mb-1">
                      GST Rate (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="18"
                        value={gstPercent}
                        onChange={(e) => setGstPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-full pr-7 pl-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 text-xs font-semibold">%</span>
                    </div>
                  </div>

                  <div className="bg-emerald-600 text-white rounded-xl p-3 flex flex-col justify-center shadow-xs">
                    <span className="text-[10px] text-emerald-100 uppercase tracking-wide">Total (incl. {gstPercent}% GST)</span>
                    <span className="text-base font-extrabold tracking-tight">₹ {totalAmountWithGst.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-emerald-200">GST Portion: ₹ {(Math.round((totalAmountWithGst - netPremium) * 100) / 100).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {errors.premiumAmount && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.premiumAmount}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Base Premium (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 text-xs font-medium">₹</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="25000"
                      required
                      value={premiumAmount || ''}
                      onChange={(e) => setPremiumAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                    />
                  </div>
                  {errors.premiumAmount && <p className="text-red-500 text-[11px] font-bold mt-1">{errors.premiumAmount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    GST Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="18"
                      value={gstPercent}
                      onChange={(e) => setGstPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-full pr-7 pl-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-550 text-xs font-semibold">%</span>
                  </div>
                </div>

                <div className="bg-emerald-600 text-white rounded-xl p-3 flex flex-col justify-center shadow-xs">
                  <span className="text-[10px] text-emerald-100 uppercase tracking-wide">Total Premium (incl. GST)</span>
                  <span className="text-base font-extrabold tracking-tight">₹ {totalAmountWithGst.toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-emerald-200">Includes ₹ {(Math.round((totalAmountWithGst - premiumAmount) * 100) / 100).toLocaleString('en-IN')} GST tax</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Commission Splits (Dynamic Formula Auto-calculation) */}
          <div className="bg-slate-50 p-5 rounded-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-teal-600" /> Commission Distribution Calculator
              </h3>
              <div className="text-[11px] bg-teal-100 text-teal-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600" /> Auto-Calculated Payouts
              </div>
            </div>

            {insuranceType === 'motor' && (
              <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-2xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="block text-xs font-bold text-amber-900">
                    Payout Allocated To / Baselines:
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md text-amber-900 border border-amber-200 font-bold">
                    Regulated Baseline: ₹{Math.round(commissionPayoutOn === 'od' ? odPremium : commissionPayoutOn === 'tp' ? tpPremium : netPremium).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-sans leading-normal">
                  Define what component of premium the commission applies to. (OD is standard for private vehicle packages, and Net premium is typical for commercial vehicles):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'od', label: 'Own Damage (OD)', desc: `Component: ₹${odPremium}`, enabled: motorPolicySubtype === 'own-damage' || motorPolicySubtype === 'package' },
                    { id: 'tp', label: 'Third-Party (TP)', desc: `Component: ₹${tpPremium}`, enabled: motorPolicySubtype === 'third-party' || motorPolicySubtype === 'package' },
                    { id: 'net', label: 'Net Premium', desc: `Component: ₹${netPremium}`, enabled: true }
                  ].map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      disabled={!target.enabled}
                      onClick={() => setCommissionPayoutOn(target.id as 'od' | 'tp' | 'net')}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        !target.enabled
                          ? 'opacity-30 cursor-not-allowed bg-slate-100 border-slate-200'
                          : commissionPayoutOn === target.id
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/10'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-[10px] font-extrabold capitalize">{target.label}</div>
                      <div className="text-[8px] text-slate-400 font-normal font-mono tracking-tight mt-1 leading-tight">{target.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-705 mb-1">
                  Company Payout Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="18"
                    value={companyPct}
                    onChange={(e) => handleCompanyChange(parseFloat(e.target.value) || 0)}
                    className="w-full pr-7 pl-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-800"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-semibold">%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Company Comm: ₹{totalCommissionReceived.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 mb-1">
                  My Kept Share (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={companyPct}
                    step="0.1"
                    placeholder="5"
                    value={myPct}
                    onChange={(e) => handleMyPctChange(parseFloat(e.target.value) || 0)}
                    className="w-full pr-7 pl-3 py-2 border border-emerald-300 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-800"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-450 text-xs font-semibold">%</span>
                </div>
                <p className="text-[10px] text-emerald-600 font-medium mt-1 font-mono font-bold">My kept: ₹{myCommissionAmount.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-700 mb-1">
                  Agent Share (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max={companyPct}
                    step="0.1"
                    placeholder="13"
                    value={agentPct}
                    onChange={(e) => handleAgentPctChange(parseFloat(e.target.value) || 0)}
                    className="w-full pr-7 pl-3 py-2 border border-teal-300 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-teal-850"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-450 text-xs font-semibold">%</span>
                </div>
                <p className="text-[10px] text-teal-650 font-medium mt-1 font-mono">Agent share: ₹{agentCommissionAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {errors.splitPercent && (
              <p className="text-amber-600 text-[11px] mt-1 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                {errors.splitPercent}
              </p>
            )}

            {/* Sum check success feedback with precise motor baseline highlights */}
            {Math.abs(Number(myPct) + Number(agentPct) - Number(companyPct)) <= 0.01 && (
              <div className="text-emerald-800 text-xs flex flex-col gap-1.5 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Commission Payout Split Logic Verified!
                </p>
                <div className="text-[11px] text-slate-650 leading-relaxed font-mono space-y-1">
                  {insuranceType === 'motor' && vehicleType === 'private' ? (
                    <div className="text-amber-855 font-bold mb-1.5 bg-amber-50/75 px-2 py-1 rounded-md border border-amber-200/50">
                      ⚠️ Private vehicle policies calculate commission solely on the {motorPolicySubtype === 'third-party' ? 'Third Party (TP) Premium content' : 'Own Damage (OD) Premium content'} (₹{motorPolicySubtype === 'third-party' ? tpPremium : odPremium}) under local payout custom guidelines.
                    </div>
                  ) : insuranceType === 'motor' && vehicleType === 'commercial' ? (
                    <div className="text-blue-805 font-bold mb-1.5 bg-blue-50/70 px-2 py-1 rounded-md border border-blue-150">
                      📄 Commercial vehicles calculate commission on the entire Net Premium (₹{netPremium}) under Net Payout guidelines.
                    </div>
                  ) : null}
                  <div>• Out of total {companyPct}% commission from company, you keep <strong className="text-emerald-800 font-bold">{myPct}% (₹{myCommissionAmount.toLocaleString('en-IN')})</strong>.</div>
                  <div>• The remaining <strong className="text-teal-750 font-bold">{agentPct}% (₹{agentCommissionAmount.toLocaleString('en-IN')})</strong> will be paid to your agent.</div>
                </div>
              </div>
            )}
          </div>

          {/* Agent Payment Status */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <span>Sub-Agent Payment Status</span>
              <span className="text-[10px] text-slate-400 font-normal">(Payment of agent commission)</span>
            </label>
            <div className="grid grid-cols-2 gap-3 bg-slate-100/40 p-1 rounded-xl border border-slate-200/40">
              <button
                type="button"
                onClick={() => setAgentPaymentStatus('unpaid')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  agentPaymentStatus === 'unpaid'
                    ? 'bg-amber-100 text-amber-800 border-2 border-amber-300 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-500 border border-slate-100'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${agentPaymentStatus === 'unpaid' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                Outstanding / Pending
              </button>
              <button
                type="button"
                onClick={() => setAgentPaymentStatus('paid')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  agentPaymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-500 border border-slate-100'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${agentPaymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Settled / Paid
              </button>
            </div>
          </div>

          {/* Remarks/Optional details */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Remarks (Plan details or notes)
            </label>
            <textarea
              placeholder="Enter special features of policy, plan name, or specific rider details..."
              value={remarks}
              rows={2}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none font-mono"
            />
          </div>

          {/* Error General Alert */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 font-bold">
              Please correct the highlighted errors in the form before saving.
            </div>
          )}

          {/* Footer controls */}
          <div className="pt-2 flex items-center justify-end gap-3 bg-white py-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-600/15 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" /> {editingCase ? 'Update Policy Details' : 'Save Case Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
