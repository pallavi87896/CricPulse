import React from "react";
import Loader from "./Loader";

interface SimpleTableProps {
  headers: string[];
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyElement?: React.ReactNode;
}

export const SimpleTable: React.FC<SimpleTableProps> = ({
  headers,
  children,
  isLoading = false,
  isEmpty = false,
  emptyElement,
}) => {
  return (
    <div className="w-full overflow-x-auto border border-zinc-200 rounded-lg shadow-xs bg-white">
      <table className="min-w-full divide-y divide-zinc-200">
        <thead className="bg-zinc-50">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-zinc-200 text-sm text-zinc-700">
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12 text-center">
                <div className="flex justify-center items-center gap-2 text-zinc-500">
                  <Loader className="w-5 h-5" />
                  <span>Loading data...</span>
                </div>
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-12">
                {emptyElement || (
                  <div className="text-center text-zinc-500">No records found.</div>
                )}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};
export default SimpleTable;
