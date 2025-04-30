import React, { useState, useEffect } from 'react';

type ScenarioResult = {
  equity: number;
  remainingLoan: number;
  totalCosts: number;
  netPosition: number;
};

type LongTermResults = {
  shared: {
    homeValue: number;
  };
  march2024: ScenarioResult;
  april2025: ScenarioResult;
  difference: number;
  recommendation: string;
};

const round = (value: number) => Math.round(value);

const calculateMonthlyMortgagePayment = (loanAmount: number, annualRate: number, termYears: number) => {
  const monthlyRate = annualRate / 100 / 12;
  const n = termYears * 12;
  return loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -n));
};

const calculatePrincipalPaid = (loanAmount: number, monthlyRate: number, monthlyPayment: number, months: number) => {
  let principalPaid = 0;
  let balance = loanAmount;
  for (let i = 0; i < months; i++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    principalPaid += principal;
    balance -= principal;
  }
  return principalPaid;
};

const calculateRemainingBalance = (
  loanAmount: number,
  annualRate: number,
  termYears: number,
  months: number
) => {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyMortgagePayment(loanAmount, annualRate, termYears);
  const principalPaid = calculatePrincipalPaid(loanAmount, monthlyRate, monthlyPayment, months);
  return loanAmount - principalPaid;
};

const compoundGrowth = (value: number, annualRate: number, years: number) => {
  return value * Math.pow(1 + annualRate / 100, years);
};

