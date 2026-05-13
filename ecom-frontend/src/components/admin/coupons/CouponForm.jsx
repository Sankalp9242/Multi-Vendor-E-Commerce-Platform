import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createCouponDashboardAction,
  updateCouponDashboardAction,
} from "../../../store/actions";
import { useDispatch } from "react-redux";

const getInitialFormState = (coupon) => ({
  code: coupon?.code || "",
  description: coupon?.description || "",
  discountPercentage: coupon?.discountPercentage ?? "",
  minimumOrderAmount: coupon?.minimumOrderAmount ?? "",
  expiryDate: coupon?.expiryDate || "",
  active: coupon?.active ?? true,
});

const CouponForm = ({ coupon, setOpen }) => {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const [formState, setFormState] = useState(getInitialFormState(coupon));

  useEffect(() => {
    setFormState(getInitialFormState(coupon));
  }, [coupon]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormState(getInitialFormState(null));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const sendData = {
      ...formState,
      discountPercentage: Number(formState.discountPercentage),
      minimumOrderAmount: Number(formState.minimumOrderAmount),
      expiryDate: formState.expiryDate || null,
    };

    if (!sendData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    if (coupon?.couponId) {
      dispatch(
        updateCouponDashboardAction(
          coupon.couponId,
          sendData,
          toast,
          resetForm,
          setOpen,
          setLoader
        )
      );
      return;
    }

    dispatch(createCouponDashboardAction(sendData, toast, resetForm, setOpen, setLoader));
  };

  return (
    <form className="space-y-5 pt-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Coupon Code</label>
          <input
            name="code"
            value={formState.code}
            onChange={handleChange}
            placeholder="SAVE10"
            className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-custom-blue"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Discount Percentage</label>
          <input
            name="discountPercentage"
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            value={formState.discountPercentage}
            onChange={handleChange}
            placeholder="10"
            className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-custom-blue"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Minimum Order Amount</label>
          <input
            name="minimumOrderAmount"
            type="number"
            min="0"
            step="0.01"
            value={formState.minimumOrderAmount}
            onChange={handleChange}
            placeholder="500"
            className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-custom-blue"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Expiry Date</label>
          <input
            name="expiryDate"
            type="date"
            value={formState.expiryDate}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-custom-blue"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
        <textarea
          name="description"
          value={formState.description}
          onChange={handleChange}
          rows="4"
          placeholder="Festival promotion for first-time buyers"
          className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-custom-blue"
        />
      </div>

      <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
        <input
          name="active"
          type="checkbox"
          checked={formState.active}
          onChange={handleChange}
          className="h-4 w-4"
        />
        Coupon is active
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loader}
          className="rounded-md bg-custom-blue px-6 py-3 font-semibold text-white transition hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loader ? "Saving..." : coupon?.couponId ? "Update Coupon" : "Create Coupon"}
        </button>
      </div>
    </form>
  );
};

export default CouponForm;
