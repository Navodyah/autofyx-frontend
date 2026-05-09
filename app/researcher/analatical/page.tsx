'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import {
  AlertCircle,
  BarChart3,
  Brain,
  Download,
  CircleDollarSign,
  Fuel,
  Gauge,
  RefreshCcw,
  TrendingUp,
  Wrench,
  Car,
  Settings2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE } from '@/lib/api';

const L = {
  bg: "#F0F4FF",
  cardBg: "#FFFFFF",
  primary: "#155dfc",
  primaryText: "#FFFFFF",
  text: "#030304",
  muted: "#6B7280",
  border: "#DBEAFE",
  glow: "rgba(21,93,252,0.15)",
  shadow: "0 4px 20px -2px rgba(21, 93, 252, 0.06)",
  iconBg: "#EFF6FF",
  chartGrid: "#e2e8f0",
  chartText: "#64748b"
};

const D = {
  bg: "#030304",
  cardBg: "#0F111A",
  primary: "#155dfc",
  primaryText: "#FFFFFF",
  text: "#FFFFFF",
  muted: "#8B949E",
  border: "rgba(21, 93, 252, 0.2)",
  glow: "rgba(21, 93, 252, 0.25)",
  shadow: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
  iconBg: "rgba(21,93,252,0.08)",
  chartGrid: "rgba(255,255,255,0.05)",
  chartText: "rgba(255,255,255,0.4)"
};

type AnalyticsResponse = {
  summary: {
    vehicle_count: number;
    brand_count: number;
    vehicle_class_count: number;
    fuel_type_count: number;
    maintenance_record_count: number;
    avg_price: number;
    avg_highway_efficiency: number;
    avg_combined_efficiency: number;
    avg_maintenance_cost: number;
  };
  cost_pricing: {
    average_min_max_by_brand: Array<{
      brand: string;
      count: number;
      avg_min_price: number;
      avg_max_price: number;
    }>;
    price_distribution_by_vehicle_class: Array<{
      class_name: string;
      count: number;
      avg_min_price: number;
      avg_max_price: number;
    }>;
    price_vs_engine_size_scatter: Array<{
      vehicle_id: number;
      label: string;
      brand: string;
      class_name: string;
      engine_size: number | null;
      price: number | null;
    }>;
  };
  maintenance: {
    average_yearly_maintenance_by_brand: Array<{
      brand: string;
      avg_yearly_cost: number;
      count: number;
    }>;
    maintenance_cost_trend: Array<{
      period: string;
      avg_yearly_cost: number;
      count: number;
    }>;
    top_10_highest_maintenance_vehicles: Array<{
      vehicle_id: number;
      label: string;
      brand: string;
      avg_yearly_cost: number;
      count: number;
      latest_recorded_date: string | null;
    }>;
  };
  fuel_efficiency: {
    highway_vs_combined_by_fuel: Array<{
      fuel_type: string;
      avg_highway_efficiency: number;
      avg_combined_efficiency: number;
      count: number;
    }>;
    efficiency_by_fuel_type: Array<{
      fuel_type: string;
      avg_combined_efficiency: number;
      count: number;
    }>;
    best_fuel_efficient_vehicles: Array<{
      vehicle_id: number;
      label: string;
      brand: string;
      class_name: string;
      fuel_type: string;
      combined_efficiency: number | null;
      highway_efficiency: number | null;
      engine_size: number | null;
      price_midpoint: number | null;
    }>;
  };
  market_insights: {
    vehicle_count_by_brand: Array<{ brand: string; count: number }>;
    vehicle_distribution_by_fuel: Array<{ fuel_type: string; count: number }>;
    transmission_usage_distribution: Array<{ transmission: string; count: number }>;
  };
  performance: {
    engine_size_vs_fuel_efficiency: Array<{
      vehicle_id: number;
      label: string;
      brand: string;
      class_name: string;
      engine_size: number | null;
      combined_efficiency: number | null;
      highway_efficiency: number | null;
    }>;
    engine_type_cylinders_distribution: Array<{
      engine_cylinders: string;
      count: number;
    }>;
  };
};

type ApiState = {
  data: AnalyticsResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string;
};

const COLORS = ['#155dfc', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316'];

type CsvRow = Record<string, string | number | boolean | null | undefined>;

function escapeCsvValue(value: CsvRow[keyof CsvRow]): string {
  if (value === null || value === undefined) return '';
  const raw = String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: CsvRow[]) {
  const keys = Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach((key) => set.add(key));
    return set;
  }, new Set<string>()));

  const csv = [keys.join(','), ...rows.map((row) => keys.map((key) => escapeCsvValue(row[key])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function captureChartImage(element: HTMLElement): Promise<string> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  return canvas.toDataURL('image/png');
}

function addChartToPdf(
  pdf: jsPDF,
  imageData: string,
  title: string,
  subtitle: string,
  data: CsvRow[],
  yPosition: number
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Add title and subtitle
  if (yPosition + 15 > pageHeight - 10) {
    pdf.addPage();
    yPosition = 15;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, yPosition);
  yPosition += 6;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100);
  pdf.text(subtitle, margin, yPosition);
  yPosition += 10;

  // Add chart image
  const imgWidth = contentWidth;
  const imgHeight = (420 * imgWidth) / 800; // Approximate ratio

  if (yPosition + imgHeight > pageHeight - 15) {
    pdf.addPage();
    yPosition = 15;
  }

  pdf.addImage(imageData, 'PNG', margin, yPosition, imgWidth, imgHeight);
  yPosition += imgHeight + 10;

  // Add data table
  if (yPosition + 15 > pageHeight - 20) {
    pdf.addPage();
    yPosition = 15;
  }

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0);
  pdf.text('Data Summary', margin, yPosition);
  yPosition += 6;

  // Create table data (include full dataset, capped to a sensible limit)
  const MAX_TABLE_ROWS = 500;
  const rows = data.slice(0, MAX_TABLE_ROWS);
  const keys = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  const tableBody = rows.map((row) => {
    const obj: Record<string, string> = {};
    keys.forEach((key) => {
      const val = row[key];
      if (typeof val === 'number') {
        obj[key] = Number.isFinite(val) ? (val > 1000000 ? formatMoney(val) : val.toFixed(2)) : '';
      } else {
        obj[key] = String(val ?? '');
      }
    });
    return obj;
  });

  pdf.setFontSize(8);
  const columns = keys;

  const result = (pdf as any).autoTable({
    head: [columns],
    body: tableBody.map((r) => columns.map((c) => r[c] ?? '')),
    startY: yPosition,
    margin: margin,
    theme: 'grid',
    styles: { fontSize: 7, cellWidth: 'wrap' },
    headStyles: { fillColor: [21, 93, 252], textColor: 255 },
    tableWidth: 'auto',
  });

  return result.finalY + 8;
}

