import type { CustomField } from '../types';

interface Props {
  field: CustomField;
  value: string;
  onChange: (key: string, value: string) => void;
}

const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#667EEA]";

export default function CustomFieldInput({ field, value, onChange }: Props) {
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
    </div>
  );
}
