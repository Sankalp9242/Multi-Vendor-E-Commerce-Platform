import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminReports } from "../../store/actions";
import Loader from "../shared/Loader";
import ReportExportActions from "../shared/ReportExportActions";
import { downloadReportCsv, downloadReportExcel, downloadReportPdf } from "../../utils/reportExport";

const AdminReports = () => {
  const dispatch = useDispatch();
  const { adminReports } = useSelector((state) => state.reports);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);

  useEffect(() => {
    dispatch(fetchAdminReports());
  }, [dispatch]);

  const reportSections = [
    {
      title: "Total Platform Sales Report",
      fileName: "admin-total-platform-sales-report",
      headers: ["Metric", "Value"],
      rows: [["Total Platform Sales", Number(adminReports?.totalPlatformSalesReport || 0).toFixed(2)]],
    },
    {
      title: "Total Commission Earned Report",
      fileName: "admin-total-commission-earned-report",
      headers: ["Metric", "Value"],
      rows: [["Total Commission Earned", Number(adminReports?.totalCommissionEarnedReport || 0).toFixed(2)]],
    },
    {
      title: "Seller Performance Report",
      fileName: "admin-seller-performance-report",
      headers: ["Store", "Orders", "Gross Sales", "Commission Earned", "Net Earnings"],
      rows: (adminReports?.sellerPerformanceReport || []).map((seller) => [
        seller.storeName || seller.sellerName,
        seller.totalOrders,
        Number(seller.grossSales || 0).toFixed(2),
        Number(seller.commissionEarned || 0).toFixed(2),
        Number(seller.netEarnings || 0).toFixed(2),
      ]),
    },
    {
      title: "Seller Approval / Active / Inactive Report",
      fileName: "admin-seller-status-report",
      headers: ["Metric", "Value"],
      rows: [
        ["Approved Active Sellers", adminReports?.sellerStatusReport?.approvedActive || 0],
        ["Pending Seller Approval", adminReports?.sellerStatusReport?.pendingApproval || 0],
        ["Inactive Sellers", adminReports?.sellerStatusReport?.inactiveSellers || 0],
      ],
    },
    {
      title: "Pending Product Approvals Report",
      fileName: "admin-pending-product-approvals-report",
      headers: ["Product", "Seller", "Status"],
      rows: (adminReports?.pendingProductApprovalsReport || []).map((product) => [
        product.productName,
        product.sellerName,
        product.productStatus,
      ]),
    },
    {
      title: "Category-wise Sales Report",
      fileName: "admin-category-wise-sales-report",
      headers: ["Category", "Units Sold", "Revenue"],
      rows: (adminReports?.categoryWiseSalesReport || []).map((category) => [
        category.categoryName,
        category.unitsSold,
        Number(category.totalRevenue || 0).toFixed(2),
      ]),
    },
    {
      title: "Top Sellers Report",
      fileName: "admin-top-sellers-report",
      headers: ["Seller", "Net Earnings"],
      rows: (adminReports?.topSellersReport || []).map((seller) => [
        seller.storeName || seller.sellerName,
        Number(seller.netEarnings || 0).toFixed(2),
      ]),
    },
    {
      title: "Top Products Report",
      fileName: "admin-top-products-report",
      headers: ["Product", "Seller", "Units Sold", "Revenue"],
      rows: (adminReports?.topProductsReport || []).map((product) => [
        product.productName,
        product.sellerName,
        product.unitsSold,
        Number(product.totalRevenue || 0).toFixed(2),
      ]),
    },
  ];

  const exportReport = (report) => ({
    onExportCsv: () => downloadReportCsv(report.fileName, [report]),
    onExportExcel: () => downloadReportExcel(report.fileName, report.title, [report]),
    onExportPdf: () => downloadReportPdf(report.fileName, report.title, [report]),
  });

  if (isLoading) return <Loader />;
  if (errorMessage) return <div className="p-8 text-center text-red-600">{errorMessage}</div>;

  return (
    <div className="space-y-8 pt-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800">Admin Reports</h1>
        <p className="text-sm text-slate-500">Each report can be downloaded separately as CSV, Excel, or PDF.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Total Platform Sales Report</h2>
            <ReportExportActions compact {...exportReport(reportSections[0])} />
          </div>
          <p className="text-2xl font-bold">${Number(adminReports?.totalPlatformSalesReport || 0).toFixed(2)}</p>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Total Commission Earned Report</h2>
            <ReportExportActions compact {...exportReport(reportSections[1])} />
          </div>
          <p className="text-2xl font-bold">${Number(adminReports?.totalCommissionEarnedReport || 0).toFixed(2)}</p>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Seller Performance Report</h2>
            <ReportExportActions compact {...exportReport(reportSections[2])} />
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            {adminReports?.sellerPerformanceReport?.length
              ? adminReports.sellerPerformanceReport.map((seller) => (
                  <div key={seller.sellerId} className="flex justify-between border-b py-2 last:border-b-0">
                    <span>{seller.storeName || seller.sellerName} - {seller.totalOrders} orders</span>
                    <span>${Number(seller.grossSales || 0).toFixed(2)}</span>
                  </div>
                ))
              : <p>No seller performance data available.</p>}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Seller Approval / Active / Inactive Report</h2>
            <ReportExportActions compact {...exportReport(reportSections[3])} />
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between border-b py-2">
              <span>Approved Active Sellers</span>
              <span>{adminReports?.sellerStatusReport?.approvedActive || 0}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span>Pending Seller Approval</span>
              <span>{adminReports?.sellerStatusReport?.pendingApproval || 0}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Inactive Sellers</span>
              <span>{adminReports?.sellerStatusReport?.inactiveSellers || 0}</span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Pending Product Approvals Report</h2>
            <ReportExportActions compact {...exportReport(reportSections[4])} />
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            {adminReports?.pendingProductApprovalsReport?.length
              ? adminReports.pendingProductApprovalsReport.map((product) => (
                  <div key={product.productId} className="flex justify-between border-b py-2 last:border-b-0">
                    <span>{product.productName} - {product.sellerName}</span>
                    <span>{product.productStatus}</span>
                  </div>
                ))
              : <p>No pending product approvals available.</p>}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Category-wise Sales Report</h2>
            <ReportExportActions compact {...exportReport(reportSections[5])} />
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            {adminReports?.categoryWiseSalesReport?.length
              ? adminReports.categoryWiseSalesReport.map((category) => (
                  <div key={category.categoryId} className="flex justify-between border-b py-2 last:border-b-0">
                    <span>{category.categoryName} - {category.unitsSold} units</span>
                    <span>${Number(category.totalRevenue || 0).toFixed(2)}</span>
                  </div>
                ))
              : <p>No category sales data available.</p>}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Top Sellers Report</h2>
            <ReportExportActions compact {...exportReport(reportSections[6])} />
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            {adminReports?.topSellersReport?.length
              ? adminReports.topSellersReport.map((seller) => (
                  <div key={seller.sellerId} className="flex justify-between border-b py-2 last:border-b-0">
                    <span>{seller.storeName || seller.sellerName}</span>
                    <span>${Number(seller.netEarnings || 0).toFixed(2)}</span>
                  </div>
                ))
              : <p>No top sellers data available.</p>}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Top Products Report</h2>
            <ReportExportActions compact {...exportReport(reportSections[7])} />
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            {adminReports?.topProductsReport?.length
              ? adminReports.topProductsReport.map((product) => (
                  <div key={product.productId} className="flex justify-between border-b py-2 last:border-b-0">
                    <span>{product.productName} - {product.sellerName} - {product.unitsSold} units</span>
                    <span>${Number(product.totalRevenue || 0).toFixed(2)}</span>
                  </div>
                ))
              : <p>No top products data available.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminReports;
