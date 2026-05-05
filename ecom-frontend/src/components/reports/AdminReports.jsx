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
      title: "Platform Revenue Summary",
      headers: ["Metric", "Value"],
      rows: [
        ["Total Platform Sales", Number(adminReports?.totalPlatformSalesReport || 0).toFixed(2)],
        ["Total Commission Earned", Number(adminReports?.totalCommissionEarnedReport || 0).toFixed(2)],
        ["Approved Active Sellers", adminReports?.sellerStatusReport?.approvedActive || 0],
        ["Pending Seller Approval", adminReports?.sellerStatusReport?.pendingApproval || 0],
      ],
    },
    {
      title: "Seller Performance Report",
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
      title: "Pending Product Approvals Report",
      headers: ["Product", "Seller", "Status"],
      rows: (adminReports?.pendingProductApprovalsReport || []).map((product) => [
        product.productName,
        product.sellerName,
        product.productStatus,
      ]),
    },
    {
      title: "Category-wise Sales Report",
      headers: ["Category", "Units Sold", "Revenue"],
      rows: (adminReports?.categoryWiseSalesReport || []).map((category) => [
        category.categoryName,
        category.unitsSold,
        Number(category.totalRevenue || 0).toFixed(2),
      ]),
    },
    {
      title: "Top Sellers Report",
      headers: ["Seller", "Net Earnings"],
      rows: (adminReports?.topSellersReport || []).map((seller) => [
        seller.storeName || seller.sellerName,
        Number(seller.netEarnings || 0).toFixed(2),
      ]),
    },
    {
      title: "Top Products Report",
      headers: ["Product", "Seller", "Units Sold", "Revenue"],
      rows: (adminReports?.topProductsReport || []).map((product) => [
        product.productName,
        product.sellerName,
        product.unitsSold,
        Number(product.totalRevenue || 0).toFixed(2),
      ]),
    },
  ];

  if (isLoading) return <Loader />;
  if (errorMessage) return <div className="p-8 text-center text-red-600">{errorMessage}</div>;

  return (
    <div className="space-y-8 pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Admin Reports</h1>
        <ReportExportActions
          onExportCsv={() => downloadReportCsv("admin-reports", reportSections)}
          onExportExcel={() => downloadReportExcel("admin-reports", "Admin Reports", reportSections)}
          onExportPdf={() => downloadReportPdf("admin-reports", "Admin Reports", reportSections)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Platform Sales</p>
          <p className="text-2xl font-bold">${Number(adminReports?.totalPlatformSalesReport || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Commission Earned</p>
          <p className="text-2xl font-bold">${Number(adminReports?.totalCommissionEarnedReport || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approved Active Sellers</p>
          <p className="text-2xl font-bold">{adminReports?.sellerStatusReport?.approvedActive || 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Seller Approval</p>
          <p className="text-2xl font-bold">{adminReports?.sellerStatusReport?.pendingApproval || 0}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Seller Performance Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            {adminReports?.sellerPerformanceReport?.map((seller) => (
              <div key={seller.sellerId} className="flex justify-between border-b py-2 last:border-b-0">
                <span>{seller.storeName || seller.sellerName} • {seller.totalOrders} orders</span>
                <span>${Number(seller.grossSales || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Pending Product Approvals Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            {adminReports?.pendingProductApprovalsReport?.map((product) => (
              <div key={product.productId} className="flex justify-between border-b py-2 last:border-b-0">
                <span>{product.productName} • {product.sellerName}</span>
                <span>{product.productStatus}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Category-wise Sales Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            {adminReports?.categoryWiseSalesReport?.map((category) => (
              <div key={category.categoryId} className="flex justify-between border-b py-2 last:border-b-0">
                <span>{category.categoryName} • {category.unitsSold} units</span>
                <span>${Number(category.totalRevenue || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Top Sellers Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            {adminReports?.topSellersReport?.map((seller) => (
              <div key={seller.sellerId} className="flex justify-between border-b py-2 last:border-b-0">
                <span>{seller.storeName || seller.sellerName}</span>
                <span>${Number(seller.netEarnings || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Top Products Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            {adminReports?.topProductsReport?.map((product) => (
              <div key={product.productId} className="flex justify-between border-b py-2 last:border-b-0">
                <span>{product.productName} • {product.sellerName} • {product.unitsSold} units</span>
                <span>${Number(product.totalRevenue || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminReports;