async function downloadAnalyticsPdf(
  analytics: AnalyticsResponse,
  lastUpdated: string,
  filename: string
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const M = 14; // margin
  const CW = pageWidth - M * 2; // content width

  const newPage = (title?: string) => {
    pdf.addPage();
    // Light header bar on each page
    pdf.setFillColor(21, 93, 252);
    pdf.rect(0, 0, pageWidth, 10, 'F');
    pdf.setFillColor(248, 250, 255);
    pdf.rect(0, 10, pageWidth, pageHeight - 10, 'F');
    if (title) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(21, 93, 252);
      pdf.text(title, M, 22);
      pdf.setDrawColor(21, 93, 252);
      pdf.setLineWidth(0.4);
      pdf.line(M, 24, M + 50, 24);
    }
    return title ? 32 : 18;
  };

  const sectionHeader = (text: string, y: number): number => {
    if (y + 16 > pageHeight - 10) { return newPage(text); }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(21, 93, 252);
    pdf.text(text, M, y);
    pdf.setDrawColor(21, 93, 252);
    pdf.setLineWidth(0.4);
    pdf.line(M, y + 2, M + 45, y + 2);
    return y + 10;
  };

  const dataTable = (head: string[], rows: string[][], startY: number, colWidths?: number[]): number => {
    const opts: any = {
      head: [head],
      body: rows,
      startY,
      margin: { left: M, right: M },
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 30, 60] },
      headStyles: { fillColor: [21, 93, 252], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 244, 255] },
      tableWidth: 'auto',
    };
    if (colWidths) {
      opts.columnStyles = Object.fromEntries(colWidths.map((w, i) => [i, { cellWidth: w }]));
    }
    autoTable(pdf, opts);
    return ((pdf as any).lastAutoTable?.finalY || startY + 20) + 6;
  };

  // =============================================
  // COVER PAGE
  // =============================================
  pdf.setFillColor(21, 93, 252);
  pdf.rect(0, 0, pageWidth, 80, 'F');
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 68, pageWidth, 12, 'F');
  // Decorative accent circles (via fillColor opacity trick)
  pdf.setFillColor(255, 255, 255);
  pdf.circle(pageWidth - 20, 20, 28, 'F');
  pdf.setFillColor(21, 93, 252);
  pdf.circle(pageWidth - 20, 20, 18, 'F');
  // Title text
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.text('Vehicle Analytics', M, 30);
  pdf.setFontSize(28);
  pdf.text('Report', M, 42);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(180, 210, 255);
  pdf.text('AutoFyx Research Portal  |  Analytical Intelligence', M, 56);
  pdf.setFontSize(8.5);
  pdf.text(`Generated: ${lastUpdated}`, M, 65);
  // White lower section
  pdf.setFillColor(248, 250, 255);
  pdf.rect(0, 80, pageWidth, pageHeight - 80, 'F');
  // Summary header
  let y = 96;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(21, 93, 252);
  pdf.text('Summary Statistics', M, y);
  pdf.setDrawColor(21, 93, 252);
  pdf.setLineWidth(0.5);
  pdf.line(M, y + 2, M + 58, y + 2);
  y += 10;
  // Summary KPI boxes (2 columns)
  const kpis = [
    { label: 'Total Vehicles', val: String(analytics.summary.vehicle_count) },
    { label: 'Brands', val: String(analytics.summary.brand_count) },
    { label: 'Fuel Types', val: String(analytics.summary.fuel_type_count) },
    { label: 'Maintenance Records', val: String(analytics.summary.maintenance_record_count) },
    { label: 'Average Price', val: `LKR ${formatMoney(analytics.summary.avg_price)}` },
    { label: 'Avg Maintenance / yr', val: `LKR ${formatMoney(analytics.summary.avg_maintenance_cost)}` },
    { label: 'Avg Highway Efficiency', val: `${formatDecimal(analytics.summary.avg_highway_efficiency)} L/100km` },
    { label: 'Avg Combined Efficiency', val: `${formatDecimal(analytics.summary.avg_combined_efficiency)} L/100km` },
  ];
  const boxW = (CW - 6) / 2;
  const boxH = 16;
  kpis.forEach((k, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = M + col * (boxW + 6);
    const by = y + row * (boxH + 3);
    pdf.setFillColor(col === 0 ? 240 : 248, col === 0 ? 244 : 250, 255);
    pdf.roundedRect(bx, by, boxW, boxH, 2, 2, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(k.label, bx + 4, by + 5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(21, 93, 252);
    pdf.text(k.val, bx + 4, by + 12);
  });
  y += Math.ceil(kpis.length / 2) * (boxH + 3) + 10;
  // Intro paragraph
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(80, 80, 100);
  const intro = 'This report contains a comprehensive breakdown of pricing, maintenance trends, fuel efficiency, market insights, and performance data extracted from the AutoFyx vehicle database.';
  const lines = pdf.splitTextToSize(intro, CW);
  pdf.text(lines, M, y);

  // =============================================
  // PAGE 2 - PRICING
  // =============================================
  y = newPage('Pricing Analysis');
  y = sectionHeader('Average Price by Brand (Top 15)', y);
  const pricingRows = analytics.cost_pricing.average_min_max_by_brand.slice(0, 15).map(r => [
    r.brand, String(r.count),
    `LKR ${formatMoney(r.avg_min_price)}`, `LKR ${formatMoney(r.avg_max_price)}`,
  ]);
  y = dataTable(['Brand', 'Count', 'Avg Min Price', 'Avg Max Price'], pricingRows, y, [45, 18, 55, 55]);
  y = sectionHeader('Price by Vehicle Class', y);
  const classRows = analytics.cost_pricing.price_distribution_by_vehicle_class.map(r => [
    r.class_name, String(r.count), `LKR ${formatMoney(r.avg_min_price)}`, `LKR ${formatMoney(r.avg_max_price)}`,
  ]);
  y = dataTable(['Class', 'Count', 'Avg Min Price', 'Avg Max Price'], classRows, y, [55, 18, 55, 55]);

  // =============================================
  // PAGE 3 - MAINTENANCE
  // =============================================
  y = newPage('Maintenance Analysis');
  y = sectionHeader('Avg Yearly Maintenance by Brand', y);
  const maintRows = analytics.maintenance.average_yearly_maintenance_by_brand.map(r => [
    r.brand, String(r.count), `LKR ${formatMoney(r.avg_yearly_cost)}`,
  ]);
  y = dataTable(['Brand', 'Records', 'Avg Yearly Cost'], maintRows, y, [70, 25, 70]);
  y = sectionHeader('Top 10 Highest Maintenance Vehicles', y);
  const top10Rows = analytics.maintenance.top_10_highest_maintenance_vehicles.map((r, i) => [
    `#${i + 1}`, r.label.substring(0, 35), r.brand, `LKR ${formatMoney(r.avg_yearly_cost)}`,
  ]);
  y = dataTable(['Rank', 'Vehicle', 'Brand', 'Avg Yearly Cost'], top10Rows, y, [12, 70, 40, 50]);

  // =============================================
  // PAGE 4 - FUEL EFFICIENCY
  // =============================================
  y = newPage('Fuel Efficiency Analysis');
  y = sectionHeader('Efficiency by Fuel Type', y);
  const fuelRows = analytics.fuel_efficiency.efficiency_by_fuel_type.map(r => [
    r.fuel_type, String(r.count), `${formatDecimal(r.avg_combined_efficiency)} L/100km`,
  ]);
  y = dataTable(['Fuel Type', 'Vehicles', 'Avg Combined Efficiency'], fuelRows, y, [60, 25, 80]);
  y = sectionHeader('Best Fuel-Efficient Vehicles (Top 10)', y);
  const bestFuelRows = analytics.fuel_efficiency.best_fuel_efficient_vehicles.slice(0, 10).map((r, i) => [
    `#${i + 1}`, r.label.substring(0, 35), r.fuel_type,
    `${formatDecimal(r.combined_efficiency)} L/100km`,
    `${formatDecimal(r.highway_efficiency)} L/100km`,
  ]);
  y = dataTable(['#', 'Vehicle', 'Fuel', 'Combined', 'Highway'], bestFuelRows, y, [10, 65, 28, 35, 35]);
  y = sectionHeader('Highway vs Combined by Fuel Type', y);
  const hwRows = analytics.fuel_efficiency.highway_vs_combined_by_fuel.map(r => [
    r.fuel_type, String(r.count),
    `${formatDecimal(r.avg_highway_efficiency)} L/100km`,
    `${formatDecimal(r.avg_combined_efficiency)} L/100km`,
  ]);
  y = dataTable(['Fuel Type', 'Count', 'Avg Highway', 'Avg Combined'], hwRows, y, [55, 20, 50, 50]);

  // =============================================
  // PAGE 5 - MARKET INSIGHTS
  // =============================================
  y = newPage('Market Insights');
  y = sectionHeader('Vehicle Count by Brand', y);
  const brandRows = analytics.market_insights.vehicle_count_by_brand.map(r => [r.brand, String(r.count)]);
  y = dataTable(['Brand', 'Vehicles'], brandRows, y, [120, 40]);
  y = sectionHeader('Distribution by Fuel Type', y);
  const fuelDistRows = analytics.market_insights.vehicle_distribution_by_fuel.map(r => [r.fuel_type, String(r.count)]);
  y = dataTable(['Fuel Type', 'Vehicles'], fuelDistRows, y, [120, 40]);
  y = sectionHeader('Transmission Distribution', y);
  const transRows = analytics.market_insights.transmission_usage_distribution.slice(0, 20).map(r => [r.transmission, String(r.count)]);
  y = dataTable(['Transmission', 'Vehicles'], transRows, y, [120, 40]);

  // =============================================
  // PAGE 6 - PERFORMANCE
  // =============================================
  y = newPage('Performance Analysis');
  y = sectionHeader('Engine Cylinder Distribution', y);
  const cylRows = analytics.performance.engine_type_cylinders_distribution.sort((a, b) => b.count - a.count).map(r => [
    `${r.engine_cylinders} cylinders`, String(r.count),
  ]);
  y = dataTable(['Engine Config', 'Vehicle Count'], cylRows, y, [100, 60]);
  y = sectionHeader('Engine Size vs Combined Efficiency (Sample)', y);
  const engRows = analytics.performance.engine_size_vs_fuel_efficiency.slice(0, 30).map(r => [
    r.label.substring(0, 30), r.brand,
    r.engine_size != null ? `${r.engine_size}L` : '-',
    r.combined_efficiency != null ? `${formatDecimal(r.combined_efficiency)} L/100km` : '-',
  ]);
  y = dataTable(['Vehicle', 'Brand', 'Engine', 'Combined Eff.'], engRows, y, [65, 35, 22, 45]);

  pdf.save(filename);
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(value);
}

function formatDecimal(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return value.toFixed(digits);
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  P,
  isDarkMode,
  delay
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  P: Record<string, string>;
  isDarkMode: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1"
      style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: P.muted }}>{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight" style={{ color: P.text }}>{value}</p>
          <p className="mt-1.5 text-xs font-medium" style={{ color: P.muted }}>{detail}</p>
        </div>
        <div className="rounded-2xl p-3 shadow-lg" style={{ background: P.primary, color: P.primaryText, boxShadow: P.glow }}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  onDownloadCsv,
  P,
  isDarkMode
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onDownloadCsv?: () => void;
  P: Record<string, string>;
  isDarkMode: boolean;
}) {
  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="rounded-[32px] p-6 shadow-sm flex flex-col"
      style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight" style={{ color: P.text }}>{title}</h3>
          <p className="mt-1 text-sm font-medium" style={{ color: P.muted }}>{subtitle}</p>
        </div>
        {onDownloadCsv ? (
          <button
            type="button"
            onClick={onDownloadCsv}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shadow-sm"
            style={{ background: P.iconBg, color: P.text, border: `1px solid ${P.border}` }}
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        ) : null}
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </motion.section>
  );
}

