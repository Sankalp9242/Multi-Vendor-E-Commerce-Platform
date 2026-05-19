import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "../shared/Loader";
import {
  closeAdminReturnAction,
  fetchAdminReturns,
  processAdminRefundAction,
  reviewAdminReturnAction,
} from "../../store/actions";

const AdminReturns = () => {
  const dispatch = useDispatch();
  const { adminReturns } = useSelector((state) => state.returns);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const [comment, setComment] = useState({});
  const [loaderId, setLoaderId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminReturns());
  }, [dispatch]);

  if (isLoading && !adminReturns.length) {
    return <Loader />;
  }

  if (errorMessage) {
    return <div className="mt-10 text-center text-red-500">{errorMessage}</div>;
  }

  return (
    <div className="px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Admin Return Actions</h1>

      {!adminReturns || adminReturns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No returns currently need admin intervention.
        </div>
      ) : (
        <div className="space-y-4">
          {adminReturns.map((item) => (
            <div key={item.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{item.productName}</p>
                  <p className="text-sm text-slate-500">Order #{item.orderId}</p>
                  <p className="text-sm text-slate-500">Buyer: {item.buyerEmail}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {item.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                <p><strong>Reason:</strong> {item.reason}</p>
                <p><strong>Description:</strong> {item.description || "N/A"}</p>
                <p><strong>Seller Comment:</strong> {item.sellerComment || "N/A"}</p>
                <p><strong>Buyer/Admin Note:</strong> {item.adminComment || "N/A"}</p>
              </div>

              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <textarea
                  rows="3"
                  value={comment[item.id] || ""}
                  onChange={(event) => setComment((prev) => ({ ...prev, [item.id]: event.target.value }))}
                  placeholder={
                    item.status === "UNDER_REVIEW"
                      ? "Add an admin review note"
                      : item.status === "PRODUCT_RECEIVED"
                        ? "Add a refund processing note"
                        : "Add a closure note"
                  }
                  className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-custom-blue"
                />
                <div className="mt-3 flex flex-wrap gap-3">
                  {item.status === "UNDER_REVIEW" && (
                    <>
                      <button
                        disabled={loaderId === item.id}
                        onClick={() =>
                          dispatch(
                            reviewAdminReturnAction(
                              item.id,
                              true,
                              comment[item.id] || "Admin approved dispute",
                              toast,
                              (value) => setLoaderId(value ? item.id : null)
                            )
                          )
                        }
                        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        {loaderId === item.id ? "Processing..." : "Approve Dispute"}
                      </button>
                      <button
                        disabled={loaderId === item.id}
                        onClick={() =>
                          dispatch(
                            reviewAdminReturnAction(
                              item.id,
                              false,
                              comment[item.id] || "Admin upheld seller rejection",
                              toast,
                              (value) => setLoaderId(value ? item.id : null)
                            )
                          )
                        }
                        className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        {loaderId === item.id ? "Processing..." : "Reject Dispute"}
                      </button>
                    </>
                  )}

                  {item.status === "PRODUCT_RECEIVED" && (
                    <button
                      disabled={loaderId === item.id}
                      onClick={() =>
                        dispatch(
                          processAdminRefundAction(
                            item.id,
                            comment[item.id] || "Refund processed by admin",
                            toast,
                            (value) => setLoaderId(value ? item.id : null)
                          )
                        )
                      }
                      className="rounded-md bg-custom-blue px-4 py-2 text-sm font-semibold text-white"
                    >
                      {loaderId === item.id ? "Processing..." : `Process Refund (Rs. ${item.refundAmount ?? 0})`}
                    </button>
                  )}

                  {item.status === "REFUND_PROCESSED" && (
                    <button
                      disabled={loaderId === item.id}
                      onClick={() =>
                        dispatch(
                          closeAdminReturnAction(
                            item.id,
                            comment[item.id] || "Return closed after refund completion",
                            toast,
                            (value) => setLoaderId(value ? item.id : null)
                          )
                        )
                      }
                      className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {loaderId === item.id ? "Processing..." : "Close Return"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
