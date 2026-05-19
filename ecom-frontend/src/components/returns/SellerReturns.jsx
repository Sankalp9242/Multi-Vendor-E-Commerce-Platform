import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "../shared/Loader";
import {
  approveSellerReturnAction,
  fetchSellerReturns,
  rejectSellerReturnAction,
  updateSellerReturnStatusAction,
} from "../../store/actions";

const nextStatusMap = {
  APPROVED: "PICKUP_SCHEDULED",
  PICKUP_SCHEDULED: "PRODUCT_RECEIVED",
  PRODUCT_RECEIVED: "REFUND_PROCESSED",
  REFUND_PROCESSED: "CLOSED",
};

const SellerReturns = () => {
  const dispatch = useDispatch();
  const { sellerReturns } = useSelector((state) => state.returns);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const [note, setNote] = useState({});
  const [loaderId, setLoaderId] = useState(null);

  useEffect(() => {
    dispatch(fetchSellerReturns());
  }, [dispatch]);

  if (isLoading && !sellerReturns.length) {
    return <Loader />;
  }

  if (errorMessage) {
    return <div className="mt-10 text-center text-red-500">{errorMessage}</div>;
  }

  return (
    <div className="px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Seller Returns</h1>

      {!sellerReturns || sellerReturns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No return requests assigned to your store yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sellerReturns.map((item) => {
            const nextStatus = nextStatusMap[item.status];
            return (
              <div key={item.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.productName}</p>
                    <p className="text-sm text-slate-500">Order #{item.orderId}</p>
                    <p className="text-sm text-slate-500">Buyer: {item.buyerEmail}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                  <p><strong>Reason:</strong> {item.reason}</p>
                  <p><strong>Description:</strong> {item.description || "N/A"}</p>
                  <p><strong>Image URL:</strong> {item.imageUrl || "N/A"}</p>
                  <p><strong>Delivered On:</strong> {item.deliveredAt || "N/A"}</p>
                  <p><strong>Seller Comment:</strong> {item.sellerComment || "N/A"}</p>
                  <p><strong>Admin Comment:</strong> {item.adminComment || "N/A"}</p>
                </div>

                {(item.status === "REQUESTED" || nextStatus) && (
                  <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <textarea
                      rows="3"
                      value={note[item.id] || ""}
                      onChange={(event) => setNote((prev) => ({ ...prev, [item.id]: event.target.value }))}
                      placeholder="Add a seller note"
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-custom-blue"
                    />

                    <div className="flex flex-wrap gap-3">
                      {item.status === "REQUESTED" && (
                        <>
                          <button
                            disabled={loaderId === item.id}
                            onClick={() =>
                              dispatch(
                                approveSellerReturnAction(
                                  item.id,
                                  note[item.id] || "Approved by seller",
                                  toast,
                                  (value) => setLoaderId(value ? item.id : null)
                                )
                              )
                            }
                            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                          >
                            {loaderId === item.id ? "Processing..." : "Approve"}
                          </button>
                          <button
                            disabled={loaderId === item.id || !(note[item.id] || "").trim()}
                            onClick={() =>
                              dispatch(
                                rejectSellerReturnAction(
                                  item.id,
                                  note[item.id],
                                  toast,
                                  (value) => setLoaderId(value ? item.id : null)
                                )
                              )
                            }
                            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {loaderId === item.id ? "Processing..." : "Reject"}
                          </button>
                        </>
                      )}

                      {nextStatus && item.status !== "REQUESTED" && (
                        <button
                          disabled={loaderId === item.id}
                          onClick={() =>
                            dispatch(
                              updateSellerReturnStatusAction(
                                item.id,
                                nextStatus,
                                note[item.id] || `Updated to ${nextStatus}`,
                                toast,
                                (value) => setLoaderId(value ? item.id : null)
                              )
                            )
                          }
                          className="rounded-md bg-custom-blue px-4 py-2 text-sm font-semibold text-white"
                        >
                          {loaderId === item.id ? "Processing..." : `Move to ${nextStatus}`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerReturns;
