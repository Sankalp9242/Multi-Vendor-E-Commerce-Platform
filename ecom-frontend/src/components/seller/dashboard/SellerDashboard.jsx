import { useEffect } from "react";
import { FaBoxOpen, FaClock, FaShoppingCart, FaTruck } from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { analyticsAction, fetchSellerOrders } from "../../../store/actions";
import Loader from "../../shared/Loader";
import ErrorPage from "../../shared/ErrorPage";
import DashboardOverview from "../../admin/dashboard/DashboardOverview";

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const {
    analytics: {
      productCount,
      totalRevenue,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      soldUnits,
    } = {},
  } = useSelector((state) => state.seller);
  const { orders = [] } = useSelector((state) => state.sellerOrders);

  useEffect(() => {
    dispatch(analyticsAction(false));
    dispatch(fetchSellerOrders("pageNumber=0&pageSize=5"));
  }, [dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <ErrorPage message={errorMessage} />;
  }

  return (
    <div className="space-y-8 pt-10">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border border-slate-300 bg-slate-50 shadow-sm">
          <DashboardOverview title="My Products" amount={productCount || "0"} Icon={FaBoxOpen} />
        </div>
        <div className="rounded-lg border border-slate-300 bg-slate-50 shadow-sm">
          <DashboardOverview title="Total Orders" amount={totalOrders || "0"} Icon={FaShoppingCart} />
        </div>
        <div className="rounded-lg border border-slate-300 bg-slate-50 shadow-sm">
          <DashboardOverview title="Revenue" amount={totalRevenue || "0"} Icon={MdAttachMoney} revenue />
        </div>
        <div className="rounded-lg border border-slate-300 bg-slate-50 shadow-sm">
          <DashboardOverview title="Pending Orders" amount={pendingOrders || "0"} Icon={FaClock} />
        </div>
        <div className="rounded-lg border border-slate-300 bg-slate-50 shadow-sm">
          <DashboardOverview title="Delivered Orders" amount={deliveredOrders || "0"} Icon={FaTruck} />
        </div>
        <div className="rounded-lg border border-slate-300 bg-slate-50 shadow-sm">
          <DashboardOverview title="Units Sold" amount={soldUnits || "0"} Icon={FaShoppingCart} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Recent Orders</h2>
            <p className="text-sm text-slate-500">Latest purchases for your listed products.</p>
          </div>
        </div>

        {!orders.length ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
            No seller orders yet. Once customers place orders for your products, they will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.orderId}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">Order #{order.orderId}</p>
                  <p className="text-sm text-slate-600">{order.email}</p>
                  <p className="text-sm text-slate-500">
                    {order.orderItems?.length || 0} item(s) • Status: {order.orderStatus}
                  </p>
                </div>
                <div className="space-y-1 text-sm text-slate-600 md:text-right">
                  <p>Amount: ${Number(order.totalAmount || 0).toFixed(2)}</p>
                  <p>Payment: {order.payment?.pgStatus || "N/A"}</p>
                  <p>Method: {order.payment?.paymentMethod || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
