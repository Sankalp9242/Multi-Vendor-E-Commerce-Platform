import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSellerReports } from "../../store/actions";
import Loader from "../shared/Loader";
import ReportExportActions from "../shared/ReportExportActions";
import { downloadReportCsv, downloadReportExcel, downloadReportPdf } from "../../utils/reportExport";

const SellerReports = () => {
  const dispatch = useDispatch();
  const { sellerReports } = useSelector((state) => state.reports);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);

  useEffect(() => {
    dispatch(fetchSellerReports());
  }, [dispatch]);

  const reportSections = [
    {
      title: "Orders Report",
      headers: ["Order ID", "Status", "Date", "Amount"],
      rows: (sellerReports?.ordersReport || []).map((order) => [
        order.orderId,
        order.orderStatus,
        order.orderDate,
        Number(order.totalAmount || 0).toFixed(2),
      ]),
    },
    {
      title: "Product Sales Report",
      headers: ["Product", "Status", "Units Sold", "Revenue"],
      rows: (sellerReports?.productSalesReport || []).map((product) => [
        product.productName,
        product.productStatus,
        product.unitsSold,
        Number(product.revenue || 0).toFixed(2),
      ]),
    },
    {
      title: "Earnings Report",
      headers: ["Gross Sales", "Net Earnings"],
      rows: [[
        Number(sellerReports?.earningsReport?.grossSales || 0).toFixed(2),
        Number(sellerReports?.earningsReport?.netEarnings || 0).toFixed(2),
      ]],
    },
    {
      title: "Commission Deduction Report",
      headers: ["Commission Rate", "Commission Deduction"],
      rows: [[
        `${Number(sellerReports?.commissionDeductionReport?.commissionPercentage || 0).toFixed(2)}%`,
        Number(sellerReports?.commissionDeductionReport?.commissionDeduction || 0).toFixed(2),
      ]],
    },
    {
      title: "Inventory Stock Report",
      headers: ["Product", "Status", "Stock Quantity"],
      rows: (sellerReports?.inventoryStockReport || []).map((item) => [
        item.productName,
        item.productStatus,
        item.stockQuantity,
      ]),
    },
    {
      title: "Pending vs Delivered Orders Report",
      headers: ["Status", "Count"],
      rows: (sellerReports?.pendingVsDeliveredOrdersReport || []).map((item) => [
        item.status,
        item.count,
      ]),
    },
  ];

  if (isLoading) return <Loader />;
  if (errorMessage) return <div className="p-8 text-center text-red-600">{errorMessage}</div>;

  return (
    <div className="space-y-8 pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Seller Reports</h1>
        <ReportExportActions
          onExportCsv={() => downloadReportCsv("seller-reports", reportSections)}
          onExportExcel={() => downloadReportExcel("seller-reports", "Seller Reports", reportSections)}
          onExportPdf={() => downloadReportPdf("seller-reports", "Seller Reports", reportSections)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Orders Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            {sellerReports?.ordersReport?.length
              ? sellerReports.ordersReport.map((order) => (
                  <div key={order.orderId} className="flex justify-between border-b py-2 last:border-b-0">
                    <span>Order #{order.orderId} • {order.orderStatus}</span>
                    <span>${Number(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                ))
              : <p>No seller orders available.</p>}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Product Sales Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            {sellerReports?.productSalesReport?.length
              ? sellerReports.productSalesReport.map((product) => (
                  <div key={product.productId} className="flex justify-between border-b py-2 last:border-b-0">
                    <span>{product.productName} • Sold {product.unitsSold}</span>
                    <span>${Number(product.revenue || 0).toFixed(2)}</span>
                  </div>
                ))
              : <p>No product sales data available.</p>}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Earnings Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p>Gross Sales: ${Number(sellerReports?.earningsReport?.grossSales || 0).toFixed(2)}</p>
            <p>Net Earnings: ${Number(sellerReports?.earningsReport?.netEarnings || 0).toFixed(2)}</p>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Commission Deduction Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p>Commission Rate: {Number(sellerReports?.commissionDeductionReport?.commissionPercentage || 0).toFixed(2)}%</p>
            <p>Commission Deduction: ${Number(sellerReports?.commissionDeductionReport?.commissionDeduction || 0).toFixed(2)}</p>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Inventory / Stock Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            {sellerReports?.inventoryStockReport?.length
              ? sellerReports.inventoryStockReport.map((item) => (
                  <div key={item.productId} className="flex justify-between border-b py-2 last:border-b-0">
                    <span>{item.productName} • {item.productStatus}</span>
                    <span>{item.stockQuantity} units</span>
                  </div>
                ))
              : <p>No inventory data available.</p>}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Pending vs Delivered Orders Report</h2>
          <div className="space-y-2 text-sm text-slate-600">
            {sellerReports?.pendingVsDeliveredOrdersReport?.length
              ? sellerReports.pendingVsDeliveredOrdersReport.map((item) => (
                  <div key={item.status} className="flex justify-between border-b py-2 last:border-b-0">
                    <span>{item.status}</span>
                    <span>{item.count}</span>
                  </div>
                ))
              : <p>No order status data available.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SellerReports;
