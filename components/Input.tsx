import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || `input_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full flex flex-col gap-1 text-left">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 text-sm text-zinc-900 border rounded-md shadow-sm outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors ${
          error ? "border-red-500 bg-red-50/50" : "border-zinc-300 bg-white"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = "",
  id,
  ...props
}) => {
  const selectId = id || `select_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full flex flex-col gap-1 text-left">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 text-sm text-zinc-900 border rounded-md shadow-sm bg-white outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors cursor-pointer ${
          error ? "border-red-500" : "border-zinc-300"
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
};
export default Input;
