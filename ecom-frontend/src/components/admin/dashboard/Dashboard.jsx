import React, { useEffect, useMemo, useState } from "react";
import { FaBoxOpen, FaShoppingCart, FaStore } from "react-icons/fa";
import { MdAttachMoney, MdOutlinePendingActions } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import DashboardOverview from "./DashboardOverview";
import { analyticsAction, fetchCommissionSettings, updateCommissionSettings } from "../../../store/actions";
import Loader from "../../shared/Loader";
import ErrorPage from "../../shared/ErrorPage";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const { analytics = {}, commission = {} } = useSelector((state) => state.admin);
  const [commissionValue, setCommissionValue] = useState("");
  const [savingCommission, setSavingCommission] = useState(false);

  useEffect(() => {
    dispatch(analyticsAction());
    dispatch(fetchCommissionSettings());
  }, [dispatch]);

  useEffect(() => {
    if (commission?.commissionPercentage !== undefined && commission?.commissionPercentage !== null) {
      setCommissionValue(String(commission.commissionPercentage));
    }
  }, [commission]);

  const dashboardCards = useMemo(
    () => [
      { title: "Total Sellers", amount: analytics.sellerCount || 0, Icon: FaStore },
      { title: "Total Products", amount: analytics.productCount || 0, Icon: FaBoxOpen },
      { title: "Total Orders", amount: analytics.totalOrders || 0, Icon: FaShoppingCart },
      { title: "Total Revenue", amount: analytics.totalRevenue || 0, Icon: MdAttachMoney, revenue: true },
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
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.map((card) => (
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

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-slate-800">Recent Orders</h2>
            <p className="text-sm text-slate-500">Platform-wide order activity for quick monitoring.</p>
          </div>
          {!analytics.recentOrders?.length ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
              No recent orders available.
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.recentOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">Order #{order.orderId}</p>
                    <p className="text-sm text-slate-600">{order.email}</p>
                    <p className="text-sm text-slate-500">Status: {order.orderStatus}</p>
                  </div>
                  <div className="text-sm text-slate-600 md:text-right">
                    <p>${Number(order.totalAmount || 0).toFixed(2)}</p>
                    <p>{order.orderDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-slate-800">Commission</h2>
              <p className="text-sm text-slate-500">Global platform commission applied to seller earnings.</p>
            </div>

            <div className="space-y-4">
              <input
                type="number"
                min="0"
                max="100"
                value={commissionValue}
                onChange={(e) => setCommissionValue(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-4 py-2 outline-none"
                placeholder="Enter commission percentage"
              />
              <button
                type="button"
                disabled={savingCommission}
                onClick={() =>
                  dispatch(updateCommissionSettings(commissionValue, toast, setSavingCommission))
                }
                className="rounded-md bg-custom-blue px-4 py-2 font-semibold text-white"
              >
                {savingCommission ? "Saving..." : "Save Commission"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-slate-800">Pending Product Approvals</h2>
              <p className="text-sm text-slate-500">Products waiting for admin moderation.</p>
            </div>
            {!analytics.pendingProducts?.length ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
                No pending products right now.
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.pendingProducts.map((product) => (
                  <div key={product.productId} className="rounded-lg border border-slate-200 px-4 py-4">
                    <p className="font-semibold text-slate-800">{product.productName}</p>
                    <p className="text-sm text-slate-500">{product.sellerName || "Unknown seller"}</p>
                    <p className="text-sm text-slate-600">
                      ${Number(product.specialPrice || product.price || 0).toFixed(2)} • Stock {product.quantity}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
