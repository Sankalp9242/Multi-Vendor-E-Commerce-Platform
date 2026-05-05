const ReportExportActions = ({ onExportCsv, onExportExcel, onExportPdf }) => {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onExportCsv}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Download CSV
      </button>
      <button
        type="button"
        onClick={onExportExcel}
        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Download Excel
      </button>
      <button
        type="button"
        onClick={onExportPdf}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
      >
        Download PDF
      </button>
    </div>
  );
};

export default ReportExportActions;
