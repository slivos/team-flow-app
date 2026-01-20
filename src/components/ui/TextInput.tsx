import React from "react";

interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "date";
  required?: boolean;
  autoFocus?: boolean;
  multiline?: boolean;
  rows?: number;
  className?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  autoFocus = false,
  multiline = false,
  rows = 3,
  className = "",
  leadingIcon,
  trailingIcon,
}: TextInputProps) {
  const baseClassName =
    "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent relative z-0";

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && " *"}
        </label>
      )}
      <div className="relative isolate">
        {leadingIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {leadingIcon}
          </div>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`${baseClassName} resize-none ${leadingIcon ? "pl-10" : ""} ${trailingIcon ? "pr-10" : ""} ${className}`}
            autoFocus={autoFocus}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${baseClassName} ${leadingIcon ? "pl-10" : ""} ${trailingIcon ? "pr-10" : ""} ${className}`}
            autoFocus={autoFocus}
          />
        )}
        {trailingIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {trailingIcon}
          </div>
        )}
      </div>
    </div>
  );
}
