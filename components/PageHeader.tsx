import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-5 mb-6 gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-950">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-zinc-500 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
export default PageHeader;
