import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchCurrentUser, updateSellerProfile } from "../../../store/actions";
import Loader from "../../shared/Loader";

const SellerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.errors);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      storeName: "",
      storeDescription: "",
    },
  });

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    reset({
      storeName: user?.storeName || "",
      storeDescription: user?.storeDescription || "",
    });
  }, [user, reset]);

  const onSubmit = (data) => {
    dispatch(
      updateSellerProfile(
        {
          storeName: data.storeName.trim(),
          storeDescription: data.storeDescription.trim(),
        },
        toast,
        setSaving,
        navigate
      )
    );
  };

  if (isLoading && !user) {
    return <Loader text="Loading your store profile..." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pt-10">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-5">
        <h1 className="text-3xl font-bold text-slate-800">Seller Profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Update your store identity here. These details are shown across the seller dashboard and product listings.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="storeName">
            Store Name
          </label>
          <input
            id="storeName"
            type="text"
            className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Enter your store name"
            {...register("storeName", {
              required: "Store name is required",
              minLength: {
                value: 3,
                message: "Store name must be at least 3 characters",
              },
              maxLength: {
                value: 100,
                message: "Store name must be at most 100 characters",
              },
            })}
          />
          {errors.storeName && <p className="text-sm text-red-600">{errors.storeName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="storeDescription">
            Store Description
          </label>
          <textarea
            id="storeDescription"
            rows={6}
            className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Tell buyers what your store is about"
            {...register("storeDescription", {
              required: "Store description is required",
              minLength: {
                value: 10,
                message: "Store description must be at least 10 characters",
              },
              maxLength: {
                value: 1000,
                message: "Store description must be at most 1000 characters",
              },
            })}
          />
          {errors.storeDescription && <p className="text-sm text-red-600">{errors.storeDescription.message}</p>}
        </div>

        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Preview</p>
          <p className="mt-2 font-medium text-slate-700">{user?.storeName || "Your store name will appear here"}</p>
          <p className="mt-1">{user?.storeDescription || "Your store description will appear here after you save it."}</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-custom-blue px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Store Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerProfile;
