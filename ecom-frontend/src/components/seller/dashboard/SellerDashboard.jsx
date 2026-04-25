import { useEffect, useMemo } from "react";
import { FaBoxOpen, FaShoppingCart, FaWallet } from "react-icons/fa";
import { MdAttachMoney, MdOutlinePendingActions } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { analyticsAction, fetchSellerOrders } from "../../../store/actions";
import Loader from "../../shared/Loader";
import ErrorPage from "../../shared/ErrorPage";
import DashboardOverview from "../../admin/dashboard/DashboardOverview";

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const { analytics = {} } = useSelector((state) => state.seller);
  const { orders = [] } = useSelector((state) => state.sellerOrders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(analyticsAction(false));
    dispatch(fetchSellerOrders("pageNumber=0&pageSize=5"));
  }, [dispatch]);

  const cards = useMemo(
    () => [
      { title: "My Products", amount: analytics.productCount || 0, Icon: FaBoxOpen },
      { title: "Total Orders", amount: analytics.totalOrders || 0, Icon: FaShoppingCart },
      { title: "Gross Sales", amount: analytics.grossSales || 0, Icon: MdAttachMoney, revenue: true },
      { title: "Net Earnings", amount: analytics.sellerEarnings || 0, Icon: FaWallet, revenue: true },
      {
        title: "Pending Approvals",
        amount: analytics.pendingProductApprovals || 0,
        Icon: MdOutlinePendingActions,
      },
    ],
    [analytics]
  );

  if (isLoading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <ErrorPage message={errorMessage} />;
  }

  return (
    <div className="space-y-8 pt-10">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">{user?.storeName || "Your store"}</p>
        <p>{user?.storeDescription || "Add and manage your catalog, then track orders and earnings here."}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-lg border border-slate-300 bg-slate-50 shadow-sm">
            <DashboardOverview
              title={card.title}
              amount={card.amount}
              Icon={card.Icon}
              revenue={Boolean(card.revenue)}
            />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-slate-800">Recent Orders</h2>
            <p className="text-sm text-slate-500">Only orders tied to your products appear here.</p>
          </div>

          {!orders.length ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
              No seller orders yet. When customers buy your products, they will show here.
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

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-slate-800">Store Earnings</h2>
            <p className="text-sm text-slate-500">Commission-aware summary from the marketplace backend.</p>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-800">Gross Sales</p>
              <p>${Number(analytics.grossSales || 0).toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-800">Commission Rate</p>
              <p>{Number(analytics.commissionPercentage || 0).toFixed(2)}%</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-semibold text-slate-800">Net Earnings</p>
              <p>${Number(analytics.sellerEarnings || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
