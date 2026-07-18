import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  extra,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
}) => {
  return (
    <div className={`bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden ${className}`}>
      {(title || subtitle || extra) && (
        <div className={`px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 ${headerClassName}`}>
          <div>
            {title && <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          {extra && <div className="flex items-center">{extra}</div>}
        </div>
      )}
      <div className={`px-5 py-5 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
export default Card;
