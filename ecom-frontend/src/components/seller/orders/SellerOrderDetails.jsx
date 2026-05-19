import { formatPrice } from "../../../utils/formatPrice";

const SellerOrderDetails = ({ order }) => {
  const payment = order?.payment;
  const orderItems = order?.orderItems || [];

  return (
    <div className="space-y-6 py-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-slate-800">Order Info</h3>
          <p><strong>Order ID:</strong> {order?.id}</p>
          <p><strong>Customer Email:</strong> {order?.email}</p>
          <p><strong>Status:</strong> {order?.status}</p>
          <p><strong>Order Date:</strong> {order?.date}</p>
          <p><strong>Subtotal Amount:</strong> {formatPrice(order?.subtotalAmount || order?.totalAmount || 0)}</p>
          <p><strong>Discount Amount:</strong> {formatPrice(order?.discountAmount || 0)}</p>
          <p><strong>Total Amount:</strong> {formatPrice(order?.totalAmount || 0)}</p>
          <p><strong>Coupon:</strong> {order?.couponCode || "N/A"}</p>
        </div>

        <div className="space-y-2 rounded-lg border p-4">
          <h3 className="text-lg font-semibold text-slate-800">Payment Info</h3>
          <p><strong>Gateway:</strong> {payment?.pgName || "N/A"}</p>
          <p><strong>Method:</strong> {payment?.paymentMethod || "N/A"}</p>
          <p><strong>Status:</strong> {payment?.pgStatus || "N/A"}</p>
          <p><strong>Payment ID:</strong> {payment?.pgPaymentId || "N/A"}</p>
          <p><strong>Response:</strong> {payment?.pgResponseMessage || "N/A"}</p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Shipping Info</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <p><strong>Carrier:</strong> {order?.carrierName || "N/A"}</p>
          <p><strong>Tracking:</strong> {order?.trackingNumber || "N/A"}</p>
          <p><strong>Estimated Delivery:</strong> {order?.estimatedDeliveryDate || "N/A"}</p>
          <p><strong>Delivered On:</strong> {order?.deliveredAt || "N/A"}</p>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Products In This Order</h3>
        <div className="space-y-3">
          {orderItems.length === 0 ? (
            <p className="text-slate-500">No order items found.</p>
          ) : (
            orderItems.map((item) => (
              <div
                key={item.orderItemId}
                className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-800">{item.product?.productName}</p>
                  <p className="text-sm text-slate-500">{item.product?.description}</p>
                </div>
                <div className="space-y-1 text-sm text-slate-700">
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
