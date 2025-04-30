import React, { useState, useEffect } from 'react';

const HomePurchase = () => {
  // Property type selection
  const [propertyType, setPropertyType] = useState('median-single-family');
  
  // March 2024 scenario inputs
  const [homePriceMarch2024, setHomePriceMarch2024] = useState(650000); // Median Miami single-family home price Q1 2024
  const [downPaymentPercentMarch2024, setDownPaymentPercentMarch2024] = useState(20);
  const [mortgageRateMarch2024, setMortgageRateMarch2024] = useState(6.8);
  const [mortgageTermMarch2024, setMortgageTermMarch2024] = useState(30);
  
  // April 2025 scenario inputs
  const [homePriceAppreciationPercent, setHomePriceAppreciationPercent] = useState(0.34);
  const [homePriceApril2025, setHomePriceApril2025] = useState(690000);
  const [downPaymentPercentApril2025, setDownPaymentPercentApril2025] = useState(20);
  const [mortgageRateApril2025, setMortgageRateApril2025] = useState(6.2);
  const [mortgageTermApril2025, setMortgageTermApril2025] = useState(30);
  
  // Costs during waiting period
  const [monthlyRent, setMonthlyRent] = useState(2850); // Median rent for comparable property
  const [investmentReturnRate, setInvestmentReturnRate] = useState(10);
  
  // Additional costs
  const [annualPropertyTaxRate, setAnnualPropertyTaxRate] = useState(1.05);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState(4480); // 0.8% of home value for Miami
  const [monthlyHOA, setMonthlyHOA] = useState(0); // 0 for single-family, higher for condos
  const [annualMaintenance, setAnnualMaintenance] = useState(5600); // 1% of home value
  const [closingCostsPercent, setClosingCostsPercent] = useState(3);
  
  // Auto-calculation flags
  const [autoCalculateInsurance, setAutoCalculateInsurance] = useState(true);
  const [autoCalculateMaintenance, setAutoCalculateMaintenance] = useState(true);
  const [autoCalculateRent, setAutoCalculateRent] = useState(true);

  {/*variables for long term  */}
  // Long-term results
  const [showLongTermResults, setShowLongTermResults] = useState(false);
  const [longTermResults, setLongTermResults] = useState({
    fiveYear: {
      march2024: {
        homeValue: 0,
        principalPaid: 0,
        totalEquity: 0,
        totalCosts: 0,
        netPosition: 0
      },
      april2025: {
        homeValue: 0,
        principalPaid: 0,
        totalEquity: 0,
        totalCosts: 0,
        investmentReturns: 0,
        netPosition: 0
      },
      difference: 0,
      recommendation: ''
    },
    tenYear: {
      march2024: {
        homeValue: 0,
        principalPaid: 0,
        totalEquity: 0,
        totalCosts: 0,
        netPosition: 0
      },
      april2025: {
        homeValue: 0,
        principalPaid: 0,
        totalEquity: 0,
        totalCosts: 0,
        investmentReturns: 0,
        netPosition: 0
      },
      difference: 0,
      recommendation: ''
    }
  });
  
  // Results
  const [results, setResults] = useState({
    march2024: {
      totalCost: 0,
      equity: 0,
      netPosition: 0
    },
    april2025: {
      totalCost: 0,
      investmentReturns: 0,
      netPosition: 0
    },
    difference: 0,
    recommendation: ''
  });

  // Update April 2025 home price when appreciation changes
  useEffect(() => {
    const newPrice = homePriceMarch2024 * (1 + homePriceAppreciationPercent / 100);
    setHomePriceApril2025(Math.round(newPrice));
  }, [homePriceMarch2024, homePriceAppreciationPercent]);

  const calculateResults = () => {
    // Calculate down payments
    const downPaymentMarch2024 = homePriceMarch2024 * (downPaymentPercentMarch2024 / 100);
    const downPaymentApril2025 = homePriceApril2025 * (downPaymentPercentApril2025 / 100);
    
    // Calculate loan amounts
    const loanAmountMarch2024 = homePriceMarch2024 - downPaymentMarch2024;
    const loanAmountApril2025 = homePriceApril2025 - downPaymentApril2025;
    
    // Calculate monthly mortgage payments
    const monthlyInterestRateMarch2024 = mortgageRateMarch2024 / 100 / 12;
    const numberOfPaymentsMarch2024 = mortgageTermMarch2024 * 12;
    const monthlyMortgagePaymentMarch2024 = loanAmountMarch2024 * 
      (monthlyInterestRateMarch2024 * Math.pow(1 + monthlyInterestRateMarch2024, numberOfPaymentsMarch2024)) / 
      (Math.pow(1 + monthlyInterestRateMarch2024, numberOfPaymentsMarch2024) - 1);
    
    const monthlyInterestRateApril2025 = mortgageRateApril2025 / 100 / 12;
    const numberOfPaymentsApril2025 = mortgageTermApril2025 * 12;
    const monthlyMortgagePaymentApril2025 = loanAmountApril2025 * 
      (monthlyInterestRateApril2025 * Math.pow(1 + monthlyInterestRateApril2025, numberOfPaymentsApril2025)) / 
      (Math.pow(1 + monthlyInterestRateApril2025, numberOfPaymentsApril2025) - 1);
    
    // Calculate monthly property tax
    const monthlyPropertyTaxMarch2024 = (homePriceMarch2024 * (annualPropertyTaxRate / 100)) / 12;
    const monthlyPropertyTaxApril2025 = (homePriceApril2025 * (annualPropertyTaxRate / 100)) / 12;
    
    // Calculate monthly insurance
    const monthlyInsurance = annualHomeInsurance / 12;
    console.log("monthly", monthlyMortgagePaymentMarch2024)
    
    // Calculate total monthly payment (PITI + HOA)
    const totalMonthlyPaymentMarch2024 = monthlyMortgagePaymentMarch2024 + monthlyPropertyTaxMarch2024 + monthlyInsurance + monthlyHOA;
    const totalMonthlyPaymentApril2025 = monthlyMortgagePaymentApril2025 + monthlyPropertyTaxApril2025 + monthlyInsurance + monthlyHOA;
    
    // Calculate total payments over the waiting period (13 months)
    const totalPaymentsMarch2024 = totalMonthlyPaymentMarch2024 * 13;
    
    // Calculate principal paid during the waiting period
    const principalPaidMarch2024 = calculatePrincipalPaid(loanAmountMarch2024, monthlyInterestRateMarch2024, monthlyMortgagePaymentMarch2024, 13);
    
    
    
    // Calculate home equity after waiting period
    const equityMarch2024 = downPaymentMarch2024 + principalPaidMarch2024 + (homePriceApril2025 - homePriceMarch2024);
    
    // Calculate total rent paid
    const totalRentPaid = monthlyRent * 13;
    
    // Calculate investment returns on down payment
    const investmentReturns = downPaymentApril2025 * (investmentReturnRate / 100 * (13 / 12));
    
    // Calculate closing costs for both scenarios
    const closingCostsMarch2024 = homePriceMarch2024 * (closingCostsPercent / 100);
    const closingCostsApril2025 = homePriceApril2025 * (closingCostsPercent / 100);
    
    // Calculate maintenance costs avoided
    const maintenanceAvoided = annualMaintenance * (13 / 12);
    
    // Calculate net position for each scenario
    const march2024NetPosition = equityMarch2024 - totalPaymentsMarch2024 - closingCostsMarch2024 - (annualMaintenance * (13 / 12));
    const april2025NetPosition = investmentReturns - totalRentPaid - closingCostsApril2025;
    
    // Calculate difference
    const difference = april2025NetPosition - march2024NetPosition;
    
    
    // Determine recommendation
    const recommendation = difference > 0 
      ? "Waiting to purchase was financially advantageous."
      : "Purchasing in March 2024 would have been better financially.";
    
    setResults({
      march2024: {
        totalCost: Math.round(totalPaymentsMarch2024 + closingCostsMarch2024 + maintenanceAvoided),
        equity: Math.round(equityMarch2024),
        netPosition: Math.round(march2024NetPosition)
      },
      april2025: {
        totalCost: Math.round(totalRentPaid + closingCostsApril2025),
        investmentReturns: Math.round(investmentReturns),
        netPosition: Math.round(april2025NetPosition)
      },
      difference: Math.round(difference),
      recommendation: recommendation
    });
  };
  
  // Helper function to calculate principal paid during the waiting period
  const calculatePrincipalPaid = (loanAmount, monthlyInterestRate, monthlyPayment, months) => {
    let balance = loanAmount;
    let totalPrincipal = 0;
    
    for (let i = 0; i < months; i++) {
      const interestPayment = balance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      totalPrincipal += principalPayment;
      balance -= principalPayment;
    }
    
    return totalPrincipal;
  };
  
  {/*helper function for long term*/}
  // Helper functions to calculate future home value
const calculateFutureHomeValue = (initialValue, annualAppreciationRate, years) => {
  return initialValue * Math.pow(1 + annualAppreciationRate / 100, years);
};

// Helper function to calculate principal paid over multiple years
const calculatePrincipalPaidLongTerm = (loanAmount, monthlyInterestRate, monthlyPayment, months) => {
  let balance = loanAmount;
  let totalPrincipal = 0;
  
  for (let i = 0; i < months; i++) {
    const interestPayment = balance * monthlyInterestRate;
    const principalPayment = monthlyPayment - interestPayment;
    totalPrincipal += principalPayment;
    balance -= principalPayment;
  }
  
  return totalPrincipal;
};

//calculate long term results
const calculateLongTermResults = () => {
  // Calculate down payments
  const downPaymentMarch2024 = homePriceMarch2024 * (downPaymentPercentMarch2024 / 100);
  const downPaymentApril2025 = homePriceApril2025 * (downPaymentPercentApril2025 / 100);
  
  // Calculate loan amounts
  const loanAmountMarch2024 = homePriceMarch2024 - downPaymentMarch2024;
  const loanAmountApril2025 = homePriceApril2025 - downPaymentApril2025;
  
  // Calculate monthly mortgage payments
  const monthlyInterestRateMarch2024 = mortgageRateMarch2024 / 100 / 12;
  const numberOfPaymentsMarch2024 = mortgageTermMarch2024 * 12;
  const monthlyMortgagePaymentMarch2024 = loanAmountMarch2024 * 
    (monthlyInterestRateMarch2024 * Math.pow(1 + monthlyInterestRateMarch2024, numberOfPaymentsMarch2024)) / 
    (Math.pow(1 + monthlyInterestRateMarch2024, numberOfPaymentsMarch2024) - 1);
  
  const monthlyInterestRateApril2025 = mortgageRateApril2025 / 100 / 12;
  const numberOfPaymentsApril2025 = mortgageTermApril2025 * 12;
  const monthlyMortgagePaymentApril2025 = loanAmountApril2025 * 
    (monthlyInterestRateApril2025 * Math.pow(1 + monthlyInterestRateApril2025, numberOfPaymentsApril2025)) / 
    (Math.pow(1 + monthlyInterestRateApril2025, numberOfPaymentsApril2025) - 1);
  
  // Calculate monthly property tax
  const monthlyPropertyTaxMarch2024 = (homePriceMarch2024 * (annualPropertyTaxRate / 100)) / 12;
  const monthlyPropertyTaxApril2025 = (homePriceApril2025 * (annualPropertyTaxRate / 100)) / 12;
  
  // Calculate monthly insurance
  const monthlyInsurance = annualHomeInsurance / 12;
  
  // Calculate total monthly payment (PITI + HOA)
  const totalMonthlyPaymentMarch2024 = monthlyMortgagePaymentMarch2024 + monthlyPropertyTaxMarch2024 + monthlyInsurance + monthlyHOA;
  const totalMonthlyPaymentApril2025 = monthlyMortgagePaymentApril2025 + monthlyPropertyTaxApril2025 + monthlyInsurance + monthlyHOA;
  
  // Annual appreciation rate (convert from percentage)
  const annualAppreciationRate = homePriceAppreciationPercent;
  
  // Calculate monthly maintenance
  const monthlyMaintenance = annualMaintenance / 12;
  
  // Initial rent paid before April 2025 purchase (13 months)
  const initialRentPaid = monthlyRent * 13;
  
  // Initial investment returns before April 2025 purchase
  const initialInvestmentReturns = downPaymentApril2025 * (investmentReturnRate / 100 * (13 / 12));
  
  // Calculate closing costs
  const closingCostsMarch2024 = homePriceMarch2024 * (closingCostsPercent / 100);
  const closingCostsApril2025 = homePriceApril2025 * (closingCostsPercent / 100);
  
  // 5-year calculations (60 months from March 2024, 47 months from April 2025)
  // Future home values
  const homeValueMarch2024After5Years = calculateFutureHomeValue(homePriceMarch2024, annualAppreciationRate, 5);
  const homeValueApril2025After5Years = calculateFutureHomeValue(homePriceApril2025, annualAppreciationRate, 4);
  
  // Principal paid
  const principalPaidMarch2024After5Years = calculatePrincipalPaidLongTerm(
    loanAmountMarch2024, 
    monthlyInterestRateMarch2024, 
    monthlyMortgagePaymentMarch2024, 
    60
  );
  
  const principalPaidApril2025After5Years = calculatePrincipalPaidLongTerm(
    loanAmountApril2025, 
    monthlyInterestRateApril2025, 
    monthlyMortgagePaymentApril2025, 
    47
  );
  
  // Total equity
  const totalEquityMarch2024After5Years = downPaymentMarch2024 + principalPaidMarch2024After5Years + 
    (homeValueMarch2024After5Years - homePriceMarch2024);
  
  const totalEquityApril2025After5Years = downPaymentApril2025 + principalPaidApril2025After5Years + 
    (homeValueApril2025After5Years - homePriceApril2025);
  
  // Total costs for March 2024 purchase after 5 years
  const totalCostsMarch2024After5Years = (totalMonthlyPaymentMarch2024 * 60) + 
    (monthlyMaintenance * 60) + closingCostsMarch2024;
  
  // Total costs for April 2025 purchase after 5 years (including initial 13 months of rent)
  const totalCostsApril2025After5Years = initialRentPaid + (totalMonthlyPaymentApril2025 * 47) + 
    (monthlyMaintenance * 47) + closingCostsApril2025;
  
  // Net positions after 5 years
  const netPositionMarch2024After5Years = totalEquityMarch2024After5Years - totalCostsMarch2024After5Years;
  const netPositionApril2025After5Years = totalEquityApril2025After5Years - totalCostsApril2025After5Years + initialInvestmentReturns;
  const difference5Year = netPositionApril2025After5Years - netPositionMarch2024After5Years;
  
  // 10-year calculations (120 months from March 2024, 107 months from April 2025)
  // Future home values
  const homeValueMarch2024After10Years = calculateFutureHomeValue(homePriceMarch2024, annualAppreciationRate, 10);
  const homeValueApril2025After10Years = calculateFutureHomeValue(homePriceApril2025, annualAppreciationRate, 9);
  
  // Principal paid
  const principalPaidMarch2024After10Years = calculatePrincipalPaidLongTerm(
    loanAmountMarch2024, 
    monthlyInterestRateMarch2024, 
    monthlyMortgagePaymentMarch2024, 
    120
  );
  
  const principalPaidApril2025After10Years = calculatePrincipalPaidLongTerm(
    loanAmountApril2025, 
    monthlyInterestRateApril2025, 
    monthlyMortgagePaymentApril2025, 
    107
  );
  
  // Total equity
  const totalEquityMarch2024After10Years = downPaymentMarch2024 + principalPaidMarch2024After10Years + 
    (homeValueMarch2024After10Years - homePriceMarch2024);
  
  const totalEquityApril2025After10Years = downPaymentApril2025 + principalPaidApril2025After10Years + 
    (homeValueApril2025After10Years - homePriceApril2025);
  
  // Total costs for March 2024 purchase after 10 years
  const totalCostsMarch2024After10Years = (totalMonthlyPaymentMarch2024 * 120) + 
    (monthlyMaintenance * 120) + closingCostsMarch2024;
  
  // Total costs for April 2025 purchase after 10 years (including initial 13 months of rent)
  const totalCostsApril2025After10Years = initialRentPaid + (totalMonthlyPaymentApril2025 * 107) + 
    (monthlyMaintenance * 107) + closingCostsApril2025;
  
  // Net positions after 10 years
  const netPositionMarch2024After10Years = totalEquityMarch2024After10Years - totalCostsMarch2024After10Years;
  const netPositionApril2025After10Years = totalEquityApril2025After10Years - totalCostsApril2025After10Years + initialInvestmentReturns;
  const difference10Year = netPositionApril2025After10Years - netPositionMarch2024After10Years;
  
  // Determine recommendations
  const recommendation5Year = difference5Year > 0 
    ? "Waiting to purchase was financially advantageous over 5 years."
    : "Purchasing in March 2024 would have been better financially over 5 years.";
  
  const recommendation10Year = difference10Year > 0 
    ? "Waiting to purchase was financially advantageous over 10 years."
    : "Purchasing in March 2024 would have been better financially over 10 years.";
  
  setLongTermResults({
    fiveYear: {
      march2024: {
        homeValue: Math.round(homeValueMarch2024After5Years),
        principalPaid: Math.round(principalPaidMarch2024After5Years),
        totalEquity: Math.round(totalEquityMarch2024After5Years),
        totalCosts: Math.round(totalCostsMarch2024After5Years),
        netPosition: Math.round(netPositionMarch2024After5Years)
      },
      april2025: {
        homeValue: Math.round(homeValueApril2025After5Years),
        principalPaid: Math.round(principalPaidApril2025After5Years),
        totalEquity: Math.round(totalEquityApril2025After5Years),
        totalCosts: Math.round(totalCostsApril2025After5Years),
        investmentReturns: Math.round(initialInvestmentReturns),
        netPosition: Math.round(netPositionApril2025After5Years)
      },
      difference: Math.round(difference5Year),
      recommendation: recommendation5Year
    },
    tenYear: {
      march2024: {
        homeValue: Math.round(homeValueMarch2024After10Years),
        principalPaid: Math.round(principalPaidMarch2024After10Years),
        totalEquity: Math.round(totalEquityMarch2024After10Years),
        totalCosts: Math.round(totalCostsMarch2024After10Years),
        netPosition: Math.round(netPositionMarch2024After10Years)
      },
      april2025: {
        homeValue: Math.round(homeValueApril2025After10Years),
        principalPaid: Math.round(principalPaidApril2025After10Years),
        totalEquity: Math.round(totalEquityApril2025After10Years),
        totalCosts: Math.round(totalCostsApril2025After10Years),
        investmentReturns: Math.round(initialInvestmentReturns),
        netPosition: Math.round(netPositionApril2025After10Years)
      },
      difference: Math.round(difference10Year),
      recommendation: recommendation10Year
    }
  });
};
  
  // Calculate results when inputs change
  useEffect(() => {
    calculateResults();
    calculateLongTermResults();
  }, [
    homePriceMarch2024, downPaymentPercentMarch2024, mortgageRateMarch2024, mortgageTermMarch2024,
    homePriceAppreciationPercent, homePriceApril2025, downPaymentPercentApril2025, mortgageRateApril2025, mortgageTermApril2025,
    monthlyRent, investmentReturnRate, annualPropertyTaxRate, annualHomeInsurance, monthlyHOA, annualMaintenance, closingCostsPercent
  ]);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  useEffect(() => {
    // Set defaults based on property type
    if (propertyType === 'median-single-family') {
      setHomePriceMarch2024(650000);
      setMonthlyHOA(0);
      if (autoCalculateRent) setMonthlyRent(3990);
    } else if (propertyType === 'median-condo') {
      setHomePriceMarch2024(450000);
      setMonthlyHOA(450);
      if (autoCalculateRent) setMonthlyRent(2700);
    } else if (propertyType === 'starter') {
      setHomePriceMarch2024(450000);
      setMonthlyHOA(250);
      if (autoCalculateRent) setMonthlyRent(1800);
    } else if (propertyType === 'mid-market') {
      setHomePriceMarch2024(640000);
      setMonthlyHOA(300);
      if (autoCalculateRent) setMonthlyRent(3840);
    } else if (propertyType === 'luxury') {
      setHomePriceMarch2024(2200000);
      setMonthlyHOA(850);
      if (autoCalculateRent) setMonthlyRent(13200);
    } else if (propertyType === 'ultra-luxury') {
      setHomePriceMarch2024(3984000);
      setMonthlyHOA(1200);
      if (autoCalculateRent) setMonthlyRent(23904);
    } else if (propertyType === 'coral-gables') {
      setHomePriceMarch2024(1687500);
      setMonthlyHOA(600);
      if (autoCalculateRent) setMonthlyRent(10125);
    }
  
    // Update home price April 2025 based on appreciation
    const newPrice = homePriceMarch2024 * (1 + homePriceAppreciationPercent / 100);
    setHomePriceApril2025(Math.round(newPrice));
  
    // Auto-calculate other costs based on home price
    if (autoCalculateInsurance) {
      const insuranceRate = propertyType === 'median-condo' ? 0.7 : 0.8;
      setAnnualHomeInsurance(Math.round(homePriceMarch2024 * insuranceRate / 100));
    }
  
    if (autoCalculateMaintenance) {
      const maintenanceRate = propertyType === 'median-condo' ? 0.75 : 1.0;
      setAnnualMaintenance(Math.round(homePriceMarch2024 * maintenanceRate / 100));
    }
  }, [
    propertyType,
    homePriceAppreciationPercent,
    autoCalculateInsurance,
    autoCalculateMaintenance,
    autoCalculateRent
  ]);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Home Purchase Timing Calculator: March 2024 vs. April 2025</h1>
      
      
      {/* Property Type Selection */}
<div className="mb-6 bg-yellow-50 p-4 rounded-lg">
  <h2 className="text-xl font-bold mb-4">Select Property Type</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

    <button
      title="All SFH across Miami"
      className={`p-2 rounded-md text-sm ${propertyType === 'median-single-family' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setPropertyType('median-single-family')}
    >
      Median Single Family
    </button>

    <button
      title="All Condos in Miami"
      className={`p-2 rounded-md text-sm ${propertyType === 'median-condo' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setPropertyType('median-condo')}
    >
      Median Condos
    </button>

    <button
      title="SFH with up to 2 Beds and <1250 sqft"
      className={`p-2 rounded-md text-sm ${propertyType === 'starter' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setPropertyType('starter')}
    >
      Starter Homes
    </button>

    <button
      title="SFH with 3–4 Beds and 1250–2500 sqft"
      className={`p-2 rounded-md text-sm ${propertyType === 'mid-market' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setPropertyType('mid-market')}
    >
      Mid Market Homes
    </button>

    <button
      title="SFH with 4+ Beds and 3000+ sqft"
      className={`p-2 rounded-md text-sm ${propertyType === 'luxury' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setPropertyType('luxury')}
    >
      Luxury Homes
    </button>

    <button
      title="SFH with 5+ Beds, 4000+ sqft, and 4+ Baths"
      className={`p-2 rounded-md text-sm ${propertyType === 'ultra-luxury' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setPropertyType('ultra-luxury')}
    >
      Ultra Luxury Homes
    </button>

    <button
      title="SFHs in Coral Gables"
      className={`p-2 rounded-md text-sm ${propertyType === 'coral-gables' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
      onClick={() => setPropertyType('coral-gables')}
    >
      Coral Gables Homes
    </button>

  </div>
</div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* March 2024 Scenario */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">March 2024 Scenario</h2>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Home Price in March 2024</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">$</span>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-r-md"
                value={homePriceMarch2024}
                onChange={(e) => setHomePriceMarch2024(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Down Payment %</label>
            <div className="flex">
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-l-md"
                value={downPaymentPercentMarch2024}
                onChange={(e) => setDownPaymentPercentMarch2024(Number(e.target.value))}
              />
              <span className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">%</span>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Mortgage Rate %</label>
            <div className="flex">
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-l-md"
                value={mortgageRateMarch2024}
                onChange={(e) => setMortgageRateMarch2024(Number(e.target.value))}
              />
              <span className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">%</span>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Mortgage Term (Years)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={mortgageTermMarch2024}
              onChange={(e) => setMortgageTermMarch2024(Number(e.target.value))}
            />
          </div>
        </div>
        
        {/* April 2025 Scenario */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-4">April 2025 Scenario</h2>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Home Price Appreciation %</label>
            <div className="flex">
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-l-md"
                value={homePriceAppreciationPercent}
                onChange={(e) => setHomePriceAppreciationPercent(Number(e.target.value))}
              />
              <span className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">%</span>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Home Price in April 2025</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">$</span>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-r-md"
                value={homePriceApril2025}
                onChange={(e) => setHomePriceApril2025(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Down Payment %</label>
            <div className="flex">
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-l-md"
                value={downPaymentPercentApril2025}
                onChange={(e) => setDownPaymentPercentApril2025(Number(e.target.value))}
              />
              <span className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">%</span>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Mortgage Rate %</label>
            <div className="flex">
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-l-md"
                value={mortgageRateApril2025}
                onChange={(e) => setMortgageRateApril2025(Number(e.target.value))}
              />
              <span className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">%</span>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Mortgage Term (Years)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={mortgageTermApril2025}
              onChange={(e) => setMortgageTermApril2025(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      
      {/* Costs During Waiting Period */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Costs During Waiting Period</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Monthly Rent</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">$</span>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-r-md"
                value={monthlyRent}
                onChange={(e) => {
                  setMonthlyRent(Number(e.target.value));
                  setAutoCalculateRent(false);
                }}
              />
            </div>
            <div className="flex items-center mt-1">
              <input
                type="checkbox"
                id="autoRent"
                checked={autoCalculateRent}
                onChange={(e) => setAutoCalculateRent(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="autoRent" className="text-xs text-gray-500">Auto-calculate based on property type</label>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Investment Return Rate % (Annual)</label>
            <div className="flex">
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-l-md"
                value={investmentReturnRate}
                onChange={(e) => setInvestmentReturnRate(Number(e.target.value))}
              />
              <span className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">S&P 500 historical avg: ~10% | 2024-2025 performance: varies</p>
          </div>
        </div>
      </div>
      
      {/* Additional Costs */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Additional Costs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Property Tax Rate % (Annual)</label>
            <div className="flex">
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-l-md"
                value={annualPropertyTaxRate}
                onChange={(e) => setAnnualPropertyTaxRate(Number(e.target.value))}
              />
              <span className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Miami-Dade typical: 0.97-1.05%</p>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Homeowners Insurance (Annual)</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">$</span>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-r-md"
                value={annualHomeInsurance}
                onChange={(e) => {
                  setAnnualHomeInsurance(Number(e.target.value));
                  setAutoCalculateInsurance(false);
                }}
              />
            </div>
            <div className="flex items-center mt-1">
              <input
                type="checkbox"
                id="autoInsurance"
                checked={autoCalculateInsurance}
                onChange={(e) => setAutoCalculateInsurance(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="autoInsurance" className="text-xs text-gray-500">Auto-calculate (0.7-0.8% of home value)</label>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">HOA Fees (Monthly)</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">$</span>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-r-md"
                value={monthlyHOA}
                onChange={(e) => setMonthlyHOA(Number(e.target.value))}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">$0 for most single-family, $300-700 for condos</p>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Maintenance Costs (Annual)</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">$</span>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-r-md"
                value={annualMaintenance}
                onChange={(e) => {
                  setAnnualMaintenance(Number(e.target.value));
                  setAutoCalculateMaintenance(false);
                }}
              />
            </div>
            <div className="flex items-center mt-1">
              <input
                type="checkbox"
                id="autoMaintenance"
                checked={autoCalculateMaintenance}
                onChange={(e) => setAutoCalculateMaintenance(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="autoMaintenance" className="text-xs text-gray-500">Auto-calculate (1% of home value)</label>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Closing Costs %</label>
            <div className="flex">
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-l-md"
                value={closingCostsPercent}
                onChange={(e) => setClosingCostsPercent(Number(e.target.value))}
              />
              <span className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Typical range: 2-5%</p>
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Results</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* March 2024 Results */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-3">March 2024 Purchase</h3>
            
            <div className="mb-2">
              <div className="flex justify-between">
                <span>Total Costs (13 months):</span>
                <span className="font-medium">{formatCurrency(results.march2024.totalCost)}</span>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between">
                <span>Home Equity Built:</span>
                <span className="font-medium">{formatCurrency(results.march2024.equity)}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-2 border-t border-blue-200">
              <div className="flex justify-between">
                <span className="font-bold">Net Financial Position:</span>
                <span className="font-bold">{formatCurrency(results.march2024.netPosition)}</span>
              </div>
            </div>
          </div>
          
          {/* April 2025 Results */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-3">April 2025 Purchase</h3>
            
            <div className="mb-2">
              <div className="flex justify-between">
                <span>Total Costs:</span>
                <span className="font-medium">{formatCurrency(results.april2025.totalCost)}</span>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between">
                <span>Investment Returns:</span>
                <span className="font-medium">{formatCurrency(results.april2025.investmentReturns)}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-2 border-t border-green-200">
              <div className="flex justify-between">
                <span className="font-bold">Net Financial Position:</span>
                <span className="font-bold">{formatCurrency(results.april2025.netPosition)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Final Comparison */}
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Financial Impact of Waiting</h3>
            <p className="text-2xl font-bold mb-2">
              {results.difference > 0 ? "+" : ""}{formatCurrency(results.difference)}
            </p>
            <p className={`text-lg font-medium ${results.difference > 0 ? "text-green-600" : "text-red-600"}`}>
              {results.recommendation}
            </p>
          </div>
        </div>
        
        {/* Methodology Details */}
        <div className="mt-6 bg-white border border-gray-200 p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Methodology & Assumptions</h3>
          <div className="text-sm text-gray-700">
            <p className="mb-2">This calculator compares two scenarios to determine if waiting to purchase was financially advantageous:</p>
            <ol className="list-decimal list-inside mb-2">
              <li className="mb-1"><strong>March 2024 Scenario:</strong> Calculates equity built (down payment + principal paid + appreciation) minus costs (mortgage payments, taxes, insurance, HOA, maintenance).</li>
              <li className="mb-1"><strong>April 2025 Scenario:</strong> Calculates investment returns on the down payment minus costs (rent paid).</li>
            </ol>
            <p className="mb-2">The difference between these positions represents the financial impact of waiting to purchase.</p>
            <p><strong>Data Sources:</strong> The default values for Miami housing are based on median home prices, typical property tax rates, insurance costs, and maintenance estimates specific to the Miami market.</p>
          </div>
        </div>
      </div>
  {/* long tem results UI starts */}

      {/* Long-term Results Toggle */}
      <div className="mt-6 text-center">
        <button
          className={`px-4 py-2 rounded-md ${showLongTermResults ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setShowLongTermResults(!showLongTermResults)}
        >
          {showLongTermResults ? 'Hide Long-Term Analysis' : 'Show Long-Term Analysis (5 & 10 Years)'}
        </button>
      </div>

      {/* Long-term Results Section */}
          {showLongTermResults && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4 text-center">Long-Term Analysis</h2>
              
              {/* 5-Year Results */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-center">5-Year Projection</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* March 2024 Results after 5 years */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-bold mb-3">March 2024 Purchase (After 5 Years)</h4>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Home Value:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.fiveYear.march2024.homeValue)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Principal Paid:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.fiveYear.march2024.principalPaid)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Total Equity:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.fiveYear.march2024.totalEquity)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Total Costs:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.fiveYear.march2024.totalCosts)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t border-blue-200">
                      <div className="flex justify-between">
                        <span className="font-bold">Net Financial Position:</span>
                        <span className="font-bold">{formatCurrency(longTermResults.fiveYear.march2024.netPosition)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* April 2025 Results after 5 years */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-lg font-bold mb-3">April 2025 Purchase (After 5 Years)</h4>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Home Value:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.fiveYear.april2025.homeValue)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Principal Paid:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.fiveYear.april2025.principalPaid)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Total Equity:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.fiveYear.april2025.totalEquity)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Initial Investment Returns:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.fiveYear.april2025.investmentReturns)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Total Costs:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.fiveYear.april2025.totalCosts)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t border-green-200">
                      <div className="flex justify-between">
                        <span className="font-bold">Net Financial Position:</span>
                        <span className="font-bold">{formatCurrency(longTermResults.fiveYear.april2025.netPosition)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 5-Year Comparison */}
                <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                  <div className="text-center">
                    <h4 className="text-lg font-bold mb-2">5-Year Financial Impact of Waiting</h4>
                    <p className="text-2xl font-bold mb-2">
                      {longTermResults.fiveYear.difference > 0 ? "+" : ""}{formatCurrency(longTermResults.fiveYear.difference)}
                    </p>
                    <p className={`text-lg font-medium ${longTermResults.fiveYear.difference > 0 ? "text-green-600" : "text-red-600"}`}>
                      {longTermResults.fiveYear.recommendation}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 10-Year Results */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-center">10-Year Projection</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* March 2024 Results after 10 years */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-bold mb-3">March 2024 Purchase (After 10 Years)</h4>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Home Value:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.tenYear.march2024.homeValue)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Principal Paid:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.tenYear.march2024.principalPaid)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Total Equity:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.tenYear.march2024.totalEquity)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Total Costs:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.tenYear.march2024.totalCosts)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t border-blue-200">
                      <div className="flex justify-between">
                        <span className="font-bold">Net Financial Position:</span>
                        <span className="font-bold">{formatCurrency(longTermResults.tenYear.march2024.netPosition)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* April 2025 Results after 10 years */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-lg font-bold mb-3">April 2025 Purchase (After 10 Years)</h4>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Home Value:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.tenYear.april2025.homeValue)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Principal Paid:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.tenYear.april2025.principalPaid)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Total Equity:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.tenYear.april2025.totalEquity)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Initial Investment Returns:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.tenYear.april2025.investmentReturns)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex justify-between">
                        <span>Total Costs:</span>
                        <span className="font-medium">{formatCurrency(longTermResults.tenYear.april2025.totalCosts)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t border-green-200">
                      <div className="flex justify-between">
                        <span className="font-bold">Net Financial Position:</span>
                        <span className="font-bold">{formatCurrency(longTermResults.tenYear.april2025.netPosition)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 10-Year Comparison */}
                <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                  <div className="text-center">
                    <h4 className="text-lg font-bold mb-2">10-Year Financial Impact of Waiting</h4>
                    <p className="text-2xl font-bold mb-2">
                      {longTermResults.tenYear.difference > 0 ? "+" : ""}{formatCurrency(longTermResults.tenYear.difference)}
                    </p>
                    <p className={`text-lg font-medium ${longTermResults.tenYear.difference > 0 ? "text-green-600" : "text-red-600"}`}>
                      {longTermResults.tenYear.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default HomePurchase;