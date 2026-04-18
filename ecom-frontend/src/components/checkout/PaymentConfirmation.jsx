import { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { clearCheckoutAddress, stripePaymentConfirmation } from "../../store/actions";
import Skeleton from "../shared/Skeleton";

const PaymentConfirmation = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const hasSubmittedRef = useRef(false);
  const { cart } = useSelector((state) => state.carts);
  const { address: userAddresses = [] } = useSelector((state) => state.auth);

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
    const addressBelongsToUser = !!selectedUserCheckoutAddress?.addressId
      && userAddresses.some((address) => address.addressId === selectedUserCheckoutAddress.addressId);

    if (
      hasSubmittedRef.current ||
      !paymentIntent ||
      !clientSecret ||
      redirectStatus !== "succeeded" ||
      !selectedUserCheckoutAddress?.addressId ||
      !addressBelongsToUser ||
      !cart?.length ||
      processedPaymentIntent
    ) {
      if (selectedUserCheckoutAddress?.addressId && userAddresses.length > 0 && !addressBelongsToUser) {
        dispatch(clearCheckoutAddress());
        setErrorMessage("Please select your address again before placing the order.");
      }
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
        () => sessionStorage.setItem(`processed-payment:${paymentIntent}`, "true")
      )
    );
  }, [
    paymentIntent,
    clientSecret,
    redirectStatus,
    selectedUserCheckoutAddress,
    userAddresses,
    cart,
    processedPaymentIntent,
    dispatch,
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      {loading ? (
        <div className="mx-auto max-w-xl">
          <Skeleton />
        </div>
      ) : (
        <div className="mx-auto max-w-md rounded-lg border border-gray-200 p-8 text-center shadow-lg">
          <div className="mb-4 flex justify-center text-green-500">
            <FaCheckCircle size={64} />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-gray-800">Payment Successful!</h2>
          <p className="mb-6 text-gray-600">
            Thank you for your purchase! Your payment was successful, and we are processing your order.
          </p>
          {errorMessage && <p className="font-medium text-red-600">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default PaymentConfirmation;
