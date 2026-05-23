import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserReports } from "../../store/actions";
import Loader from "../shared/Loader";
import ReportExportActions from "../shared/ReportExportActions";
import { downloadReportCsv, downloadReportExcel, downloadReportPdf } from "../../utils/reportExport";

const UserReports = () => {
  const dispatch = useDispatch();
  const { userReports } = useSelector((state) => state.reports);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);

  useEffect(() => {
    dispatch(fetchUserReports());
  }, [dispatch]);

  const reportSections = [
    {
      title: "Order History Report",
      fileName: "user-order-history-report",
      headers: ["Order ID", "Status", "Order Date", "Amount"],
      rows: (userReports?.orderHistoryReport || []).map((order) => [
        order.orderId,
        order.orderStatus,
        order.orderDate,
        Number(order.totalAmount || 0).toFixed(2),
      ]),
    },
    {
      title: "Payment History Report",
      fileName: "user-payment-history-report",
      headers: ["Order ID", "Gateway", "Method", "Status", "Amount"],
      rows: (userReports?.paymentHistoryReport || []).map((payment) => [
        payment.orderId,
        payment.paymentGateway,
        payment.paymentMethod,
        payment.paymentStatus,
        Number(payment.amount || 0).toFixed(2),
      ]),
    },
    {
      title: "Delivery Tracking Report",
      fileName: "user-delivery-tracking-report",
      headers: ["Order ID", "Status", "Carrier", "Tracking Number", "Estimated Delivery"],
      rows: (userReports?.deliveryTrackingReport || []).map((delivery) => [
        delivery.orderId,
        delivery.orderStatus,
        delivery.carrierName || "Carrier pending",
        delivery.trackingNumber || "Tracking pending",
        delivery.estimatedDeliveryDate || "Pending",
      ]),
    },
    {
      title: "Monthly Spending Report",
      fileName: "user-monthly-spending-report",
      headers: ["Month", "Order Count", "Total Amount"],
      rows: (userReports?.monthlySpendingReport || []).map((month) => [
        month.month,
        month.orderCount,
        Number(month.totalAmount || 0).toFixed(2),
      ]),
    },
    {
      title: "Return / Refund Report",
      fileName: "user-return-refund-report",
      headers: ["Return ID", "Order ID", "Product", "Status", "Reason", "Refund Amount"],
      rows: (userReports?.returnRefundReport || []).map((item) => [
        item.returnId,
        item.orderId,
        item.productName,
        item.returnStatus,
        item.reason,
        Number(item.refundAmount || 0).toFixed(2),
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
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800">My Reports</h1>
        <p className="text-sm text-slate-500">Each report can be downloaded separately as CSV, Excel, or PDF.</p>
      </div>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">Order History Report</h2>
          <ReportExportActions compact {...exportReport(reportSections[0])} />
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          {userReports?.orderHistoryReport?.length
            ? userReports.orderHistoryReport.map((order) => (
                <div key={order.orderId} className="flex justify-between border-b py-2 last:border-b-0">
                  <span>Order #{order.orderId} - {order.orderStatus}</span>
                  <span>${Number(order.totalAmount || 0).toFixed(2)}</span>
                </div>
              ))
            : <p>No order history available.</p>}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">Payment History Report</h2>
          <ReportExportActions compact {...exportReport(reportSections[1])} />
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          {userReports?.paymentHistoryReport?.length
            ? userReports.paymentHistoryReport.map((payment) => (
                <div key={payment.orderId} className="flex justify-between border-b py-2 last:border-b-0">
                  <span>Order #{payment.orderId} - {payment.paymentGateway} - {payment.paymentStatus}</span>
                  <span>${Number(payment.amount || 0).toFixed(2)}</span>
                </div>
              ))
            : <p>No payment history available.</p>}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">Delivery / Tracking Report</h2>
          <ReportExportActions compact {...exportReport(reportSections[2])} />
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          {userReports?.deliveryTrackingReport?.length
            ? userReports.deliveryTrackingReport.map((delivery) => (
                <div key={delivery.orderId} className="flex justify-between border-b py-2 last:border-b-0">
                  <span>
                    Order #{delivery.orderId} - {delivery.orderStatus} - {delivery.carrierName || "Carrier pending"}
                  </span>
                  <span>{delivery.trackingNumber || "Tracking pending"}</span>
                </div>
              ))
            : <p>No delivery records available.</p>}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">Monthly Spending Report</h2>
          <ReportExportActions compact {...exportReport(reportSections[3])} />
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          {userReports?.monthlySpendingReport?.length
            ? userReports.monthlySpendingReport.map((month) => (
                <div key={month.month} className="flex justify-between border-b py-2 last:border-b-0">
                  <span>{month.month} - {month.orderCount} orders</span>
                  <span>${Number(month.totalAmount || 0).toFixed(2)}</span>
                </div>
              ))
            : <p>No monthly spending data available.</p>}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">Return / Refund Report</h2>
          <ReportExportActions compact {...exportReport(reportSections[4])} />
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          {userReports?.returnRefundReport?.length
            ? userReports.returnRefundReport.map((item) => (
                <div key={item.returnId} className="flex justify-between border-b py-2 last:border-b-0">
                  <span>Return #{item.returnId} - Order #{item.orderId} - {item.returnStatus}</span>
                  <span>${Number(item.refundAmount || 0).toFixed(2)}</span>
                </div>
              ))
            : <p>No return or refund history available.</p>}
        </div>
      </section>
    </div>
  );
};

export default UserReports;
