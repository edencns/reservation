import type { CustomField } from '../types';

interface Props {
  field: CustomField;
  value: string;
  onChange: (key: string, value: string) => void;
  error?: string;
}

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]";

export default function CustomFieldInput({ field, value, onChange, error }: Props) {
  if (field.type === 'multiselect' && field.options) {
    const selected = (value ?? '').split(',').map(s => s.trim()).filter(Boolean);
    const toggle = (opt: string) => {
      const next = selected.includes(opt)
        ? selected.filter(s => s !== opt)
        : [...selected, opt];
      onChange(field.key, next.join(', '));
    };
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {field.label}
          {field.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <div className="space-y-2 py-1">
          {field.options.map(opt => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="w-4 h-4 accent-[#667EEA] rounded"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt}</span>
            </label>
          ))}
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {field.type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          className={inputCls}
        >
          <option value="">선택해 주세요</option>
          {field.options?.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={inputCls}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