function InfoRow({ label, value, P, isDarkMode }: { label: string; value: string, P: Record<string, string>, isDarkMode: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}` }}>
      <span className="text-sm font-medium" style={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)' }}>{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

export default function ResearcherPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const P = isDarkMode ? D : L;

  const pageRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ApiState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: '',
  });

  useEffect(() => {
    setIsDarkMode(localStorage.getItem('autofyx_theme') === 'dark');
    const handler = (e: Event) => setIsDarkMode((e as CustomEvent).detail);
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await fetch(`${API_BASE}/researcher/analytics`);
        const json = (await response.json()) as AnalyticsResponse | { detail?: string; message?: string };

        if (!response.ok) {
          const message = 'detail' in json ? json.detail : 'message' in json ? json.message : `Request failed with status ${response.status}`;
          throw new Error(message || 'Failed to load analytics');
        }

        if (!cancelled) {
          setState({
            data: json as AnalyticsResponse,
            loading: false,
            error: null,
            lastUpdated: new Date().toLocaleString(),
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: loadError instanceof Error ? loadError.message : 'Failed to load researcher analytics.',
          }));
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, []);

  const analytics = state.data;

  const handleDownloadPdf = async () => {
    if (!analytics) return;
    try {
      // Show a loading indicator while generating PDF
      const button = document.querySelector('button[data-download-pdf]') as HTMLButtonElement;
      if (button) {
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span>Generating...</span>';

        await downloadAnalyticsPdf(analytics, state.lastUpdated, 'Vehicle-Analytics-Report.pdf');

        button.disabled = false;
        button.innerHTML = originalText;
      } else {
        await downloadAnalyticsPdf(analytics, state.lastUpdated, 'Vehicle-Analytics-Report.pdf');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const summaryItems = useMemo(() => {
    if (!analytics) return [];
    return [
      { title: 'Vehicles', value: String(analytics.summary.vehicle_count), detail: 'Rows available in the vehicle table', icon: Car },
      { title: 'Brands', value: String(analytics.summary.brand_count), detail: 'Unique brands in the catalog', icon: BarChart3 },
      { title: 'Maintenance rows', value: String(analytics.summary.maintenance_record_count), detail: 'Maintenance records used in trend charts', icon: Wrench },
      { title: 'Fuel types', value: String(analytics.summary.fuel_type_count), detail: 'Fuel categories represented in the data', icon: Fuel },
    ];
  }, [analytics]);

  if (state.loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[32px] p-8 shadow-sm" style={{ background: P.cardBg, border: `1px solid ${P.border}` }}>
          <div className="h-5 w-48 animate-pulse rounded-full" style={{ background: P.iconBg }} />
          <div className="mt-4 h-10 w-80 animate-pulse rounded-2xl" style={{ background: P.iconBg }} />
          <div className="mt-3 h-5 w-[32rem] max-w-full animate-pulse rounded-full" style={{ background: P.iconBg }} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-[24px] shadow-sm" style={{ background: P.cardBg, border: `1px solid ${P.border}` }} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[320px] animate-pulse rounded-[32px] shadow-sm" style={{ background: P.cardBg, border: `1px solid ${P.border}` }} />
          ))}
        </div>
      </div>
    );
  }

  if (state.error && !analytics) {
    return (
      <div className="rounded-[32px] p-8 shadow-sm" style={{ background: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2', border: `1px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FECACA'}` }}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-red-500/20 text-red-500">
            <AlertCircle className="h-6 w-6 shrink-0" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: isDarkMode ? '#FCA5A5' : '#991B1B' }}>Analytics unavailable</h2>
            <p className="mt-2 text-sm font-medium" style={{ color: isDarkMode ? '#F87171' : '#B91C1C' }}>{state.error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 shadow-md"
              style={{ background: P.primary }}
            >
              <RefreshCcw className="h-4 w-4" />
              Retry loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div ref={pageRef} className="space-y-8 pb-10">
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-[32px] p-8 xl:p-10 text-white shadow-2xl relative"
        style={{ background: isDarkMode ? 'linear-gradient(135deg, #0F111A, #1a1e2e)' : 'linear-gradient(135deg, #155dfc, #3b82f6)' }}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest backdrop-blur" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}>
              <Brain className="h-3.5 w-3.5" />
              Vehicle intelligence workspace
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[54px] leading-tight">Analytical Data</h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed font-medium md:text-[15px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Deep-dive into charts and statistics generated from the platform's vehicle database.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              <InfoRow label="Last sync" value={state.lastUpdated || 'Just now'} P={P} isDarkMode={isDarkMode} />
              <InfoRow label="Vehicles" value={String(analytics.summary.vehicle_count)} P={P} isDarkMode={isDarkMode} />
              <InfoRow label="Maintenance rows" value={String(analytics.summary.maintenance_record_count)} P={P} isDarkMode={isDarkMode} />
            </div>
          </div>

          <div className="grid gap-3 rounded-[32px] p-5 backdrop-blur sm:grid-cols-2 lg:min-w-[28rem]" style={{ background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.15)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)'}` }}>
            <button
              type="button"
              onClick={handleDownloadPdf}
              data-download-pdf
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 shadow-md"
            >
              <Download className="h-4 w-4" />
              Download Full Report
            </button>
            <div className="rounded-2xl p-4 shadow-inner" style={{ background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)' }}>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>Average vehicle price</p>
              <p className="mt-2 text-2xl font-black">LKR {formatMoney(analytics.summary.avg_price)}M</p>
            </div>
            <div className="rounded-2xl p-4 shadow-inner" style={{ background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)' }}>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>Average maintenance</p>
              <p className="mt-2 text-2xl font-black">LKR {formatMoney(analytics.summary.avg_maintenance_cost)}</p>
            </div>
            <div className="rounded-2xl p-4 shadow-inner" style={{ background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)' }}>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>Avg highway efficiency</p>
              <p className="mt-2 text-2xl font-black">{formatDecimal(analytics.summary.avg_highway_efficiency)} L/100km</p>
            </div>
            <div className="rounded-2xl p-4 shadow-inner" style={{ background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)' }}>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>Avg combined efficiency</p>
              <p className="mt-2 text-2xl font-black">{formatDecimal(analytics.summary.avg_combined_efficiency)} L/100km</p>
            </div>
          </div>
        </div>

        {state.error ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FECACA' }}>
            <Settings2 className="h-4 w-4" />
            {state.error}
          </div>
        ) : null}
      </motion.section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item, i) => (
          <StatCard key={item.title} title={item.title} value={item.value} detail={item.detail} icon={item.icon} P={P} isDarkMode={isDarkMode} delay={0.1 + i * 0.05} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div data-chart="cost_pricing" data-key="average_min_max_by_brand">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Average min_price and max_price by brand" subtitle="Brands with more inventory are shown first." onDownloadCsv={() => downloadCsv('average-min-max-by-brand.csv', analytics.cost_pricing.average_min_max_by_brand)}>
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.cost_pricing.average_min_max_by_brand} margin={{ top: 10, right: 12, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={P.chartGrid} />
                  <XAxis dataKey="brand" angle={-18} textAnchor="end" height={70} tick={{ fill: P.chartText, fontSize: 12 }} />
                  <YAxis tick={{ fill: P.chartText, fontSize: 12 }} tickFormatter={(value) => `LKR ${Number(value) / 1000000}M`} />
                  <Tooltip formatter={((value: unknown) => [`LKR ${formatMoney(typeof value === 'number' ? value : Number(value))}`, '']) as any} contentStyle={{ borderRadius: '14px', border: `1px solid ${P.border}`, background: P.cardBg, color: P.text }} />
                  <Legend />
                  <Bar dataKey="avg_min_price" name="Average min price" fill="#155dfc" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="avg_max_price" name="Average max price" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div data-chart="cost_pricing" data-key="price_distribution_by_vehicle_class">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Price distribution by vehicle class" subtitle="Average prices grouped by class." onDownloadCsv={() => downloadCsv('price-distribution-by-vehicle-class.csv', analytics.cost_pricing.price_distribution_by_vehicle_class)}>
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.cost_pricing.price_distribution_by_vehicle_class} margin={{ top: 10, right: 12, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={P.chartGrid} />
                  <XAxis dataKey="class_name" angle={-18} textAnchor="end" height={70} tick={{ fill: P.chartText, fontSize: 12 }} />
                  <YAxis tick={{ fill: P.chartText, fontSize: 12 }} tickFormatter={(value) => `LKR ${Number(value) / 1000000}M`} />
                  <Tooltip formatter={((value: unknown) => [`LKR ${formatMoney(typeof value === 'number' ? value : Number(value))}`, '']) as any} contentStyle={{ borderRadius: '14px', border: `1px solid ${P.border}`, background: P.cardBg, color: P.text }} />
                  <Legend />
                  <Bar dataKey="avg_min_price" name="Average min price" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="avg_max_price" name="Average max price" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div data-chart="cost_pricing" data-key="price_vs_engine_size_scatter">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Price vs engine size scatter plot" subtitle="Each point is one vehicle from the database." onDownloadCsv={() => downloadCsv('price-vs-engine-size-scatter.csv', analytics.cost_pricing.price_vs_engine_size_scatter)}>
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 18, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={P.chartGrid} />
                  <XAxis type="number" dataKey="engine_size" name="Engine size" tick={{ fill: P.chartText, fontSize: 12 }} label={{ value: 'Engine size (L)', position: 'insideBottom', offset: -8, fill: P.chartText }} />
                  <YAxis type="number" dataKey="price" name="Price" tick={{ fill: P.chartText, fontSize: 12 }} tickFormatter={(value) => `LKR ${Number(value) / 1000000}M`} label={{ value: 'Price (LKR)', angle: -90, position: 'insideLeft', fill: P.chartText }} />
                  <ZAxis range={[60, 220]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '14px', border: `1px solid ${P.border}`, background: P.cardBg, color: P.text }} />
                  <Scatter data={analytics.cost_pricing.price_vs_engine_size_scatter} fill="#155dfc" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div data-chart="maintenance" data-key="average_yearly_maintenance_by_brand">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Average yearly maintenance cost per brand" subtitle="Higher bars indicate higher average yearly upkeep." onDownloadCsv={() => downloadCsv('average-yearly-maintenance-by-brand.csv', analytics.maintenance.average_yearly_maintenance_by_brand)}>
            <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.maintenance.average_yearly_maintenance_by_brand} layout="vertical" margin={{ top: 10, right: 18, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={P.chartGrid} />
                <XAxis type="number" tick={{ fill: P.chartText, fontSize: 12 }} tickFormatter={(value) => `LKR ${Number(value) / 1000000}M`} />
                <YAxis type="category" dataKey="brand" width={120} tick={{ fill: P.chartText, fontSize: 12 }} />
                <Tooltip formatter={((value: unknown) => [`LKR ${formatMoney(typeof value === 'number' ? value : Number(value))}`, 'Average yearly cost']) as any} contentStyle={{ borderRadius: '14px', border: `1px solid ${P.border}`, background: P.cardBg, color: P.text }} />
                <Bar dataKey="avg_yearly_cost" name="Average yearly cost" fill="#ef4444" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div data-chart="maintenance" data-key="maintenance_cost_trend">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Maintenance cost trend over time" subtitle="Monthly buckets from maintenance record dates." onDownloadCsv={() => downloadCsv('maintenance-cost-trend.csv', analytics.maintenance.maintenance_cost_trend)}>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.maintenance.maintenance_cost_trend} margin={{ top: 10, right: 12, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={P.chartGrid} />
                <XAxis dataKey="period" tick={{ fill: P.chartText, fontSize: 12 }} />
                <YAxis tick={{ fill: P.chartText, fontSize: 12 }} tickFormatter={(value) => `LKR ${Number(value) / 1000000}M`} />
                <Tooltip formatter={((value: unknown) => [`LKR ${formatMoney(typeof value === 'number' ? value : Number(value))}`, 'Average yearly cost']) as any} contentStyle={{ borderRadius: '14px', border: `1px solid ${P.border}`, background: P.cardBg, color: P.text }} />
                <Line type="monotone" dataKey="avg_yearly_cost" stroke="#155dfc" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div data-chart="fuel_efficiency" data-key="highway_vs_combined_by_fuel">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Highway vs combined efficiency comparison" subtitle="Efficiency grouped by fuel type." onDownloadCsv={() => downloadCsv('highway-vs-combined-efficiency-by-fuel.csv', analytics.fuel_efficiency.highway_vs_combined_by_fuel)}>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.fuel_efficiency.highway_vs_combined_by_fuel} margin={{ top: 10, right: 12, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={P.chartGrid} />
                <XAxis dataKey="fuel_type" tick={{ fill: P.chartText, fontSize: 12 }} />
                <YAxis tick={{ fill: P.chartText, fontSize: 12 }} tickFormatter={(value) => `${Number(value).toFixed(1)}`} />
                <Tooltip formatter={((value: unknown) => [formatDecimal(typeof value === 'number' ? value : Number(value)), 'L/100km']) as any} contentStyle={{ borderRadius: '14px', border: `1px solid ${P.border}`, background: P.cardBg, color: P.text }} />
                <Legend />
                <Bar dataKey="avg_highway_efficiency" name="Highway" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avg_combined_efficiency" name="Combined" fill="#155dfc" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div data-chart="fuel_efficiency" data-key="efficiency_by_fuel_type">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Efficiency by fuel type" subtitle="Lower values mean better fuel efficiency." onDownloadCsv={() => downloadCsv('efficiency-by-fuel-type.csv', analytics.fuel_efficiency.efficiency_by_fuel_type)}>
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.fuel_efficiency.efficiency_by_fuel_type} layout="vertical" margin={{ top: 10, right: 18, left: 16, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={P.chartGrid} />
                  <XAxis type="number" tick={{ fill: P.chartText, fontSize: 12 }} />
                  <YAxis type="category" dataKey="fuel_type" width={120} tick={{ fill: P.chartText, fontSize: 12 }} />
                  <Tooltip formatter={((value: unknown) => [formatDecimal(typeof value === 'number' ? value : Number(value)), 'Avg combined L/100km']) as any} contentStyle={{ borderRadius: '14px', border: `1px solid ${P.border}`, background: P.cardBg, color: P.text }} />
                  <Bar dataKey="avg_combined_efficiency" name="Avg combined" fill="#10b981" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div data-chart="market_insights" data-key="vehicle_count_by_brand">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Vehicle count by brand" subtitle="Catalog concentration by manufacturer." onDownloadCsv={() => downloadCsv('vehicle-count-by-brand.csv', analytics.market_insights.vehicle_count_by_brand)}>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.market_insights.vehicle_count_by_brand} margin={{ top: 10, right: 12, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={P.chartGrid} />
                <XAxis dataKey="brand" angle={-18} textAnchor="end" height={70} tick={{ fill: P.chartText, fontSize: 12 }} />
                <YAxis tick={{ fill: P.chartText, fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '14px', border: `1px solid ${P.border}`, background: P.cardBg, color: P.text }} />
                <Bar dataKey="count" name="Vehicles" fill="#155dfc" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        </div>

        <div data-chart="market_insights" data-key="vehicle_distribution_by_fuel">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Vehicle distribution by fuel type" subtitle="Share of the vehicle inventory by fuel category" onDownloadCsv={() => downloadCsv('vehicle-distribution-by-fuel-type.csv', analytics.market_insights.vehicle_distribution_by_fuel)}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="w-full sm:w-[220px] h-[220px] flex-shrink-0 mx-auto" style={{minWidth:0}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.market_insights.vehicle_distribution_by_fuel} dataKey="count" nameKey="fuel_type"
                      cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} stroke="none">
                      {analytics.market_insights.vehicle_distribution_by_fuel.map((entry, index) => (
                        <Cell key={entry.fuel_type} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: `1px solid ${P.border}`, background: P.cardBg, color: P.text }}
                      formatter={(v: any, n: any) => [`${v} vehicles`, n]}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                {analytics.market_insights.vehicle_distribution_by_fuel.map((entry, index) => {
                  const total = analytics.market_insights.vehicle_distribution_by_fuel.reduce((s, d) => s + d.count, 0);
                  const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div key={entry.fuel_type}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:color}}/>
                          <span className="text-xs font-semibold" style={{color:P.text}}>{entry.fuel_type}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-bold" style={{color:P.muted}}>{pct}%</span>
                          <span className="text-xs font-black w-8 text-right" style={{color:P.text}}>{entry.count}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{background:isDarkMode?'rgba(255,255,255,0.06)':'#f1f5f9'}}>
                        <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:color}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ChartCard>
        </div>

        <div data-chart="market_insights" data-key="transmission_usage_distribution">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Transmission distribution" subtitle="All transmission types ranked by vehicle count" onDownloadCsv={() => downloadCsv('transmission-usage-distribution.csv', analytics.market_insights.transmission_usage_distribution)}>
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {[...analytics.market_insights.transmission_usage_distribution]
                .sort((a, b) => b.count - a.count)
                .map((entry, index) => {
                  const total = analytics.market_insights.transmission_usage_distribution.reduce((s, d) => s + d.count, 0);
                  const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div key={entry.transmission} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{background:isDarkMode?'rgba(255,255,255,0.02)':'rgba(248,250,255,0.8)', border:`1px solid ${P.border}`}}>
                      <span className="text-[10px] font-black w-4 flex-shrink-0 text-right" style={{color:P.muted}}>#{index+1}</span>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:color}}/>
                      <span className="text-xs font-bold flex-1" style={{color:P.text}}>{entry.transmission}</span>
                      <div className="w-24 h-1.5 rounded-full flex-shrink-0" style={{background:isDarkMode?'rgba(255,255,255,0.06)':'#e2e8f0'}}>
                        <div className="h-full rounded-full" style={{width:`${pct}%`,background:color}}/>
                      </div>
                      <span className="text-[10px] font-bold w-6 text-right flex-shrink-0" style={{color:P.muted}}>{pct}%</span>
                      <span className="text-xs font-black w-8 text-right flex-shrink-0" style={{color:P.text}}>{entry.count}</span>
                    </div>
                  );
                })}
            </div>
          </ChartCard>
        </div>


        <div data-chart="performance" data-key="engine_size_vs_fuel_efficiency">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Engine size vs fuel efficiency" subtitle="Engine displacement compared to combined fuel efficiency." onDownloadCsv={() => downloadCsv('engine-size-vs-fuel-efficiency.csv', analytics.performance.engine_size_vs_fuel_efficiency)}>
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 18, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={P.chartGrid} />
                  <XAxis type="number" dataKey="engine_size" name="Engine size" tick={{ fill: P.chartText, fontSize: 12 }} label={{ value: 'Engine size (L)', position: 'insideBottom', offset: -8, fill: P.chartText }} />
                  <YAxis type="number" dataKey="combined_efficiency" name="Combined fuel efficiency" tick={{ fill: P.chartText, fontSize: 12 }} label={{ value: 'Combined efficiency (L/100km)', angle: -90, position: 'insideLeft', fill: P.chartText }} />
                  <ZAxis range={[60, 180]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '14px', border: `1px solid ${P.border}`, background: P.cardBg, color: P.text }} />
                  <Scatter data={analytics.performance.engine_size_vs_fuel_efficiency} fill="#10b981" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div data-chart="performance" data-key="engine_type_cylinders_distribution">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Engine cylinder distribution" subtitle="Breakdown of cylinder counts across the entire vehicle catalog" onDownloadCsv={() => downloadCsv('engine-type-cylinders-distribution.csv', analytics.performance.engine_type_cylinders_distribution)}>
            <div className="space-y-3 pt-1">
              {analytics.performance.engine_type_cylinders_distribution
                .sort((a, b) => b.count - a.count)
                .map((item, index) => {
                  const total = analytics.performance.engine_type_cylinders_distribution.reduce((s, d) => s + d.count, 0);
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  const barColors = ['#155dfc','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316'];
                  const color = barColors[index % barColors.length];
                  return (
                    <div key={item.engine_cylinders}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:color}}/>
                          <span className="text-sm font-semibold" style={{color:P.text}}>
                            {item.engine_cylinders} cylinders
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold" style={{color:P.muted}}>{pct}%</span>
                          <span className="text-sm font-black" style={{color:P.text}}>{item.count.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{background:isDarkMode?'rgba(255,255,255,0.05)':'#f1f5f9'}}>
                        <motion.div initial={{width:0}} whileInView={{width:`${pct}%`}} viewport={{once:true}} transition={{duration:0.7,delay:index*0.06,ease:'easeOut'}}
                          className="h-full rounded-full" style={{background:color}}/>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div data-chart="fuel_efficiency" data-key="best_fuel_efficient_vehicles">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Best fuel-efficient vehicles" subtitle="Top vehicles sorted by lowest combined fuel consumption" onDownloadCsv={() => downloadCsv('best-fuel-efficient-vehicles.csv', analytics.fuel_efficiency.best_fuel_efficient_vehicles)}>
            <div className="space-y-2.5">
              {analytics.fuel_efficiency.best_fuel_efficient_vehicles.map((item, index) => (
                <motion.div key={item.vehicle_id} initial={{opacity:0,x:-8}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.35,delay:index*0.04}}
                  className="group rounded-2xl px-4 py-3.5 flex items-center gap-4 cursor-default hover:scale-[1.01] transition-transform duration-200"
                  style={{background:isDarkMode?'rgba(16,185,129,0.06)':'#f0fdf9', border:`1px solid ${isDarkMode?'rgba(16,185,129,0.15)':'#bbf7d0'}`}}>
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white" style={{background:index===0?'#10b981':index===1?'#0ea5e9':isDarkMode?'rgba(255,255,255,0.1)':'#e2e8f0', color:index<2?'white':P.muted}}>#{index+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{color:P.text}}>{item.label}</p>
                    <p className="text-[11px] font-medium mt-0.5 truncate" style={{color:P.muted}}>{item.brand} - {item.fuel_type}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-black" style={{color:'#10b981'}}>{formatDecimal(item.combined_efficiency)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:P.muted}}>L/100km</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div data-chart="maintenance" data-key="top_10_highest_maintenance_vehicles">
          <ChartCard P={P} isDarkMode={isDarkMode} title="Top 10 highest maintenance vehicles" subtitle="Vehicles with the highest average yearly upkeep cost" onDownloadCsv={() => downloadCsv('top-10-highest-maintenance-vehicles.csv', analytics.maintenance.top_10_highest_maintenance_vehicles)}>
            <div className="space-y-2.5">
              {analytics.maintenance.top_10_highest_maintenance_vehicles.map((item, index) => (
                <motion.div key={item.vehicle_id} initial={{opacity:0,x:8}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.35,delay:index*0.04}}
                  className="group rounded-2xl px-4 py-3.5 flex items-center gap-4 cursor-default hover:scale-[1.01] transition-transform duration-200"
                  style={{background:isDarkMode?'rgba(239,68,68,0.06)':'#fff7f7', border:`1px solid ${isDarkMode?'rgba(239,68,68,0.15)':'#fecaca'}`}}>
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white" style={{background:index===0?'#ef4444':index===1?'#f97316':isDarkMode?'rgba(255,255,255,0.1)':'#e2e8f0', color:index<2?'white':P.muted}}>#{index+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{color:P.text}}>{item.label}</p>
                    <p className="text-[11px] font-medium mt-0.5 truncate" style={{color:P.muted}}>{item.brand} - {item.count} records</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-black" style={{color:'#ef4444'}}>LKR {formatMoney(item.avg_yearly_cost)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:P.muted}}>per year</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      <motion.section initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.4}}
        className="rounded-[28px] p-6" style={{background:P.cardBg, border:`1px solid ${P.border}`, boxShadow:P.shadow}}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{color:P.text}}>Context Summary</h2>
            <p className="mt-1 text-sm font-medium" style={{color:P.muted}}>A quick read of the current vehicle inventory profile.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
            style={{background:P.iconBg, color:P.primary, border:`1px solid ${P.border}`}}>
            <TrendingUp className="h-4 w-4" />
            Live backend analytics
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {label:'Most common fuel type', val: analytics.market_insights.vehicle_distribution_by_fuel[0]?.fuel_type||'-'},
            {label:'Most common transmission', val: analytics.market_insights.transmission_usage_distribution[0]?.transmission||'-'},
            {label:'Most common brand', val: analytics.market_insights.vehicle_count_by_brand[0]?.brand||'-'},
            {label:'Highest maintenance brand', val: analytics.maintenance.average_yearly_maintenance_by_brand[0]?.brand||'-'},
          ].map(({label,val}) => (
            <div key={label} className="rounded-2xl px-4 py-3.5"
              style={{background:isDarkMode?'rgba(255,255,255,0.03)':'#f8faff', border:`1px solid ${P.border}`}}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:P.muted}}>{label}</p>
              <p className="mt-1.5 text-sm font-bold" style={{color:P.text}}>{val}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

