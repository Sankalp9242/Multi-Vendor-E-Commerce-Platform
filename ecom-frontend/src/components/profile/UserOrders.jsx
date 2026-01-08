import React, { useEffect } from "react";
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

  if (errorMessage)
    return (
      <div className="text-center text-red-500 mt-10">
        {errorMessage}
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {(!userOrders || userOrders.length === 0) ? (
        <div className="text-center text-gray-500">
          You haven’t placed any orders yet.
        </div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => (
            <div
              key={order.orderId}
              className="border rounded-lg shadow-sm p-5 bg-white"
            >
              {/* Order Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-semibold">
                    Order #{order.orderId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.orderDate}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                  {order.orderStatus}
                </span>
              </div>

              {/* Order Items */}
              <div className="divide-y">
                {order.orderItems.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="flex justify-between py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {item.product.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₹{item.orderedProductPrice}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-4 text-sm">
                <p className="text-gray-600">
                  Payment:{" "}
                  <span className="font-medium">
                    {order.payment.pgName} (
                    {order.payment.pgStatus})
                  </span>
                </p>

                <p className="font-bold text-lg">
                  Total: ₹{order.totalAmount}
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
