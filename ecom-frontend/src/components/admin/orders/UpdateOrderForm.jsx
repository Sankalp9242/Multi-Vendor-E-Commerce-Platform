import { Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from "@mui/material";
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
      <form className="space-y-4" onSubmit={updateOrderStatus}>
        <FormControl fullWidth variant="outlined" error={!!error}>
          <InputLabel id="order-status-label">Order Status</InputLabel>
          <Select
            labelId="order-status-label"
            label="Order Status"
            value={orderStatus}
            onChange={(e) => {
              setOrderStatus(e.target.value);
              setError("");
            }}
          >
            {ORDER_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>

          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>

        <TextField
          fullWidth
          label="Carrier Name"
          value={carrierName}
          onChange={(e) => {
            setCarrierName(e.target.value);
            setError("");
          }}
          placeholder="Blue Dart, Delhivery, DHL..."
        />

        <TextField
          fullWidth
          label="Tracking Number"
          value={trackingNumber}
          onChange={(e) => {
            setTrackingNumber(e.target.value);
            setError("");
          }}
          placeholder="Enter shipment tracking number"
        />

        <TextField
          fullWidth
          type="date"
          label="Estimated Delivery Date"
          value={estimatedDeliveryDate}
          onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

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
