import { Button, FormControl, FormHelperText, MenuItem, Select, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import Spinners from "../../shared/Spinners";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderStatusFromDashboard } from "../../../store/actions";
import toast from "react-hot-toast";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const UpdateOrderForm = ({ setOpen, selectedId, selectedItem, loader, setLoader }) => {
  const [orderStatus, setOrderStatus] = useState(selectedItem?.status || "PENDING");
  const [carrierName, setCarrierName] = useState(selectedItem?.carrierName || "");
  const [trackingNumber, setTrackingNumber] = useState(selectedItem?.trackingNumber || "");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(
    selectedItem?.estimatedDeliveryDate || ""
  );
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user?.roles?.includes("ROLE_ADMIN");

  const requiresShippingInfo = useMemo(
    () => orderStatus === "SHIPPED" || orderStatus === "DELIVERED",
    [orderStatus]
  );

  const updateOrderStatus = (e) => {
    e.preventDefault();

    if (!orderStatus) {
      setError("Order status is required");
      return;
    }

    if (requiresShippingInfo && (!carrierName.trim() || !trackingNumber.trim())) {
      setError("Carrier name and tracking number are required for shipped or delivered orders");
      return;
    }

    dispatch(
      updateOrderStatusFromDashboard(
        selectedId,
        {
          status: orderStatus,
          carrierName: carrierName.trim() || null,
          trackingNumber: trackingNumber.trim() || null,
          estimatedDeliveryDate: estimatedDeliveryDate || null,
        },
        toast,
        setLoader,
        isAdmin
      )
    );
  };

  return (
    <div className="relative h-full py-5">
      <form className="space-y-5 pb-24" onSubmit={updateOrderStatus}>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">Order Status</label>
          <FormControl fullWidth variant="outlined" error={!!error}>
          <Select
            displayEmpty
            value={orderStatus}
            onChange={(e) => {
              setOrderStatus(e.target.value);
              setError("");
            }}
            sx={{ backgroundColor: "white" }}
          >
            {ORDER_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>

            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">Carrier Name</label>
          <TextField
            fullWidth
            value={carrierName}
            onChange={(e) => {
              setCarrierName(e.target.value);
              setError("");
            }}
            placeholder="Blue Dart, Delhivery, DHL..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">Tracking Number</label>
          <TextField
            fullWidth
            value={trackingNumber}
            onChange={(e) => {
              setTrackingNumber(e.target.value);
              setError("");
            }}
            placeholder="Enter shipment tracking number"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">Estimated Delivery Date</label>
          <TextField
            fullWidth
            type="date"
            value={estimatedDeliveryDate}
            onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
          />
        </div>

        <div className="absolute bottom-14 flex w-full items-center justify-between">
          <Button
            disabled={loader}
            onClick={() => setOpen(false)}
            variant="outlined"
            className="px-4 py-[10px] text-sm font-medium text-white"
          >
            Cancel
          </Button>

          <Button
            disabled={loader}
            type="submit"
            variant="contained"
            color="primary"
            className="bg-custom-blue px-4 py-[10px] text-sm font-medium text-white"
          >
            {loader ? (
              <div className="flex items-center gap-2">
                <Spinners /> Loading...
              </div>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateOrderForm;
