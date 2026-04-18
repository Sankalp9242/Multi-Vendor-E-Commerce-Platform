import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/actions";
import Loader from "../shared/Loader";

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
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">Order #{order.orderId}</p>
                  <p className="text-sm text-gray-500">{order.orderDate}</p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                  {order.orderStatus}
                </span>
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
