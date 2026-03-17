import type { ReactNode } from "react";

interface ExcelRowProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function ExcelRow({ label, required, error, children }: ExcelRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 border-b border-gray-300">
      <div className="md:col-span-3 bg-gray-100 border-r border-gray-300 p-3 font-semibold text-sm text-gray-700 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <div className="md:col-span-9 bg-white p-2">
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