const HomePurchaseComparison: React.FC = () => {
  // Basic inputs
  const [homePriceMarch2024, setHomePriceMarch2024] = useState(640000);
  const [homePriceApril2025, setHomePriceApril2025] = useState(650000);
  const [downPaymentPercentMarch2024, setDownPaymentPercentMarch2024] = useState(20);
  const [downPaymentPercentApril2025, setDownPaymentPercentApril2025] = useState(20);
  const [mortgageRateMarch2024, setMortgageRateMarch2024] = useState(6.8);
  const [mortgageRateApril2025, setMortgageRateApril2025] = useState(6.2);
  const [mortgageTerm, setMortgageTerm] = useState(30);

  const [annualPropertyTaxRate, setAnnualPropertyTaxRate] = useState(1.05);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState(3000);
  const [annualMaintenance, setAnnualMaintenance] = useState(2500);
  const [monthlyHOA, setMonthlyHOA] = useState(300);

  const [monthlyRent, setMonthlyRent] = useState(2500);
  const [investmentReturnRate, setInvestmentReturnRate] = useState(5.0);
  const [closingCostsPercent, setClosingCostsPercent] = useState(2.5);

  // Long-term growth factors
  const [annualHomeAppreciation, setAnnualHomeAppreciation] = useState(3.5);
  const [annualRentIncrease, setAnnualRentIncrease] = useState(3.0);
  const [annualPropertyTaxIncrease, setAnnualPropertyTaxIncrease] = useState(2.0);
  const [annualInsuranceIncrease, setAnnualInsuranceIncrease] = useState(5.0);
  const [annualMaintenanceIncrease, setAnnualMaintenanceIncrease] = useState(2.5);

  const [results5yr, setResults5yr] = useState<LongTermResults | null>(null);
  const [results10yr, setResults10yr] = useState<LongTermResults | null>(null);

  const calculateScenario = (years: number): LongTermResults => {
    const waitMonths = 13;
    const ownMarch = years;
    const ownApril = years - 1;

    const downMarch = homePriceMarch2024 * (downPaymentPercentMarch2024 / 100);
    const downApril = homePriceApril2025 * (downPaymentPercentApril2025 / 100);
    const loanMarch = homePriceMarch2024 - downMarch;
    const loanApril = homePriceApril2025 - downApril;

    const mortgageMarch = calculateMonthlyMortgagePayment(loanMarch, mortgageRateMarch2024, mortgageTerm);
    const mortgageApril = calculateMonthlyMortgagePayment(loanApril, mortgageRateApril2025, mortgageTerm);

    const closingMarch = homePriceMarch2024 * (closingCostsPercent / 100);
    const closingApril = homePriceApril2025 * (closingCostsPercent / 100);

    const totalRent = monthlyRent * waitMonths;
    const investmentReturn = downApril * (investmentReturnRate / 100 * (waitMonths / 12));

    const homeValueFuture = compoundGrowth(homePriceApril2025, annualHomeAppreciation, years - 1);

    const getCosts = (
      price: number,
      rate: number,
      loan: number,
      monthly: number,
      ownYears: number,
      closing: number,
      offset = 0
    ) => {
      const remainingLoan = calculateRemainingBalance(loan, rate, mortgageTerm, ownYears * 12);
      const totalMortgage = monthly * ownYears * 12;

      let propertyTax = 0, insurance = 0, maintenance = 0;

      for (let y = 0; y < ownYears; y++) {
        const taxRate = annualPropertyTaxRate * Math.pow(1 + annualPropertyTaxIncrease / 100, y + offset);
        const homeValue = compoundGrowth(price, annualHomeAppreciation, y + offset);
        propertyTax += (homeValue * taxRate / 100);
        insurance += annualHomeInsurance * Math.pow(1 + annualInsuranceIncrease / 100, y + offset);
        maintenance += annualMaintenance * Math.pow(1 + annualMaintenanceIncrease / 100, y + offset);
      }

      const total = totalMortgage + propertyTax + insurance + maintenance + (monthlyHOA * ownYears * 12) + closing;
      return { remainingLoan, total };
    };

    const march = getCosts(homePriceMarch2024, mortgageRateMarch2024, loanMarch, mortgageMarch, ownMarch, closingMarch);
    const april = getCosts(homePriceApril2025, mortgageRateApril2025, loanApril, mortgageApril, ownApril, closingApril, 1);

    const equityMarch = homeValueFuture - march.remainingLoan;
    const netMarch = equityMarch - march.total;

    const equityApril = homeValueFuture - april.remainingLoan;
    const netApril = equityApril - (april.total + totalRent - investmentReturn);

    const diff = netApril - netMarch;

    return {
      shared: { homeValue: homeValueFuture },
      march2024: {
        equity: round(equityMarch),
        remainingLoan: round(march.remainingLoan),
        totalCosts: round(march.total),
        netPosition: round(netMarch),
      },
      april2025: {
        equity: round(equityApril),
        remainingLoan: round(april.remainingLoan),
        totalCosts: round(april.total + totalRent - investmentReturn),
        netPosition: round(netApril),
      },
      difference: round(diff),
      recommendation: diff > 0
        ? `Waiting until April 2025 is better by $${round(diff)} after ${years} years.`
        : `Buying in March 2024 is better by $${round(-diff)} after ${years} years.`,
    };
  };

  useEffect(() => {
    setResults5yr(calculateScenario(5));
    setResults10yr(calculateScenario(10));
  }, [
    homePriceMarch2024,
    homePriceApril2025,
    downPaymentPercentMarch2024,
    downPaymentPercentApril2025,
    mortgageRateMarch2024,
    mortgageRateApril2025,
    mortgageTerm,
    monthlyRent,
    investmentReturnRate,
    closingCostsPercent,
    annualHomeAppreciation,
    annualPropertyTaxRate,
    annualPropertyTaxIncrease,
    annualHomeInsurance,
    annualInsuranceIncrease,
    annualMaintenance,
    annualMaintenanceIncrease,
    monthlyHOA,
  ]);

  const renderResults = (label: string, result: LongTermResults | null) => {
    if (!result) return null;
    return (
      <div className="p-4 bg-white rounded-xl shadow-md my-4">
        <h2 className="text-xl font-semibold mb-2">{label} Results</h2>
        <p><strong>Shared Future Home Value:</strong> ${result.shared.homeValue}</p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-semibold">March 2024 Purchase</h3>
            <p>Equity: ${result.march2024.equity}</p>
            <p>Remaining Loan: ${result.march2024.remainingLoan}</p>
            <p>Total Costs: ${result.march2024.totalCosts}</p>
            <p>Net Position: ${result.march2024.netPosition}</p>
          </div>
          <div>
            <h3 className="font-semibold">April 2025 Purchase</h3>
            <p>Equity: ${result.april2025.equity}</p>
            <p>Remaining Loan: ${result.april2025.remainingLoan}</p>
            <p>Total Costs: ${result.april2025.totalCosts}</p>
            <p>Net Position: ${result.april2025.netPosition}</p>
          </div>
        </div>
        <p className="mt-4 font-bold">{result.recommendation}</p>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Home Purchase Comparison</h1>
      {renderResults("5-Year", results5yr)}
      {renderResults("10-Year", results10yr)}
    </div>
  );
};

export default HomePurchaseComparison;
