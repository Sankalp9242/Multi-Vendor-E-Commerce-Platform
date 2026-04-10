import { formatPrice } from "../../../utils/formatPrice";

const SellerOrderDetails = ({ order }) => {
  const payment = order?.payment;
  const orderItems = order?.orderItems || [];

  return (
    <div className="space-y-6 py-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="text-lg font-semibold text-slate-800">Order Info</h3>
          <p><strong>Order ID:</strong> {order?.id}</p>
          <p><strong>Customer Email:</strong> {order?.email}</p>
          <p><strong>Status:</strong> {order?.status}</p>
          <p><strong>Order Date:</strong> {order?.date}</p>
          <p><strong>Total Amount:</strong> {formatPrice(order?.totalAmount || 0)}</p>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="text-lg font-semibold text-slate-800">Payment Info</h3>
          <p><strong>Gateway:</strong> {payment?.pgName || "N/A"}</p>
          <p><strong>Method:</strong> {payment?.paymentMethod || "N/A"}</p>
          <p><strong>Status:</strong> {payment?.pgStatus || "N/A"}</p>
          <p><strong>Payment ID:</strong> {payment?.pgPaymentId || "N/A"}</p>
          <p><strong>Response:</strong> {payment?.pgResponseMessage || "N/A"}</p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Products In This Order</h3>
        <div className="space-y-3">
          {orderItems.length === 0 ? (
            <p className="text-slate-500">No order items found.</p>
          ) : (
            orderItems.map((item) => (
              <div
                key={item.orderItemId}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border rounded-md p-3"
              >
                <div>
                  <p className="font-semibold text-slate-800">{item.product?.productName}</p>
                  <p className="text-sm text-slate-500">{item.product?.description}</p>
                </div>
                <div className="text-sm text-slate-700 space-y-1">
                  <p><strong>Qty:</strong> {item.quantity}</p>
                  <p><strong>Price:</strong> {formatPrice(item.orderedProductPrice)}</p>
                  <p><strong>Discount:</strong> {item.discount}%</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrderDetails;
