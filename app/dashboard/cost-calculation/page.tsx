"use client";

import { useMemo, useState } from "react";
import { Calculator, Wallet, Car, ShieldCheck, Fuel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fmtLkr(value: number): string {
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(value)}`;
}

export default function CostCalculationPage() {
  const [vehiclePrice, setVehiclePrice] = useState("9500000");
  const [downPayment, setDownPayment] = useState("2000000");
  const [annualInterest, setAnnualInterest] = useState("12");
  const [tenureMonths, setTenureMonths] = useState("60");
  const [insuranceMonthly, setInsuranceMonthly] = useState("18000");
  const [fuelMonthly, setFuelMonthly] = useState("35000");
  const [maintenanceMonthly, setMaintenanceMonthly] = useState("12000");

  const result = useMemo(() => {
    const price = toNumber(vehiclePrice);
    const down = toNumber(downPayment);
    const principal = Math.max(0, price - down);

    const months = Math.max(1, toNumber(tenureMonths));
    const monthlyRate = Math.max(0, toNumber(annualInterest)) / 12 / 100;

    let emi = 0;
    if (principal > 0) {
      if (monthlyRate === 0) {
        emi = principal / months;
      } else {
        const factor = Math.pow(1 + monthlyRate, months);
        emi = (principal * monthlyRate * factor) / (factor - 1);
      }
    }

    const insurance = Math.max(0, toNumber(insuranceMonthly));
    const fuel = Math.max(0, toNumber(fuelMonthly));
    const maintenance = Math.max(0, toNumber(maintenanceMonthly));

    const totalMonthlyCost = emi + insurance + fuel + maintenance;
    const totalLoanPayment = emi * months;
    const totalOwnershipCost = down + totalLoanPayment + (insurance + fuel + maintenance) * months;

    return {
      principal,
      emi,
      totalMonthlyCost,
      totalLoanPayment,
      totalOwnershipCost,
    };
  }, [vehiclePrice, downPayment, annualInterest, tenureMonths, insuranceMonthly, fuelMonthly, maintenanceMonthly]);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cost Calculation</h1>
        <p className="text-sm text-slate-500">Estimate your monthly and total ownership cost before deciding.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-blue-600" />
              Finance Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="vehiclePrice">Vehicle Price (LKR)</Label>
              <Input id="vehiclePrice" type="number" value={vehiclePrice} onChange={(e) => setVehiclePrice(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="downPayment">Down Payment (LKR)</Label>
              <Input id="downPayment" type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest">Interest % (annual)</Label>
              <Input id="interest" type="number" step="0.1" value={annualInterest} onChange={(e) => setAnnualInterest(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="months">Tenure (months)</Label>
              <Input id="months" type="number" value={tenureMonths} onChange={(e) => setTenureMonths(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">Insurance / month</Label>
              <Input id="insurance" type="number" value={insuranceMonthly} onChange={(e) => setInsuranceMonthly(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel">Fuel / month</Label>
              <Input id="fuel" type="number" value={fuelMonthly} onChange={(e) => setFuelMonthly(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="maintenance">Maintenance / month</Label>
              <Input id="maintenance" type="number" value={maintenanceMonthly} onChange={(e) => setMaintenanceMonthly(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500"><Wallet className="h-4 w-4" /> Loan Principal</span>
                <span className="font-semibold text-slate-900">{fmtLkr(result.principal)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500"><Car className="h-4 w-4" /> Monthly EMI</span>
                <span className="font-semibold text-slate-900">{fmtLkr(result.emi)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500"><Fuel className="h-4 w-4" /> Total Monthly Cost</span>
                <span className="font-semibold text-emerald-700">{fmtLkr(result.totalMonthlyCost)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500"><ShieldCheck className="h-4 w-4" /> Total Ownership Cost</span>
                <span className="font-semibold text-blue-700">{fmtLkr(result.totalOwnershipCost)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
