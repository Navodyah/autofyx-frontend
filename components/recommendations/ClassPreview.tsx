"use client";

import { getSalaryInfo, getPurposeClasses, intersectClasses } from "./use-vehicle-classes";

interface ClassPreviewProps {
  salary: number;
  purpose: string;
  area: string;
}

export function ClassPreview({ salary, purpose, area }: ClassPreviewProps) {
  const info     = getSalaryInfo(salary);
  const purpCls  = getPurposeClasses(purpose, area);
  const finalCls = intersectClasses(info.classes, purpCls);

  return (
    <div className="mb-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-700">
        🎯 Auto-matched classes · <span className="font-normal text-slate-500">{info.tier}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {finalCls.map((c) => (
          <span key={c} className="rounded-md bg-white border border-cyan-200 px-2 py-0.5 text-[10px] font-semibold text-cyan-700 shadow-sm">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
