import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { motion } from 'motion/react';
import { 
  Plus, Search, User as UserIcon, Settings, LogOut, Calculator, 
  Percent, Briefcase, Calendar, Car, Heart, Shield, Coins, 
  ChevronRight, Phone, MessageSquare, Trash2, Users, Menu, X, 
  Sparkles, Receipt, CheckCircle, HelpCircle, Building2, TrendingUp, Info, ArrowUpRight,
  Edit2, BarChart3
} from 'lucide-react';

import { InsuranceCase, User, AppSettings, InsuranceType } from './types';
import { mockCases } from './mockData';
import NewCaseModal from './components/NewCaseModal';
import BusinessReports from './components/BusinessReports';
import AppLogoImg from './assets/images/bima_logo_tracker_1779535752105.png';

export default function App() {
  // Authentication & Profile States
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bima_advisor_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');
  
  // Registration state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAgency, setRegAgency] = useState('');
  const [regPin, setRegPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Primary Policy State Database
  const [cases, setCases] = useState<InsuranceCase[]>(() => {
    const saved = localStorage.getItem('bima_advisor_cases');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return mockCases;
      }
    }
    return mockCases;
  });

  // App Configuration Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('bima_advisor_settings');
    const defaultColors: Record<InsuranceType, string> = {
      motor: 'blue',
      health: 'emerald',
      life: 'amber',
      loan: 'purple'
    };
    if (saved) {
      try {
        const loadedSettings = JSON.parse(saved);
        if (!loadedSettings.typeColors) {
          loadedSettings.typeColors = defaultColors;
        }
        return loadedSettings;
      } catch (e) {
        // Fallback below
      }
    }
    return {
      defaultGstPercent: 18,
      defaultCompanyPct: 15,
      currencySymbol: '₹',
      typeColors: defaultColors
    };
  });

  // Navigation / UI Mode Controls
  const [selectedTab, setSelectedTab] = useState<InsuranceType | 'all' | 'renewals'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<InsuranceCase | null>(null);
  const [editingCase, setEditingCase] = useState<InsuranceCase | null>(null);
  
  // Panels view controls
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showSupportPanel, setShowSupportPanel] = useState(false);
  const [showReportsPanel, setShowReportsPanel] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Client Profile Editing States
  const [isEditingClientProfile, setIsEditingClientProfile] = useState(false);
  const [editClientName, setEditClientName] = useState('');
  const [editClientMobile, setEditClientMobile] = useState('');

  // Advisor Profile Editing States
  const [isEditingAdvisorProfile, setIsEditingAdvisorProfile] = useState(false);
  const [profileEditName, setProfileEditName] = useState('');
  const [profileEditAgency, setProfileEditAgency] = useState('');
  const [profileEditMobile, setProfileEditMobile] = useState('');
  const [profileEditAvatar, setProfileEditAvatar] = useState('');

  // Status Alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('bima_advisor_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    if (!selectedCase) {
      setIsEditingClientProfile(false);
      setEditClientName('');
      setEditClientMobile('');
    }
  }, [selectedCase?.id]);

  useEffect(() => {
    localStorage.setItem('bima_advisor_settings', JSON.stringify(settings));
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Pre-seed Demo login handler
  const handleQuickDemoLogin = () => {
    const demoUser: User = {
      mobile: '9999999999',
      pin: '1234',
      fullName: 'Rajesh Singh',
      agencyName: 'Om Sai Insurance Consultancy'
    };
    localStorage.setItem('bima_advisor_user', JSON.stringify(demoUser));
    setCurrentUser(demoUser);
    showToast('Logged in safely to demo environment!');
  };

  // Self Registration submit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!regName.trim() || !regPhone.trim() || !regAgency.trim() || !regPin.trim()) {
      setAuthError('Please fill out all the details to register.');
      return;
    }
    if (regPhone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (regPin.length < 4) {
      setAuthError('Security PIN must be at least 4 digits long.');
      return;
    }

    const newUser: User = {
      fullName: regName.trim(),
      mobile: regPhone.trim(),
      agencyName: regAgency.trim(),
      pin: regPin
    };

    // Save registered credentials
    localStorage.setItem(`bima_user_cred_${newUser.mobile}`, JSON.stringify(newUser));
    localStorage.setItem('bima_advisor_user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    showToast('Account successfully customized and registered!');
    
    // reset form fields
    setRegName('');
    setRegPhone('');
    setRegAgency('');
    setRegPin('');
  };

  // Self Login submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!loginPhone || !loginPin) {
      setAuthError('Please enter both your mobile number and security PIN.');
      return;
    }

    // Try reading registered creds
    const stored = localStorage.getItem(`bima_user_cred_${loginPhone}`);
    if (stored) {
      const parsed: User = JSON.parse(stored);
      if (parsed.pin === loginPin) {
        localStorage.setItem('bima_advisor_user', JSON.stringify(parsed));
        setCurrentUser(parsed);
        showToast(`Welcome back, ${parsed.fullName}!`);
        return;
      }
    }

    // Fallback logic for quick testing or default profile matching
    if (loginPhone === '9999999999' && loginPin === '1234') {
      handleQuickDemoLogin();
    } else {
      setAuthError('Invalid credentials! Match not found or incorrect PIN.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bima_advisor_user');
    setCurrentUser(null);
    showToast('Successfully logged out.');
  };

  const getCustomCardStyles = (type: InsuranceType, typeColorsSetting?: Record<InsuranceType, string>) => {
    const chosenColor = typeColorsSetting?.[type] || (
      type === 'motor' ? 'blue' :
      type === 'health' ? 'emerald' :
      type === 'life' ? 'amber' : 'purple'
    );

    switch (chosenColor) {
      case 'emerald':
        return {
          borderClass: 'border-emerald-200 hover:border-emerald-400 focus:border-emerald-500',
          topBarClass: 'from-emerald-500 to-teal-500',
          badgeClass: 'bg-emerald-55 border border-emerald-200 text-emerald-800',
          shadowClass: 'shadow-emerald-500/5 hover:shadow-emerald-500/10',
          textClass: 'text-emerald-700',
          borderPulseClass: 'ring-emerald-500/20'
        };
      case 'blue':
        return {
          borderClass: 'border-blue-200 hover:border-blue-400 focus:border-blue-500',
          topBarClass: 'from-blue-500 to-sky-500',
          badgeClass: 'bg-blue-50 border border-blue-200 text-blue-800',
          shadowClass: 'shadow-blue-500/5 hover:shadow-blue-500/10',
          textClass: 'text-blue-700',
          borderPulseClass: 'ring-blue-500/20'
        };
      case 'indigo':
        return {
          borderClass: 'border-indigo-200 hover:border-indigo-400 focus:border-indigo-500',
          topBarClass: 'from-indigo-500 to-violet-500',
          badgeClass: 'bg-indigo-55 border border-indigo-200 text-indigo-800',
          shadowClass: 'shadow-indigo-500/5 hover:shadow-indigo-500/10',
          textClass: 'text-indigo-700',
          borderPulseClass: 'ring-indigo-500/20'
        };
      case 'purple':
        return {
          borderClass: 'border-purple-200 hover:border-purple-400 focus:border-purple-500',
          topBarClass: 'from-purple-500 to-fuchsia-500',
          badgeClass: 'bg-purple-55 border border-purple-200 text-purple-800',
          shadowClass: 'shadow-purple-500/5 hover:shadow-purple-500/10',
          textClass: 'text-purple-700',
          borderPulseClass: 'ring-purple-500/20'
        };
      case 'amber':
        return {
          borderClass: 'border-amber-200 hover:border-amber-400 focus:border-amber-500',
          topBarClass: 'from-amber-500 to-orange-500',
          badgeClass: 'bg-amber-55 border border-amber-200 text-amber-800',
          shadowClass: 'shadow-amber-500/5 hover:shadow-amber-500/10',
          textClass: 'text-amber-700',
          borderPulseClass: 'ring-amber-500/20'
        };
      case 'rose':
        return {
          borderClass: 'border-rose-200 hover:border-rose-400 focus:border-rose-500',
          topBarClass: 'from-rose-500 to-red-500',
          badgeClass: 'bg-rose-55 border border-rose-200 text-rose-800',
          shadowClass: 'shadow-rose-500/5 hover:shadow-rose-500/10',
          textClass: 'text-rose-700',
          borderPulseClass: 'ring-rose-500/20'
        };
      case 'pink':
        return {
          borderClass: 'border-pink-200 hover:border-pink-400 focus:border-pink-500',
          topBarClass: 'from-pink-500 to-rose-400',
          badgeClass: 'bg-pink-55 border border-pink-200 text-pink-800',
          shadowClass: 'shadow-pink-500/5 hover:shadow-pink-500/10',
          textClass: 'text-pink-750',
          borderPulseClass: 'ring-pink-500/20'
        };
      case 'slate':
      default:
        return {
          borderClass: 'border-slate-300 hover:border-slate-400 focus:border-slate-500',
          topBarClass: 'from-slate-500 to-slate-600',
          badgeClass: 'bg-slate-100 border border-slate-200 text-slate-800',
          shadowClass: 'shadow-slate-500/5 hover:shadow-slate-500/10',
          textClass: 'text-slate-700',
          borderPulseClass: 'ring-slate-500/20'
        };
    }
  };

  // Create or Update Case
  const handleSaveCase = (caseData: Omit<InsuranceCase, 'id'> & { id?: string }) => {
    if (caseData.id) {
      setCases(prev => prev.map(c => c.id === caseData.id ? { ...c, ...caseData as InsuranceCase } : c));
      setSelectedCase(prev => prev?.id === caseData.id ? { ...prev, ...caseData as InsuranceCase } : prev);
      showToast('Insurance record successfully updated.');
    } else {
      const freshCase: InsuranceCase = {
        ...(caseData as Omit<InsuranceCase, 'id'>),
        id: `case-${Date.now()}`
      };
      setCases(prev => [freshCase, ...prev]);
      showToast('New insurance record successfully stored.');
    }
  };

  const handleEditCase = (c: InsuranceCase, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCase(c);
    setIsNewCaseOpen(true);
  };

  const handleDeleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you absolutely sure you want to delete this case?')) {
      setCases(prev => prev.filter(c => c.id !== id));
      if (selectedCase?.id === id) {
        setSelectedCase(null);
      }
      showToast('Record deleted.');
    }
  };

  const handleToggleAgentPayment = (id: string) => {
    setCases(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus: 'paid' | 'unpaid' = c.agentPaymentStatus === 'paid' ? 'unpaid' : 'paid';
        showToast(`Sub-Agent payment status marked as ${nextStatus === 'paid' ? 'Paid' : 'Outstanding'}.`);
        return {
          ...c,
          agentPaymentStatus: nextStatus
        };
      }
      return c;
    }));
    // Synchronize current modal details state if viewing 
    setSelectedCase(prev => {
      if (prev?.id === id) {
        return {
          ...prev,
          agentPaymentStatus: prev.agentPaymentStatus === 'paid' ? 'unpaid' : 'paid'
        };
      }
      return prev;
    });
  };

  const loadSampleData = () => {
    setCases(mockCases);
    showToast('Sample demo cases restored successfully.');
  };

  const clearAllData = () => {
    if (confirm('Warning: This will delete ALL stored cases permanently. Continue?')) {
      setCases([]);
      showToast('All records permanently erased.');
    }
  };

  // Policy Expiration Date calculation helpers with standard 1-year duration
  const getPolicyExpiryInfo = (policyDateStr: string) => {
    // Current application local baseline date: 2026-05-23
    const today = new Date('2026-05-23');
    const issued = new Date(policyDateStr);
    
    // Add exactly 1 year to issued date
    const expiry = new Date(issued.getFullYear() + 1, issued.getMonth(), issued.getDate());
    
    // Difference in days (1000ms * 60s * 60m * 24h)
    const exactDiffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      expiryDate: expiry.toISOString().split('T')[0],
      daysLeft: exactDiffDays,
      isExpired: exactDiffDays <= 0,
    };
  };

  const getWhatsAppShareLink = (c: InsuranceCase) => {
    const isMotor = c.insuranceType === 'motor';
    const typeLabel = c.insuranceType.toUpperCase();
    const exp = getPolicyExpiryInfo(c.policyDate);
    
    let msg = `*Dear Client,*\n\n`;
    msg += `Here is your *${typeLabel} Insurance POLICY SUMMARY*:\n\n`;
    msg += `• *Policy Number:* ${c.policyNumber}\n`;
    msg += `• *Insurance Provider:* ${c.companyName}\n`;
    msg += `• *Insurance Cover Category:* ${isMotor ? (c.motorPolicySubtype === 'own-damage' ? 'Own Damage Only' : c.motorPolicySubtype === 'third-party' ? 'Third Party Only' : 'Comprehensive Bundle') : c.policyCategory || 'Standard'}\n`;
    if (isMotor && c.vehicleNumber) {
      msg += `• *Vehicle Number:* ${c.vehicleNumber}\n`;
    }
    if (isMotor && c.vehicleModel) {
      msg += `• *Vehicle Model:* ${c.vehicleModel}\n`;
    }
    msg += `• *Premium Amount:* ₹${Math.round(c.premiumAmount).toLocaleString('en-IN')}\n`;
    msg += `• *Total Amount (with GST):* ₹${Math.round(c.totalAmountWithGst).toLocaleString('en-IN')}\n`;
    msg += `• *Policy Start Date:* ${c.policyDate}\n`;
    msg += `• *Policy Expiry Date:* ${exp.expiryDate} _(${exp.daysLeft <= 0 ? 'Renew Immediately! Lapsed' : `${exp.daysLeft} days left`})_\n`;
    if (c.remarks) {
      msg += `• *Additional Notes:* ${c.remarks}\n`;
    }
    msg += `\nThank you!\nRegards,\n*${currentUser?.fullName || 'Your Insurance Advisor'}* (Agency: *${currentUser?.agencyName || 'BIMA Agency'}*)`;

    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const getRenewalsCount = () => {
    return cases.filter(c => {
      const exp = getPolicyExpiryInfo(c.policyDate);
      return exp.daysLeft <= 30; // Approaching or lapsed/expired
    }).length;
  };

  const generateCasePDF = (c: InsuranceCase) => {
    try {
      const doc = new jsPDF();
      
      // Page styling helper variables
      const margin = 15;
      let y = 20;
      
      // Colors
      const darkColor = [30, 41, 59]; // slate-800
      const brandColor = [5, 150, 105]; // emerald-600
      const lightBg = [248, 250, 252]; // slate-50
      const borderLineColor = [226, 232, 240]; // slate-200

      // Add elegant Top Branding Bar
      doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.rect(margin, y, 180, 4, 'F');
      y += 12;

      // Header block
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(currentUser?.agencyName || 'Bima Advisor Agency', margin, y);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Advisor: ${currentUser?.fullName || 'Agent'}  |  Mobile: ${currentUser?.mobile || 'N/A'}`, margin, y + 5);
      
      // Right side invoice tag
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      const dateText = `Date: ${new Date().toLocaleDateString('en-IN')}`;
      doc.text('CASE SUMMARY & COMMISSION REPORT', 195, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(dateText, 195, y + 5, { align: 'right' });
      
      y += 14;

      // Divider
      doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, y, 195, y);
      
      y += 10;

      // Section 1: Customer & Policy Information
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('Customer & Policy Details', margin, y);
      
      y += 6;

      // Table layout for details
      const drawTableRow = (label1: string, val1: string, label2: string, val2: string, currentY: number) => {
        // Draw alternate background
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        doc.rect(margin, currentY - 5, 180, 7.5, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139); // slate-505
        doc.text(label1, margin + 4, currentY);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text(val1, margin + 42, currentY);

        if (label2) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 116, 139);
          doc.text(label2, margin + 94, currentY);
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
          doc.text(val2, margin + 132, currentY);
        }
      };

      const formatCurrency = (amt: number) => {
        return `INR ${Math.round(amt).toLocaleString('en-IN')}`;
      };

      drawTableRow('Customer Name:', c.customerName, 'Contact No:', c.mobile || 'N/A', y);
      y += 8;
      drawTableRow('Policy Class:', c.insuranceType.toUpperCase(), 'Provider Name:', c.companyName, y);
      y += 8;
      drawTableRow('Policy Number:', c.policyNumber, 'Category / Subtype:', c.insuranceType === 'motor' ? (c.motorPolicySubtype === 'own-damage' ? 'Own Damage (OD Only)' : c.motorPolicySubtype === 'third-party' ? 'Third-Party (TP Only)' : 'Full Package / Bundle') : (c.policyCategory || 'N/A'), y);
      y += 8;
      drawTableRow('Issued Date:', c.policyDate, 'Expiry Date:', getPolicyExpiryInfo(c.policyDate).expiryDate, y);
      y += 11;

      // Section 2: Motor specific fields
      if (c.insuranceType === 'motor') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text('Vehicle & Coverage Specifics', margin, y);
        y += 6;

        drawTableRow('Vehicle Number:', c.vehicleNumber || 'N/A', 'Category:', c.vehicleType === 'private' ? 'Private' : 'Commercial', y);
        y += 8;
        drawTableRow('Make & Model:', c.vehicleModel || 'N/A', 'Commission on:', c.commissionPayoutOn ? c.commissionPayoutOn.toUpperCase() : 'OD Component', y);
        y += 8;
        drawTableRow('OD Premium component:', formatCurrency(c.odPremium || 0), 'TP Premium component:', formatCurrency(c.tpPremium || 0), y);
        y += 11;
      }

      // Section 3: Premium & Payout Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('Premium & Commission Calculations', margin, y);
      y += 6;

      // Draw premium grid background
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(margin, y - 5, 180, 46, 'F');
      
      // Net Premium
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(c.insuranceType === 'motor' ? 'Calculated Net Premium:' : 'Base Premium:', margin + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(formatCurrency(c.premiumAmount), margin + 65, y);
      y += 7;

      // GST percent & Tax Amount
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(`GST Tax Amount (${c.gstPercent}%):`, margin + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const taxAmt = c.totalAmountWithGst - c.premiumAmount;
      doc.text(formatCurrency(taxAmt), margin + 65, y);
      y += 7;

      // Total Cost Including Tax
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('Total Cost (including GST):', margin + 4, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
      doc.text(formatCurrency(c.totalAmountWithGst), margin + 65, y);
      y += 9;

      // Horizontal dashed line
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineDashPattern([2, 1], 0);
      doc.line(margin + 4, y - 4, 191, y - 4);
      doc.setLineDashPattern([], 0); // reset line dash

      // Base share line information description
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      let desc = '';
      if (c.insuranceType === 'motor') {
        const componentName = c.commissionPayoutOn === 'od' ? 'Own Damage (OD)' : c.commissionPayoutOn === 'tp' ? 'Third-Party (TP)' : 'Net Premium';
        const componentValStr = c.commissionPayoutOn === 'od' ? formatCurrency(c.odPremium || 0) : c.commissionPayoutOn === 'tp' ? formatCurrency(c.tpPremium || 0) : formatCurrency(c.premiumAmount);
        desc = `Commission is calculated strictly based on the ${componentName} component [${componentValStr}]`;
      } else {
        desc = `Commission is calculated strictly based on the Base Premium [${formatCurrency(c.premiumAmount)}]`;
      }
      doc.text(desc, margin + 4, y - 0.5);
      y += 6;

      // Payout Percent and Commission Total Received
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Total Company Payout (${c.companyPct}%):`, margin + 4, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(formatCurrency(c.totalCommissionReceived), margin + 65, y);
      y += 7;

      // Commission Shares
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(`My Kept Margin (${c.myPct}% of payout):`, margin + 4, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(4, 120, 87); // emerald-700
      doc.text(formatCurrency(c.myCommissionAmount), margin + 65, y);
      y += 7;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(`Sub-Agent Share (${c.agentPct}% of payout):`, margin + 4, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text(formatCurrency(c.agentCommissionAmount), margin + 65, y);
      y += 12;

      // Remarks Section
      if (c.remarks) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.text('Remarks & Policy Notes', margin, y);
        y += 5;

        // Multiline notes handling
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105); // slate-600
        const splitRemarks = doc.splitTextToSize(c.remarks, 175);
        doc.text(splitRemarks, margin + 4, y);
        y += splitRemarks.length * 4.5 + 5;
      }

      // Add Footer Certificate Info
      y = Math.max(y, 260); // push footer to bottom of A4 page
      doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, y, 195, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Pursuant to IRDAI guidelines, commission percentages are calculated strictly on the designated base premium component excluding GST.', margin, y);
      y += 4.5;
      doc.text('This is a computer-generated summary and casing statement for internal ledger verification. Generated by Bima Broker Pro.', margin, y);

      // Save PDF or output to user download
      const filename = `policy_summary_${c.customerName.toLowerCase().replace(/\s+/g, '_')}_${c.policyNumber}.pdf`;
      doc.save(filename);
      showToast('PDF Document generated and downloaded successfully!');
    } catch (error) {
      console.error('PDF Generation failed: ', error);
      showToast('Error generating PDF document. Please try again.');
    }
  };


  // Filters policy cases depending on user selections
  const filteredCases = cases.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      c.customerName.toLowerCase().includes(searchLower) ||
      c.policyNumber.toLowerCase().includes(searchLower) ||
      c.companyName.toLowerCase().includes(searchLower) ||
      (c.vehicleNumber && c.vehicleNumber.toLowerCase().includes(searchLower)) ||
      (c.mobile && c.mobile.includes(searchLower));
    
    if (selectedTab === 'renewals') {
      const exp = getPolicyExpiryInfo(c.policyDate);
      return exp.daysLeft <= 30 && matchesSearch;
    }
    
    const matchesTab = selectedTab === 'all' || c.insuranceType === selectedTab;
    return matchesTab && matchesSearch;
  });

  // Statistical calculations from policy records
  const statistics = React.useMemo(() => {
    let totalPremium = 0;
    let totalBrokerage = 0;
    let totalMyCommission = 0;
    let totalAgentCommission = 0;
    
    filteredCases.forEach(c => {
      totalPremium += c.totalAmountWithGst; // premium with GST
      totalBrokerage += c.totalCommissionReceived;
      totalMyCommission += c.myCommissionAmount;
      totalAgentCommission += c.agentCommissionAmount;
    });

    return {
      count: filteredCases.length,
      premium: totalPremium,
      brokerage: totalBrokerage,
      myShare: totalMyCommission,
      agentShare: totalAgentCommission
    };
  }, [filteredCases]);

  // Support / Help parameters
  const [supportQuery, setSupportQuery] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 pb-20 flex flex-col items-center">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-850 text-emerald-400 px-5 py-3 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-2 z-55 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. AUTHENTICATION SECTION */}
      {!currentUser ? (
        <div className="w-full max-w-md mx-auto p-4 flex flex-col justify-center min-h-[90vh]">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
            
            {/* Header Identity */}
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-lg">
                <Calculator className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Bima Advisor</h1>
              <p className="text-slate-500 text-xs font-medium">Policy Tracker, Commission Splitter & Management Hub</p>
            </div>

            {/* Selector Tab */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'register' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 font-medium animate-pulse">
                {authError}
              </div>
            )}

            {/* Form Content */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9999999999"
                    maxLength={10}
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">4-Digit Security PIN</label>
                  <input
                    type="password"
                    placeholder="••••"
                    maxLength={4}
                    required
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-center tracking-widest font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 cursor-pointer text-white font-semibold text-sm rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-teal-600/10 hover:shadow-emerald-600/15 transition-all text-center"
                >
                  Sign In to Advisor Hub
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Singh"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Agency / Firm Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Om Sai Insurance Agency"
                    required
                    value={regAgency}
                    onChange={(e) => setRegAgency(e.target.value)}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Create 4-Digit Login PIN</label>
                  <input
                    type="password"
                    placeholder="e.g. 1234"
                    maxLength={4}
                    required
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-center tracking-widest font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 cursor-pointer text-white font-semibold text-sm rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/10 transition-all text-center"
                >
                  Register Account
                </button>
              </form>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Or Access Quick Demo</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Quick Demo Access */}
            <button
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Quick Demo Access (PIN: 1234)</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              All data is stored securely in your browser's local state. Full offline architecture ensures top privacy and speed.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#f8fafc]">
          
          {/* MOBILE BAR */}
          <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <img src={AppLogoImg} alt="Logo" className="w-8 h-8 rounded-lg object-contain" referrerPolicy="no-referrer" />
              <span className="font-bold text-xs uppercase tracking-wider font-sans">Insurance Data Tracker</span>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-1 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* OVERLAY FOR MOBILE */}
          {isMobileSidebarOpen && (
            <div 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-45"
            />
          )}

          {/* LEFT SIDEBAR navigation */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 lg:static 
            flex flex-col w-72 bg-slate-900 border-r border-slate-850 p-5 text-slate-300 flex-shrink-0
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-850">
              <img src={AppLogoImg} alt="Logo" className="w-9 h-9 rounded-xl object-contain shadow shadow-indigo-500/25" referrerPolicy="no-referrer" />
              <div>
                <h1 className="text-sm font-extrabold text-white font-sans tracking-tight leading-none">Insurance Tracker</h1>
                <span className="text-[9px] text-indigo-400 uppercase font-bold tracking-widest block mt-1">Data & Commission</span>
              </div>
            </div>

            <div 
              onClick={() => {
                setProfileEditName(currentUser.fullName);
                setProfileEditAgency(currentUser.agencyName);
                setProfileEditMobile(currentUser.mobile);
                setProfileEditAvatar(currentUser.avatar || '');
                setIsEditingAdvisorProfile(true);
              }}
              className="bg-slate-850/60 p-3 rounded-2xl flex items-center gap-3 border border-slate-800/80 mb-6 hover:bg-slate-800 cursor-pointer transition-all group font-sans animate-fadeIn"
              title="Click to edit advisor profile & photo"
            >
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.fullName} 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-2 bg-slate-800 text-orange-400 rounded-xl font-bold font-mono text-center text-xs w-10 h-10 flex items-center justify-center shrink-0">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="overflow-hidden flex-1">
                <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-amber-400 transition-colors">{currentUser.fullName}</h4>
                <p className="text-[9px] text-slate-500 truncate">{currentUser.agencyName || 'Advisor'}</p>
              </div>
              <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0 transition-colors" />
            </div>

            <nav className="flex-1 space-y-1.5 text-xs font-bold">
              <button
                onClick={() => { setShowSettingsPanel(false); setShowSupportPanel(false); setShowReportsPanel(false); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  !showSettingsPanel && !showSupportPanel && !showReportsPanel ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Home Dashboard</span>
              </button>
              <button
                onClick={() => { setIsNewCaseOpen(true); setIsMobileSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all font-bold"
              >
                <Plus className="w-4 h-4 text-orange-500" />
                <span>Register New Case</span>
              </button>
              <button
                onClick={() => { setShowReportsPanel(true); setShowSettingsPanel(false); setShowSupportPanel(false); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  showReportsPanel ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Business Insights & Reports</span>
              </button>
              <button
                onClick={() => { setShowSettingsPanel(true); setShowSupportPanel(false); setShowReportsPanel(false); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  showSettingsPanel ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>App Configuration</span>
              </button>
              <button
                onClick={() => { setShowSupportPanel(true); setShowSettingsPanel(false); setShowReportsPanel(false); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  showSupportPanel ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Customer Service</span>
              </button>
            </nav>

            <div className="pt-4 border-t border-slate-850 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-red-400 hover:text-red-300 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Account</span>
              </button>
            </div>
          </aside>

          {/* MAIN CONTAINER CONTENT BODY */}
          <div className="flex-1 lg:h-screen lg:overflow-y-auto p-4 md:p-8 space-y-6">

            {/* APPLICATION HEADER */}
            <header className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Left section: Identity and User */}
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
                  <img src={AppLogoImg} alt="Logo" className="w-8 h-8 rounded-lg object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {currentUser.agencyName || 'Om Sai Agency'}
                  </span>
                  <h1 className="text-base font-extrabold font-sans tracking-tight text-slate-800 flex items-center gap-1.5 leading-none">
                    <span>Insurance Data Tracker</span> <span className="text-slate-405 font-normal text-xs font-sans">• Workspace</span>
                  </h1>
                </div>
              </div>

              {/* Right section: Control Actions and Date info */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="font-mono">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </header>

            {/* DYNAMIC SIDE PANELS OVERLAYS */}
            
            {/* A. Settings Panel Drawer */}
            {showSettingsPanel && (
              <div className="bg-[#fffbeb] border border-[#fef3c7] p-6 rounded-3xl relative animate-fadeIn space-y-4">
                <button 
                  onClick={() => setShowSettingsPanel(false)}
                  className="absolute top-4 right-4 p-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-950 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-amber-700" /> App Configuration & Database Management
                  </h3>
                  <p className="text-xs text-amber-900/70">Customize variables and maintain local client storage databases.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white p-4 rounded-2xl border border-amber-200/40">
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Default GST Rate (%)</label>
                    <input
                      type="number"
                      value={settings.defaultGstPercent}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultGstPercent: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-amber-200/40 flex flex-col justify-between space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase block">Reset Demo Database</span>
                    <button 
                      onClick={loadSampleData}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Restore Sample Cases
                    </button>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-amber-200/40 flex flex-col justify-between space-y-2">
                    <span className="text-xs font-bold text-slate-600 uppercase block">Permanent Reset (Dry Eraser)</span>
                    <button 
                      onClick={clearAllData}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Erase All Records
                    </button>
                  </div>
                </div>

                <div className="border-t border-amber-200/30 pt-4 mt-4">
                  <h4 className="text-xs font-bold text-amber-950 uppercase mb-3 tracking-wider flex items-center gap-1.5 justify-start">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Color-Code Policy Accent Borders & Badges
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {(['motor', 'health', 'life', 'loan'] as InsuranceType[]).map((type) => {
                      const activeColor = settings.typeColors?.[type] || (
                        type === 'motor' ? 'blue' :
                        type === 'health' ? 'emerald' :
                        type === 'life' ? 'amber' : 'purple'
                      );
                      const colorOptions = [
                        { name: 'emerald', bg: 'bg-emerald-500' },
                        { name: 'blue', bg: 'bg-blue-500' },
                        { name: 'indigo', bg: 'bg-indigo-500' },
                        { name: 'purple', bg: 'bg-purple-500' },
                        { name: 'amber', bg: 'bg-amber-500' },
                        { name: 'rose', bg: 'bg-rose-500' },
                        { name: 'pink', bg: 'bg-pink-500' },
                        { name: 'slate', bg: 'bg-slate-500' }
                      ];

                      return (
                        <div key={type} className="bg-white/80 p-3.5 rounded-xl border border-amber-200/30 flex flex-col space-y-2 shadow-xs">
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight block capitalize">
                            {type} Category
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {colorOptions.map((opt) => (
                              <button
                                key={opt.name}
                                onClick={() => {
                                  setSettings(prev => {
                                    const updatedColors = { ...prev.typeColors, [type]: opt.name };
                                    return { ...prev, typeColors: updatedColors };
                                  });
                                  showToast(`${type.toUpperCase()} accent border switched to ${opt.name}!`);
                                }}
                                className={`w-5 h-5 rounded-full ${opt.bg} relative transition-all duration-150 hover:scale-110 cursor-pointer ${
                                  activeColor === opt.name ? 'ring-2 ring-slate-800 ring-offset-1 scale-105' : 'opacity-85'
                                }`}
                                title={`Switch to ${opt.name}`}
                              >
                                {activeColor === opt.name && (
                                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[9px]">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* B. Customer Support Center */}
            {showSupportPanel && (
              <div className="bg-emerald-50/75 border border-emerald-100 p-6 rounded-3xl relative animate-fadeIn space-y-4">
                <button 
                  onClick={() => setShowSupportPanel(false)}
                  className="absolute top-4 right-4 p-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-950 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-700" /> Insurance Advisor Support Helpdesk
                  </h3>
                  <p className="text-xs text-emerald-900/70">Need assistance with dynamic commissions calculation, GST norms, or IRDAI policies?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* FAQs Selection */}
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200/40 space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Frequently Asked Questions (FAQs)</span>
                    <div className="space-y-2 text-xs">
                      <details className="p-2 bg-slate-50 rounded-lg group cursor-pointer">
                        <summary className="font-semibold text-slate-700 select-none">Q. Is commission calculated differently for commercial vehicles?</summary>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Yes. IRDAI guidelines specify that commission is strictly paid on the Own Damage (OD) component of the base premium, rather than Third Party liability limits or taxes.
                        </p>
                      </details>
                      <details className="p-2 bg-slate-50 rounded-lg group cursor-pointer">
                        <summary className="font-semibold text-slate-700 select-none">Q. How do payouts split under the new percentage policy?</summary>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          In our updated system, all percentages relate to the base premium. If you receive an 18% payout and choose to keep 5% for yourself, the sub-agent gets the remaining 13% directly.
                        </p>
                      </details>
                    </div>
                  </div>

                  {/* Live Message Composer */}
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200/40 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-xs font-bold text-slate-800 uppercase block">Submit Support Ticket</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Contact technical experts instantly</p>
                    </div>

                    {supportSent ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-xs text-emerald-800 font-semibold animate-pulse">
                        Ticket registered successfully! Our advisory desk will reach out within 24 hours.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Write your technical query or system feedback here..."
                          value={supportQuery}
                          onChange={(e) => setSupportQuery(e.target.value)}
                          className="w-full text-xs p-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          rows={2}
                        />
                        <button 
                          onClick={() => {
                            if (supportQuery.trim()) {
                              setSupportSent(true);
                              setSupportQuery('');
                            }
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Send Complaint to Admin
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}


            {showReportsPanel ? (
              <BusinessReports 
                cases={cases} 
                onClose={() => setShowReportsPanel(false)} 
                agencyName={currentUser?.agencyName || 'Om Sai Agency'} 
                typeColors={settings.typeColors} 
              />
            ) : (
              <>
                {/* 3. ADVISOR STATISTICS GRID */}
                <section className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 font-sans">
              
              {/* Total Policies Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Policies</span>
                  <span className="text-2xl font-black font-mono tracking-tight text-slate-800 mt-1 block">
                    {statistics.count}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
                  <Info className="w-3" /> Active policies list
                </span>
              </div>

              {/* Total Premium Received With GST */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <span className="text-emerald-700 text-[10px] uppercase font-bold tracking-wider block">Premium Collected</span>
                  <span className="text-xl font-bold tracking-tight text-slate-800 mt-1 block font-mono">
                    ₹ {Math.round(statistics.premium).toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-2 font-medium">
                  Including GST taxes
                </span>
              </div>

              {/* Total Brokerage Comm from Company */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <span className="text-teal-700 text-[10px] uppercase font-bold tracking-wider block">Brokerage Received</span>
                  <span className="text-xl font-bold tracking-tight text-slate-800 mt-1 block font-mono">
                    ₹ {Math.round(statistics.brokerage).toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-2 font-mono">
                  From Insurance Providers
                </span>
              </div>

              {/* My Personal Net Commission */}
              <div className="bg-emerald-600 rounded-2xl text-white p-4 shadow-lg shadow-emerald-700/10 hover:shadow-emerald-700/15 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-emerald-100 text-[10px] uppercase font-bold tracking-wider block">My Net Revenue</span>
                  <span className="text-xl font-extrabold tracking-tight mt-1 block font-mono">
                    ₹ {Math.round(statistics.myShare).toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[9px] text-emerald-200 mt-2 flex items-center gap-0.5 font-semibold">
                  <TrendingUp className="w-3" /> Commission I Kept
                </span>
              </div>

              {/* Sub Agents share Distributed */}
              <div className="bg-teal-700 rounded-2xl text-white p-4 shadow-lg shadow-teal-700/10 hover:shadow-teal-700/15 transition-all flex flex-col justify-between col-span-2 md:col-span-1">
                <div>
                  <span className="text-teal-100 text-[10px] uppercase font-bold tracking-wider block">Sub-Agent Share</span>
                  <span className="text-xl font-bold tracking-tight mt-1 block font-mono">
                    ₹ {Math.round(statistics.agentShare).toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[9px] text-teal-200 mt-2 block font-semibold">
                  To give/pay to sub-agents
                </span>
              </div>

            </section>

            {/* 4. RECENT POLICIES SLIDER SECTION */}
            <section className="space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Recent Cases (Slide Deck)</h2>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Swipe Left to view more ➔</span>
              </div>

              {cases.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-full">
                    <Calculator className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-slate-500 text-sm">No stored policy records. Click Register New Case to add your first client details.</p>
                  <button
                    onClick={() => setIsNewCaseOpen(true)}
                    className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Add First Case
                  </button>
                </div>
              ) : (
                <div 
                  className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {cases.map((c, idx) => {
                    const isMotor = c.insuranceType === 'motor';
                    const styles = getCustomCardStyles(c.insuranceType, settings.typeColors);
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.45), ease: "easeOut" }}
                        onClick={() => setSelectedCase(c)}
                        className={`flex-shrink-0 w-80 bg-white hover:bg-slate-50 border-2 ${styles.borderClass} rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer snap-start relative overflow-hidden group`}
                      >
                        {/* Custom visual horizontal deck design layout */}
                        <div className={`absolute top-0 right-0 h-1 w-full bg-gradient-to-r ${styles.topBarClass}`} />
                        
                        <div className="flex items-start justify-between mb-3 mt-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles.badgeClass}`}>
                            {c.insuranceType === 'motor' && <Car className="w-3" />}
                            {c.insuranceType === 'life' && <Shield className="w-3" />}
                            {c.insuranceType === 'health' && <Heart className="w-3" />}
                            {c.insuranceType === 'loan' && <Coins className="w-3" />}
                            {c.insuranceType}
                          </span>

                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{c.policyDate}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Customer Name</span>
                            <div className="flex items-center justify-between gap-1.5 overflow-hidden">
                              <h3 className="font-extrabold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">{c.customerName}</h3>
                              {(() => {
                                const exp = getPolicyExpiryInfo(c.policyDate);
                                if (exp.daysLeft <= 0) {
                                  return (
                                    <span className="text-[8px] tracking-tight bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded flex-shrink-0 font-sans uppercase">
                                      Lapsed
                                    </span>
                                  );
                                } else if (exp.daysLeft <= 30) {
                                  return (
                                    <span className="text-[8px] tracking-tight bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded font-sans uppercase animate-pulse flex-shrink-0">
                                      Due: {exp.daysLeft}d
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Identifier / Vehicle</span>
                            <div className="space-y-1 mt-0.5">
                              <span className="text-xs font-bold font-mono text-indigo-700 block bg-slate-50/75 px-2 py-1 rounded-lg border border-slate-150 inline-block font-sans">
                                {isMotor ? (c.vehicleNumber || 'N/A') : `${c.policyCategory || 'Plan'}`}
                              </span>
                              {isMotor && (
                                <div className="text-[10px] text-slate-600 font-medium font-sans">
                                  {c.vehicleModel && (
                                    <div className="font-bold text-slate-700 font-sans tracking-tight">{c.vehicleModel}</div>
                                  )}
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[8px] px-1.5 py-0.2 rounded font-bold uppercase">
                                      {c.vehicleType || 'Private'}
                                    </span>
                                    <span className="bg-slate-100 text-slate-700 border border-slate-150 text-[8px] px-1.5 py-0.2 rounded font-extrabold uppercase font-mono">
                                      {c.motorPolicySubtype === 'own-damage' ? 'On-Damage (OD Only)' : c.motorPolicySubtype === 'third-party' ? 'Third-Party (TP Only)' : 'Bundle / Full Package'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <hr className="border-slate-100 my-2" />

                          <div className="grid grid-cols-2 gap-1 bg-slate-50/50 p-2 rounded-xl text-slate-650">
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-extrabold block">Policy Number</span>
                              <span className="text-[10px] font-semibold font-mono tracking-tight text-slate-700 line-clamp-1">{c.policyNumber}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-400 uppercase font-extrabold block">Insurer Provider</span>
                              <span className="text-[10px] font-semibold text-slate-700 line-clamp-1 flex items-center gap-0.5">
                                <Building2 className="w-2.5 h-2.5 text-slate-450 flex-shrink-0" />
                                <span className="truncate">{c.companyName}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <div className="text-slate-500 font-semibold font-mono">
                              Premium: ₹{Math.round(c.premiumAmount).toLocaleString('en-IN')}
                            </div>
                            <div className="text-emerald-700 font-bold font-mono">
                              My Share: ₹{Math.round(c.myCommissionAmount).toLocaleString('en-IN')}
                            </div>
                          </div>

                          {c.agentCommissionAmount > 0 && (
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/70 text-[10px]">
                              <span className="text-slate-400 font-semibold">
                                Agent Share (₹{Math.round(c.agentCommissionAmount).toLocaleString('en-IN')})
                              </span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleAgentPayment(c.id);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border cursor-pointer transition-all ${
                                  c.agentPaymentStatus === 'paid' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse'
                                }`}
                                title="Click to toggle payment status"
                              >
                                {c.agentPaymentStatus === 'paid' ? 'Paid ✓' : 'Outst. ⏳'}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 5. SEARCH, FILTER ACTION TOOLS AND CASES DIRECTORY LIST */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xs space-y-6">
              
              {/* Header Control */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Master Insurance Policy Register</h2>
                  <p className="text-slate-400 text-xs font-medium">List of all stored client cases, commissions breakdown, and quick action filters</p>
                </div>

                {/* Dynamic Search Box */}
                <div className="relative w-full md:w-72">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search client, policy, vehicle # or provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-slate-50/75"
                  />
                </div>
              </div>

              {/* Filter Category Tabs selection */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hidden">
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                    selectedTab === 'all' 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
                  }`}
                >
                  All Policies ({cases.length})
                </button>
                {[
                  { id: 'motor', label: 'Motor Insurance' },
                  { id: 'life', label: 'Life Insurance' },
                  { id: 'health', label: 'Health Insurance' },
                  { id: 'loan', label: 'Loan Shield Security' },
                ].map((tab) => {
                  const count = cases.filter(c => c.insuranceType === tab.id).length;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id as InsuranceType)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                        selectedTab === tab.id 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
                      }`}
                    >
                      {tab.label} ({count})
                    </button>
                  );
                })}
                
                {/* Renewals Alert Tab */}
                <button
                  onClick={() => setSelectedTab('renewals')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 border ${
                    selectedTab === 'renewals' 
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/10' 
                      : getRenewalsCount() > 0 
                        ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Renewals Alert ({getRenewalsCount()})</span>
                </button>
              </div>

              {/* Detailed Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                      <th className="p-3 font-semibold uppercase text-[10px] tracking-wider">Client Name & Policy Number</th>
                      <th className="p-3 font-semibold uppercase text-[10px] tracking-wider">Category / Vehicle Number</th>
                      <th className="p-3 font-semibold uppercase text-[10px] tracking-wider">Insurance Provider</th>
                      <th className="p-3 font-semibold uppercase text-[10px] tracking-wider text-right">Total Premium (incl. GST)</th>
                      <th className="p-3 font-semibold uppercase text-[10px] tracking-wider text-right">Advisor Net Revenue (₹)</th>
                      <th className="p-3 font-semibold uppercase text-[10px] tracking-wider text-right">Sub-Agent Share</th>
                      <th className="p-3 font-semibold uppercase text-[10px] tracking-wider text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCases.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No matching policy cases found in database.
                        </td>
                      </tr>
                    ) : (
                      filteredCases.map((c) => {
                        const isMotor = c.insuranceType === 'motor';
                        const styles = getCustomCardStyles(c.insuranceType, settings.typeColors);
                        return (
                          <tr 
                            key={c.id}
                            onClick={() => setSelectedCase(c)}
                            className={`hover:bg-slate-50/50 cursor-pointer transition-all border-l-4 ${styles.borderClass} group`}
                          >
                            {/* Client Detail Column */}
                            <td className="p-3">
                              <div className="font-semibold text-slate-850 flex flex-wrap items-center gap-2">
                                <span className="font-bold">{c.customerName}</span>
                                {(() => {
                                  const exp = getPolicyExpiryInfo(c.policyDate);
                                  if (exp.daysLeft <= 0) {
                                    return (
                                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-red-100 text-red-750 font-bold border border-red-200">
                                        LAPSED ({Math.abs(exp.daysLeft)} days ago)
                                      </span>
                                    );
                                  } else if (exp.daysLeft <= 30) {
                                    return (
                                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-100 text-amber-700 font-bold border border-amber-200 animate-pulse">
                                        RENEWAL DUE ({exp.daysLeft} days)
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5">
                                <span>Policy: {c.policyNumber}</span>
                                <span>•</span>
                                <span>Issued: {c.policyDate}</span>
                                <span>•</span>
                                <span className="font-bold text-slate-500">Expires: {getPolicyExpiryInfo(c.policyDate).expiryDate}</span>
                              </div>
                            </td>

                            {/* Category and Vehicle No */}
                            <td className="p-3">
                              {isMotor ? (
                                <div className="space-y-1">
                                  <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-800 text-[9px] px-1.5 rounded-md font-mono font-bold tracking-tight uppercase">
                                    {c.vehicleNumber}
                                  </span>
                                  {c.vehicleModel && (
                                    <div className="text-[10px] text-slate-800 font-extrabold font-sans leading-none">
                                      {c.vehicleModel}
                                    </div>
                                  )}
                                  <div className="text-[9px] text-slate-400 font-medium font-sans">
                                    Type: <strong className="text-slate-600 capitalize">{c.vehicleType || 'Private'}</strong>
                                  </div>
                                  <div className="text-[9px] text-slate-400">
                                    Coverage: <span className="inline-block bg-slate-100 text-slate-700 px-1 py-0.2 rounded text-[8px] font-bold uppercase font-mono">
                                      {c.motorPolicySubtype === 'own-damage' ? 'On-Damage (OD)' : c.motorPolicySubtype === 'third-party' ? 'Third Party (TP)' : 'Full Package'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="inline-block bg-teal-50 border border-teal-100 text-teal-800 text-[10px] px-1.5 rounded-md font-medium">
                                    {c.policyCategory || 'N/A'}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Carrier Company */}
                            <td className="p-3">
                              <div className="font-semibold text-slate-700 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="truncate max-w-[140px]">{c.companyName}</span>
                              </div>
                            </td>

                            {/* Premium Cost */}
                            <td className="p-3 text-right font-semibold font-mono text-slate-800">
                              ₹ {Math.round(c.totalAmountWithGst).toLocaleString('en-IN')}
                              <span className="block text-[9px] text-slate-400 font-normal font-sans">Base: ₹{Math.round(c.premiumAmount).toLocaleString('en-IN')}</span>
                            </td>

                            {/* My Commission Cut */}
                            <td className="p-3 text-right font-bold font-mono text-emerald-700">
                              ₹ {Math.round(c.myCommissionAmount).toLocaleString('en-IN')}
                              <span className="block text-[9px] text-slate-400 font-normal font-sans">Kept: {c.myPct}%</span>
                            </td>

                            {/* Agent/Sub-agent commission share */}
                            <td className="p-3 text-right">
                              <div className="font-mono font-bold text-teal-800">
                                ₹ {Math.round(c.agentCommissionAmount).toLocaleString('en-IN')}
                              </div>
                              <span className="block text-[9px] text-slate-400 font-normal font-mono">Share: {c.agentPct}%</span>
                              {c.agentCommissionAmount > 0 ? (
                                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleToggleAgentPayment(c.id)}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border cursor-pointer transition-all ${
                                      c.agentPaymentStatus === 'paid'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 animate-pulse'
                                    }`}
                                    title="Click to toggle payment status"
                                  >
                                    {c.agentPaymentStatus === 'paid' ? 'Paid ✓' : 'Outst. ⏳'}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[9px] italic block mt-1">No agent</span>
                              )}
                            </td>

                            {/* Action Items */}
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => handleEditCase(c, e)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors inline-block cursor-pointer"
                                  title="Edit Policy Parameters"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteCase(c.id, e)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors inline-block cursor-pointer"
                                  title="Delete Case"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Quick Analytics Stats Banner */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs leading-relaxed">
                <span className="text-slate-500 font-medium">
                  Note: Pursuant to IRDAI guidelines, commission percentages are calculated strictly on the base premium amount. GST taxes are excluded from brokerage variables.
                </span>
                <div className="flex gap-4 flex-shrink-0">
                  <span className="text-slate-500 font-mono font-medium">Total Brokerage: <strong className="text-slate-800 font-bold">₹{Math.round(statistics.brokerage).toLocaleString('en-IN')}</strong></span>
                  <span className="text-emerald-700 font-mono font-bold">Kept Margin: ₹{Math.round(statistics.myShare).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            </>
          )}

          </div>

          {/* 6. POLICY CASE DETAILS SLIP OVERLAY */}
          {selectedCase && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div 
                id="policy-details-slip"
                className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp font-sans"
              >
                
                {/* Invoice top banner badge */}
                <div className="flex items-center justify-between">
                  <div className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Summary & Payout Slip</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCase(null)} 
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Reciept Format visual representation */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-4 font-mono text-xs">
                  
                  {/* Agency / Carrier Info */}
                  <div className="text-center pb-3 border-b border-dashed border-slate-200">
                    <h3 className="font-extrabold text-sm text-slate-800 font-sans tracking-tight">{currentUser.agencyName}</h3>
                    <p className="text-[10px] text-slate-450 font-sans">{currentUser.fullName} • {currentUser.mobile}</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-mono">Invoice Date: {new Date().toLocaleDateString('en-US')}</p>
                  </div>

                  {/* Core details */}
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Policy Class:</span>
                      <span className="font-bold font-sans capitalize text-right text-slate-800">
                        {selectedCase.insuranceType}
                      </span>
                    </div>

                    {isEditingClientProfile ? (
                      <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 space-y-2.5 mt-1 font-sans">
                        <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">Update Client Profile</span>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Customer Name</label>
                          <input 
                            type="text" 
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 font-sans font-semibold"
                            value={editClientName}
                            onChange={(e) => setEditClientName(e.target.value)}
                            placeholder="Client full name..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">Contact Number (WhatsApp)</label>
                          <input 
                            type="text" 
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-800 font-mono"
                            value={editClientMobile}
                            onChange={(e) => setEditClientMobile(e.target.value)}
                            placeholder="Mobile contact..."
                          />
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              if (!editClientName.trim()) {
                                showToast("Customer name is required!");
                                return;
                              }
                              setCases(prev => prev.map(c => {
                                if (c.id === selectedCase.id) {
                                  return {
                                    ...c,
                                    customerName: editClientName.trim(),
                                    mobile: editClientMobile.trim()
                                  };
                                }
                                return c;
                              }));
                              setSelectedCase(prev => {
                                if (prev) {
                                  return {
                                    ...prev,
                                    customerName: editClientName.trim(),
                                    mobile: editClientMobile.trim()
                                  };
                                }
                                return null;
                              });
                              setIsEditingClientProfile(false);
                              showToast("Customer contact profile updated!");
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg cursor-pointer shadow-xs"
                          >
                            Save Direct
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingClientProfile(false);
                            }}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-[10px] rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-100/40 p-2.5 rounded-xl border border-slate-200/40 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[11px] text-slate-450 font-sans">Name:</span>
                            <span className="font-extrabold text-slate-900 font-sans truncate text-xs">{selectedCase.customerName}</span>
                          </div>
                          <div className="text-[10px] text-slate-450 font-sans flex items-center gap-1.5 mt-0.5">
                            <span>Phone:</span>
                            <span className="font-bold text-slate-750 font-mono">{selectedCase.mobile || 'N/A'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEditClientName(selectedCase.customerName);
                            setEditClientMobile(selectedCase.mobile || '');
                            setIsEditingClientProfile(true);
                          }}
                          className="px-2 py-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 rounded-lg cursor-pointer transition-colors shrink-0"
                          title="Edit Customer Profile Information Directly"
                        >
                          Edit Profile
                        </button>
                      </div>
                    )}

                    {selectedCase.insuranceType === 'motor' ? (
                      <div className="space-y-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-150">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-indigo-900 font-sans font-medium">Vehicle ID Number:</span>
                          <span className="font-bold text-indigo-900 font-mono bg-indigo-100 px-2 py-0.5 rounded-md">{selectedCase.vehicleNumber}</span>
                        </div>
                        {selectedCase.vehicleModel && (
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500 font-sans">Vehicle Make & Model:</span>
                            <span className="font-bold text-slate-800 font-sans capitalize">{selectedCase.vehicleModel}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-sans">Vehicle Category:</span>
                          <span className="font-bold text-slate-800 font-sans uppercase">{selectedCase.vehicleType}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 font-sans">Policy Subtype:</span>
                          <span className="font-bold text-slate-800 font-sans uppercase text-[10px] bg-slate-205 px-1.5 py-0.2 rounded">
                            {selectedCase.motorPolicySubtype === 'own-damage' ? 'On-Damage (OD Only)' : selectedCase.motorPolicySubtype === 'third-party' ? 'Third-Party (TP Only)' : 'Full Package / Bundle'}
                          </span>
                        </div>
                        {selectedCase.odPremium !== undefined && selectedCase.odPremium > 0 && (
                          <div className="flex justify-between text-[11px] border-t border-indigo-150/40 pt-1.5">
                            <span className="text-slate-500 font-sans">Own Damage (OD) Premium:</span>
                            <span className="font-semibold text-indigo-900">₹ {selectedCase.odPremium.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedCase.tpPremium !== undefined && selectedCase.tpPremium > 0 && (
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500 font-sans">Third Party (TP) Premium:</span>
                            <span className="font-semibold text-indigo-900">₹ {selectedCase.tpPremium.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Policy Category:</span>
                        <span className="font-bold text-slate-850 font-sans text-right">{selectedCase.policyCategory || 'N/A'}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Policy Number:</span>
                      <span className="font-bold text-slate-800 font-mono tracking-wide">{selectedCase.policyNumber}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Insurance Company:</span>
                      <span className="font-bold text-slate-800 font-sans text-right">{selectedCase.companyName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Policy Issue Date:</span>
                      <span className="font-bold text-slate-808">{selectedCase.policyDate}</span>
                    </div>

                    <div className="flex justify-between border-t border-slate-100 pt-1 text-[11px]">
                      <span className="text-slate-500 font-sans">Policy Expiry Date:</span>
                      <span className="font-extrabold text-amber-900">{getPolicyExpiryInfo(selectedCase.policyDate).expiryDate}</span>
                    </div>
                  </div>

                  <hr className="border-dashed border-slate-200" />

                  {/* Pricing and Taxes Details */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-sans">
                        {selectedCase.insuranceType === 'motor' ? 'Calculated Net Premium:' : 'Base Premium Amount:'}
                      </span>
                      <span className="font-bold text-slate-800 font-mono">₹ {selectedCase.premiumAmount.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-sans">GST Tax Amount ({selectedCase.gstPercent}%):</span>
                      <span className="text-slate-600 font-mono">₹ {Math.round(selectedCase.totalAmountWithGst - selectedCase.premiumAmount).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-150">
                      <span className="text-slate-805 font-sans">Total Cost (incl. GST):</span>
                      <span className="text-emerald-800 font-mono text-sm">₹ {selectedCase.totalAmountWithGst.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <hr className="border-dashed border-slate-200" />

                  {/* Calculations breakdown split details list */}
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-150 text-[11px]">
                    <h4 className="font-extrabold text-[10px] uppercase text-indigo-800 font-sans tracking-wide mb-1 flex items-center gap-1">
                      <Percent className="w-3" /> Policy Commissions Breakdown
                    </h4>

                    {selectedCase.insuranceType === 'motor' && (
                      <div className="text-[10px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-150 font-sans mb-1.5 leading-normal">
                        <strong>Commission Baseline Component:</strong> {
                          selectedCase.commissionPayoutOn === 'od' ? (
                            `Calculated on the Own Damage (OD) Premium portion (₹${selectedCase.odPremium?.toLocaleString('en-IN')}) as requested.`
                          ) : selectedCase.commissionPayoutOn === 'tp' ? (
                            `Calculated on the Third-Party (TP) Premium portion (₹${selectedCase.tpPremium?.toLocaleString('en-IN')}) as requested.`
                          ) : (
                            `Calculated on overall Net Premium (₹${selectedCase.premiumAmount?.toLocaleString('en-IN')}) as per Net payout standards.`
                          )
                        }
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Total Company Payout ({selectedCase.companyPct}%):</span>
                      <span className="font-semibold text-slate-850 font-mono">₹ {selectedCase.totalCommissionReceived.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-sm mt-1">
                      <span className="font-sans">My Kept Share ({selectedCase.myPct}%):</span>
                      <span className="font-mono">₹ {selectedCase.myCommissionAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-teal-850 font-bold bg-teal-50 px-2 py-1 rounded-sm">
                      <span className="font-sans">Paid to Sub-Agent ({selectedCase.agentPct}%):</span>
                      <span className="font-mono">₹ {selectedCase.agentCommissionAmount.toLocaleString('en-IN')}</span>
                    </div>

                    {selectedCase.agentCommissionAmount > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-500 font-semibold font-sans text-[10px]">Sub-Agent Payment Status:</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            selectedCase.agentPaymentStatus === 'paid' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                          }`}>
                            {selectedCase.agentPaymentStatus === 'paid' ? 'Paid ✓' : 'Outstanding / Pending ⏳'}
                          </span>
                          <button
                            onClick={() => handleToggleAgentPayment(selectedCase.id)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-bold cursor-pointer"
                          >
                            Toggle
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedCase.remarks && (
                    <div className="text-[10px] text-slate-500 font-sans italic bg-white p-2 rounded-lg border border-slate-100">
                      <strong>Remarks / Notes:</strong> {selectedCase.remarks}
                    </div>
                  )}

                </div>

                {/* Closing action */}
                <div className="flex flex-col gap-2">
                  <a
                    href={getWhatsAppShareLink(selectedCase)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl text-center cursor-pointer font-sans flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                    <span>Share Details on WhatsApp</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => generateCasePDF(selectedCase)}
                      className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl text-center cursor-pointer font-sans flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                    >
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={(e) => {
                        const caseToEdit = selectedCase;
                        setSelectedCase(null);
                        handleEditCase(caseToEdit, e);
                      }}
                      className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl text-center cursor-pointer font-sans flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Edit & Revise</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`Insurance Policy Slip: Customer ${selectedCase.customerName}, Premium amount ₹${selectedCase.totalAmountWithGst} [Including GST], Policy No: ${selectedCase.policyNumber}, Insurer: ${selectedCase.companyName}. Total commission received from company: ₹${selectedCase.totalCommissionReceived}, Kept share: ₹${selectedCase.myCommissionAmount}, Sub-Agent share: ₹${selectedCase.agentCommissionAmount}.`);
                        showToast('Policy report values written safely to clipboard!');
                      }}
                      className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl text-center cursor-pointer font-sans"
                    >
                      Copy Details
                    </button>
                    <button
                      onClick={() => setSelectedCase(null)}
                      className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center cursor-pointer font-sans"
                    >
                      Close
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* FLOATING ACTION BOTTOM ADD BUTTON FOR NEW CASES RECORD */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => { setEditingCase(null); setIsNewCaseOpen(true); }}
              className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 group ring-4 ring-emerald-500/10 cursor-pointer"
              title="Add New Case"
              id="btn-add-case"
            >
              <Plus className="w-6 h-6 transition-transform group-hover:rotate-90 text-white" />
              <span className="text-sm font-bold pr-1 font-sans hidden sm:inline">Register New Case</span>
            </button>
          </div>

          {/* COMPONENT MODAL INVOCATION */}
          <NewCaseModal 
            isOpen={isNewCaseOpen}
            onClose={() => setIsNewCaseOpen(false)}
            onSave={handleSaveCase}
            defaultGstPercent={settings.defaultGstPercent}
            editingCase={editingCase}
          />

        </div>
      )}

    </div>
  );
}
