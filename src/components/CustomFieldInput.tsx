import type { CustomField } from '../types';

interface Props {
  field: CustomField;
  value: string;
  onChange: (key: string, value: string) => void;
  error?: string;
}

const inputCls = "w-full bg-surface-container-highest border-none rounded-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all";

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
        <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
          {field.label}
          {field.required && <span className="text-error ml-0.5">*</span>}
        </label>
        <div className="space-y-2 py-1">
          {field.options.map(opt => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-on-surface group-hover:text-on-background">{opt}</span>
            </label>
          ))}
        </div>
        {error && <p className="text-xs text-error mt-1.5">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">
        {field.label}
        {field.required && <span className="text-error ml-0.5">*</span>}
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
      {error && <p className="text-xs text-error mt-1.5">{error}</p>}
    </div>
  );
}
