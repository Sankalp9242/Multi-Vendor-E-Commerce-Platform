import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "../shared/Loader";
import {
  createReturnRequestAction,
  disputeReturnRequestAction,
  fetchBuyerReturns,
  fetchUserOrders,
} from "../../store/actions";

const UserReturns = () => {
  const dispatch = useDispatch();
  const { buyerReturns } = useSelector((state) => state.returns);
  const { userOrders } = useSelector((state) => state.orders);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const [activeItemId, setActiveItemId] = useState(null);
  const [loader, setLoader] = useState(false);
  const [disputeLoaderId, setDisputeLoaderId] = useState(null);
  const [formState, setFormState] = useState({
    reason: "",
    description: "",
    imageUrl: "",
  });
  const [disputeComment, setDisputeComment] = useState("");

  useEffect(() => {
    dispatch(fetchUserOrders());
    dispatch(fetchBuyerReturns());
  }, [dispatch]);

  const existingReturnItemIds = useMemo(
    () => new Set((buyerReturns || []).map((item) => item.orderItemId)),
    [buyerReturns]
  );

  const eligibleItems = useMemo(
    () =>
      (userOrders || []).flatMap((order) =>
        (order.orderItems || [])
          .filter(
            (item) =>
              order.orderStatus === "DELIVERED" &&
              !existingReturnItemIds.has(item.orderItemId)
          )
          .map((item) => ({
            ...item,
            orderId: order.orderId,
            deliveredAt: order.deliveredAt,
          }))
      ),
    [existingReturnItemIds, userOrders]
  );

  if (isLoading && !buyerReturns.length && !userOrders.length) {
    return <Loader />;
  }

  if (errorMessage) {
    return <div className="mt-10 text-center text-red-500">{errorMessage}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Returns</h1>
        <p className="mt-2 text-sm text-slate-500">
          Returns are managed per purchased product. Delivered items can be returned within the active return window.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">Eligible Delivered Items</h2>
        {eligibleItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            No delivered items are currently eligible for a new return request.
          </div>
        ) : (
          <div className="space-y-4">
            {eligibleItems.map((item) => (
              <div key={item.orderItemId} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.product.productName}</p>
                    <p className="text-sm text-slate-500">Order #{item.orderId}</p>
                    <p className="text-sm text-slate-500">Delivered on {item.deliveredAt || "N/A"}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveItemId(item.orderItemId);
                      setFormState({ reason: "", description: "", imageUrl: "" });
                    }}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Request Return
                  </button>
                </div>

                {activeItemId === item.orderItemId && (
                  <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <input
                      value={formState.reason}
                      onChange={(event) => setFormState((prev) => ({ ...prev, reason: event.target.value }))}
                      placeholder="Return reason"
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-custom-blue"
                    />
                    <textarea
                      rows="3"
                      value={formState.description}
                      onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Optional description"
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-custom-blue"
                    />
                    <input
                      value={formState.imageUrl}
                      onChange={(event) => setFormState((prev) => ({ ...prev, imageUrl: event.target.value }))}
                      placeholder="Optional proof image URL"
                      className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-custom-blue"
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        disabled={loader || !formState.reason.trim()}
                        onClick={() =>
                          dispatch(
                            createReturnRequestAction(
                              {
                                orderId: item.orderId,
                                orderItemId: item.orderItemId,
                                reason: formState.reason,
                                description: formState.description,
                                imageUrl: formState.imageUrl,
                              },
                              toast,
                              setLoader,
                              () => setActiveItemId(null)
                            )
                          )
                        }
                        className="rounded-md bg-custom-blue px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loader ? "Submitting..." : "Submit Return Request"}
                      </button>
                      <button
                        onClick={() => setActiveItemId(null)}
                        className="rounded-md border border-slate-300 px-5 py-2 font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-800">My Return Requests</h2>
        {!buyerReturns || buyerReturns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            No return requests created yet.
          </div>
        ) : (
          <div className="space-y-4">
            {buyerReturns.map((item) => (
              <div key={item.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.productName}</p>
                    <p className="text-sm text-slate-500">Order #{item.orderId}</p>
                    <p className="text-sm text-slate-500">Status: {item.status}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                  <p><strong>Reason:</strong> {item.reason}</p>
                  <p><strong>Requested On:</strong> {item.createdAt?.slice(0, 10) || "N/A"}</p>
                  <p><strong>Description:</strong> {item.description || "N/A"}</p>
                  <p><strong>Seller Comment:</strong> {item.sellerComment || "N/A"}</p>
                  <p><strong>Admin Comment:</strong> {item.adminComment || "N/A"}</p>
                </div>

                {item.status === "REJECTED" && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-amber-800">
                      If you think this rejection is unfair, you can escalate it for admin review.
                    </p>
                    <textarea
                      rows="3"
                      value={activeItemId === item.id ? disputeComment : ""}
                      onChange={(event) => {
                        setActiveItemId(item.id);
                        setDisputeComment(event.target.value);
                      }}
                      placeholder="Explain why this return should be reviewed again"
                      className="w-full rounded-md border border-amber-200 px-4 py-3 outline-none"
                    />
                    <div className="mt-3 flex gap-3">
                      <button
                        disabled={disputeLoaderId === item.id || !disputeComment.trim()}
                        onClick={() =>
                          dispatch(
                            disputeReturnRequestAction(
                              item.id,
                              disputeComment,
                              toast,
                              (value) => setDisputeLoaderId(value ? item.id : null),
                              () => {
                                setDisputeComment("");
                                setActiveItemId(null);
                              }
                            )
                          )
                        }
                        className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {disputeLoaderId === item.id ? "Submitting..." : "Escalate Dispute"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserReturns;
