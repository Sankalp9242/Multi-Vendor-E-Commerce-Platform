import { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { stripePaymentConfirmation } from "../../store/actions";
import Skeleton from "../shared/Skeleton";

const PaymentConfirmation = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const hasSubmittedRef = useRef(false);

  const paymentIntent = searchParams.get("payment_intent");
  const clientSecret = searchParams.get("payment_intent_client_secret");
  const redirectStatus = searchParams.get("redirect_status");
  const selectedUserCheckoutAddress = localStorage.getItem("CHECKOUT_ADDRESS")
    ? JSON.parse(localStorage.getItem("CHECKOUT_ADDRESS"))
    : null;
  const processedPaymentIntent = paymentIntent
    ? sessionStorage.getItem(`processed-payment:${paymentIntent}`)
    : null;

  useEffect(() => {
    if (redirectStatus !== "succeeded" || !paymentIntent || !clientSecret) {
      setErrorMessage("Payment confirmation details are missing. Please try checkout again.");
      return;
    }

    if (processedPaymentIntent) {
      setOrderCreated(true);
      return;
    }

    if (!selectedUserCheckoutAddress?.addressId) {
      setErrorMessage("Please select an address again before placing the order.");
      return;
    }

    if (hasSubmittedRef.current) {
      return;
    }

    hasSubmittedRef.current = true;

    const sendData = {
      addressId: selectedUserCheckoutAddress.addressId,
      pgName: "Stripe",
      pgPaymentId: paymentIntent,
      pgStatus: "succeeded",
      pgResponseMessage: "Payment successful",
    };

    dispatch(
      stripePaymentConfirmation(
        sendData,
        setErrorMessage,
        setLoading,
        toast,
        () => {
          sessionStorage.setItem(`processed-payment:${paymentIntent}`, "true");
          setOrderCreated(true);
        }
      )
    );
  }, [
    clientSecret,
    dispatch,
    paymentIntent,
    processedPaymentIntent,
    redirectStatus,
    selectedUserCheckoutAddress,
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      {loading ? (
        <div className="mx-auto max-w-xl">
          <Skeleton />
        </div>
      ) : (
        <div className="mx-auto max-w-md rounded-lg border border-gray-200 p-8 text-center shadow-lg">
          <div className={`mb-4 flex justify-center ${orderCreated ? "text-green-500" : "text-red-500"}`}>
            {orderCreated ? <FaCheckCircle size={64} /> : <FaTimesCircle size={64} />}
          </div>

          <h2 className="mb-2 text-3xl font-bold text-gray-800">
            {orderCreated ? "Order Confirmed!" : "Order Could Not Be Created"}
          </h2>

          <p className="mb-6 text-gray-600">
            {orderCreated
              ? "Your payment was confirmed and the order has been placed successfully."
              : errorMessage || "We received the payment redirect, but the order creation step did not finish."}
          </p>

          {!orderCreated && errorMessage && <p className="font-medium text-red-600">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default PaymentConfirmation;
