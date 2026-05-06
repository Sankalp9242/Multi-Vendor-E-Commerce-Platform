import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Divider, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Status from "./Status";
import { MdClose, MdDone } from "react-icons/md";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductReviewEligibility,
  fetchProductReviews,
  submitProductReview,
  toggleProductWishlist,
} from "../../store/actions";
import toast from "react-hot-toast";

function ProductViewModal({ open, setOpen, product, isAvailable }) {
  const {
    id,
    productName,
    image,
    description,
    price,
    specialPrice,
    averageRating,
    reviewCount,
    sellerName,
    productStatus,
  } = product;
  const dispatch = useDispatch();
  const { productReviews, productReviewEligibility } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { productIds } = useSelector((state) => state.wishlist);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const isWishlisted = productIds.includes(id);
  const isBuyerUser = Boolean(user?.roles?.includes("ROLE_USER")) && !user?.roles?.some((role) => role === "ROLE_SELLER" || role === "ROLE_ADMIN");
  const existingUserReview = productReviews?.find((review) => review.reviewerName === user?.username);

  useEffect(() => {
    if (open && id) {
      dispatch(fetchProductReviews(id));
      if (user) {
        dispatch(fetchProductReviewEligibility(id));
      } else {
        dispatch({
          type: "FETCH_PRODUCT_REVIEW_ELIGIBILITY",
          payload: null,
        });
      }
    }
  }, [dispatch, open, id, user]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (productReviewEligibility?.alreadyReviewed && existingUserReview) {
      setRating(existingUserReview.rating || 5);
      setComment(existingUserReview.comment || "");
      return;
    }

    setRating(5);
    setComment("");
  }, [open, productReviewEligibility, existingUserReview]);

  const onSubmitReview = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    dispatch(
      submitProductReview(
        id,
        {
          rating,
          comment,
        },
        toast
      )
    );
    setComment("");
    setRating(5);
  };

  const onToggleWishlist = () => {
    if (!user) {
      toast.error("Please login to use wishlist");
      return;
    }
    dispatch(toggleProductWishlist(id, isWishlisted, toast));
  };

  return (
    <Dialog open={open} as="div" className="relative z-10" onClose={() => setOpen(false)}>
      <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative w-full transform overflow-hidden rounded-lg bg-white shadow-xl transition-all md:min-w-[720px] md:max-w-[720px]"
          >
            {image && (
              <div className="flex aspect-3/2 justify-center">
                <img src={image} alt={productName} />
              </div>
            )}

            <div className="px-6 pb-2 pt-10">
              <div className="mb-4 flex items-start justify-between gap-4">
                <DialogTitle as="h1" className="text-xl font-semibold leading-6 text-gray-800 sm:text-2xl lg:text-3xl">
                  {productName}
                </DialogTitle>
                <button
                  type="button"
                  onClick={onToggleWishlist}
                  className="rounded-full border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              <div className="space-y-3 pb-4 text-gray-700">
                <div className="flex items-center justify-between gap-2">
                  {specialPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through">${Number(price).toFixed(2)}</span>
                      <span className="font-semibold text-slate-700 sm:text-xl">
                        ${Number(specialPrice).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold">${Number(price).toFixed(2)}</span>
                  )}

                  {isAvailable ? (
                    <Status text="In Stock" icon={MdDone} bg="bg-teal-200" color="text-teal-900" />
                  ) : (
                    <Status text="Out-Of-Stock" icon={MdClose} bg="bg-rose-200" color="text-rose-700" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-amber-600">
                  <FaStar />
                  <span>{Number(averageRating || 0).toFixed(1)}</span>
                  <span className="text-slate-500">({reviewCount || 0} reviews)</span>
                </div>

                <Divider />
                {(sellerName || productStatus) && (
                  <div className="space-y-1 text-sm text-slate-500">
                    {sellerName && <p>Seller: {sellerName}</p>}
                    {productStatus && <p>Status: {productStatus}</p>}
                  </div>
                )}
                <p>{description}</p>
              </div>

              <div className="space-y-4 border-t pt-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">Customer Reviews</h3>
                  <p className="text-sm text-slate-500">Feedback from buyers who purchased this product.</p>
                </div>

                {productReviews?.length ? (
                  <div className="max-h-56 space-y-3 overflow-y-auto pr-2">
                    {productReviews.map((review) => (
                      <div key={review.reviewId} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-semibold text-slate-800">{review.reviewerName}</p>
                          <p className="text-sm text-slate-500">{review.reviewDate}</p>
                        </div>
                        <div className="mb-2 flex items-center gap-1 text-amber-600">
                          {Array.from({ length: review.rating }).map((_, index) => (
                            <FaStar key={index} />
                          ))}
                        </div>
                        <p className="text-sm text-slate-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No reviews yet for this product.</p>
                )}

                {!user ? (
                  <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-600">
                    Please login with your buyer account after purchasing this product to add a review.
                  </div>
                ) : !isBuyerUser ? (
                  <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-600">
                    Reviews can only be added by buyers using a customer account. Seller and admin accounts can view reviews only.
                  </div>
                ) : productReviewEligibility?.canReview ? (
                  <form className="space-y-3 rounded-lg border bg-slate-50 p-4" onSubmit={onSubmitReview}>
                    <h4 className="font-semibold text-slate-800">
                      {productReviewEligibility?.alreadyReviewed ? "Update Your Review" : "Write a Review"}
                    </h4>
                    <TextField
                      select
                      fullWidth
                      label="Rating"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      SelectProps={{ native: true }}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} Star{value > 1 ? "s" : ""}
                        </option>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label="Comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this product"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="rounded-md bg-custom-blue px-4 py-2 font-semibold text-white"
                      >
                        {productReviewEligibility?.alreadyReviewed ? "Update Review" : "Submit Review"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-600">
                    {productReviewEligibility?.message || "Buy this product successfully to add your review."}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 px-6 py-4">
              <button
                onClick={() => setOpen(false)}
                type="button"
                className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-800 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default ProductViewModal;
