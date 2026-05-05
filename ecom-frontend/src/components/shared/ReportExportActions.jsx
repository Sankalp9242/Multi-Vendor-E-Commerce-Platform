const ReportExportActions = ({ onExportCsv, onExportExcel, onExportPdf, compact = false }) => {
  const buttonClassName = compact
    ? "rounded-md px-3 py-1.5 text-xs font-semibold text-white"
    : "rounded-md px-4 py-2 text-sm font-semibold text-white";

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onExportCsv}
        className={`bg-emerald-700 ${buttonClassName}`}
      >
        CSV
      </button>
      <button
        type="button"
        onClick={onExportExcel}
        className={`bg-blue-700 ${buttonClassName}`}
      >
        Excel
      </button>
      <button
        type="button"
        onClick={onExportPdf}
        className={`bg-slate-800 ${buttonClassName}`}
      >
        PDF
      </button>
    </div>
  );
};

export default ReportExportActions;
