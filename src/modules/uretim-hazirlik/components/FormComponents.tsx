export function LookupSelect({ value, onChange, options, placeholder, disabled, className }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder?: string; disabled?: boolean; className?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${className || 'w-full'}`}
    >
      <option value="">{placeholder || 'Seçiniz'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function StoreSelect({ value, onChange, options, placeholder, disabled, className }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string; disabled?: boolean; className?: string;
}) {
  const hasValue = value && options.some(o => o.value === value);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${className || 'w-full'}`}
    >
      <option value="">{placeholder || 'Seçiniz'}</option>
      {value && !hasValue && <option value={value}>{value} (mevcut)</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function FieldInput({ value, onChange, type, disabled, placeholder, className }: {
  value: string; onChange: (v: string) => void; type?: string;
  disabled?: boolean; placeholder?: string; className?: string;
}) {
  return (
    <input
      type={type || 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${className || 'w-full'}`}
    />
  );
}

export function ReadonlyField({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 min-h-[34px]">
        {value || '-'}
      </div>
    </div>
  );
}

export function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
