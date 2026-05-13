import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/actions";
import Loader from "../shared/Loader";

const ORDER_STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

const getStepState = (orderStatus, step) => {
  const normalizedStatus = (orderStatus || "").toUpperCase();

  if (normalizedStatus === "CANCELLED") {
    return "cancelled";
  }

  const currentIndex = ORDER_STEPS.indexOf(normalizedStatus);
  const stepIndex = ORDER_STEPS.indexOf(step);

  if (stepIndex < currentIndex) {
    return "completed";
  }

  if (stepIndex === currentIndex) {
    return "current";
  }

  return "upcoming";
};

const statusBadgeClass = (orderStatus) => {
  const normalizedStatus = (orderStatus || "").toUpperCase();

  switch (normalizedStatus) {
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700";
    case "SHIPPED":
      return "bg-sky-100 text-sky-700";
    case "CONFIRMED":
      return "bg-indigo-100 text-indigo-700";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

const UserOrders = () => {
  const dispatch = useDispatch();

  const { userOrders } = useSelector((state) => state.orders);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (isLoading) return <Loader />;

  if (errorMessage) {
    return <div className="mt-10 text-center text-red-500">{errorMessage}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Orders</h1>

      {!userOrders || userOrders.length === 0 ? (
        <div className="text-center text-gray-500">You have not placed any orders yet.</div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => (
            <div key={order.orderId} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">Order #{order.orderId}</p>
                  <p className="text-sm text-gray-500">{order.orderDate}</p>
                </div>

                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusBadgeClass(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="mb-6 rounded-lg border bg-slate-50 p-4">
                <p className="mb-4 text-sm font-semibold text-slate-700">Order Tracking Timeline</p>

                {order.orderStatus === "CANCELLED" ? (
                  <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    This order was cancelled and is no longer moving through the delivery timeline.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-4">
                    {ORDER_STEPS.map((step) => {
                      const stepState = getStepState(order.orderStatus, step);
                      const isCompleted = stepState === "completed";
                      const isCurrent = stepState === "current";

                      return (
                        <div key={step} className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 h-4 w-4 rounded-full border-2 ${
                              isCompleted
                                ? "border-emerald-600 bg-emerald-600"
                                : isCurrent
                                  ? "border-sky-600 bg-sky-100"
                                  : "border-slate-300 bg-white"
                            }`}
                          />
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                isCompleted
                                  ? "text-emerald-700"
                                  : isCurrent
                                    ? "text-sky-700"
                                    : "text-slate-500"
                              }`}
                            >
                              {step}
                            </p>
                            <p className="text-xs text-slate-500">
                              {isCompleted
                                ? "Completed"
                                : isCurrent
                                  ? "Current stage"
                                  : "Upcoming"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="divide-y">
                {order.orderItems.map((item) => (
                  <div key={item.orderItemId} className="flex justify-between py-3">
                    <div>
                      <p className="font-medium">{item.product.productName}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>

                    <p className="font-semibold">Rs. {item.orderedProductPrice}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <p className="text-gray-600">
                  Payment:{" "}
                  <span className="font-medium">
                    {order.payment?.pgName || "N/A"} ({order.payment?.pgStatus || "N/A"})
                  </span>
                </p>
                <p className="font-bold text-lg">Total: Rs. {order.totalAmount}</p>
                <p className="text-gray-600">Carrier: {order.carrierName || "Not assigned yet"}</p>
                <p className="text-gray-600">Tracking: {order.trackingNumber || "Not available yet"}</p>
                <p className="text-gray-600">
                  Estimated Delivery: {order.estimatedDeliveryDate || "Will be updated soon"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
