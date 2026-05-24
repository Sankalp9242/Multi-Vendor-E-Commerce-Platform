import { Alert, Skeleton } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PaymentForm from "./PaymentForm";
import { createStripePaymentSecret } from "../../store/actions";

const isSecureStripeContext =
  typeof window === "undefined" ||
  window.isSecureContext ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const stripePublishableKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "").trim();
const stripePromise = isSecureStripeContext && stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

const StripePayment = () => {
  const dispatch = useDispatch();
  const { clientSecret } = useSelector((state) => state.auth);
  const { totalPrice } = useSelector((state) => state.carts);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const { user, selectedUserCheckoutAddress } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!clientSecret) {
      const storedClientSecret = JSON.parse(localStorage.getItem("client-secret") || "null");
      if (storedClientSecret) {
        dispatch({ type: "CLIENT_SECRET", payload: storedClientSecret });
      }
    }
  }, [clientSecret, dispatch]);

  useEffect(() => {
    if (
      isSecureStripeContext &&
      stripePublishableKey &&
      !clientSecret &&
      totalPrice &&
      user?.email &&
      user?.username &&
      selectedUserCheckoutAddress
    ) {
      const sendData = {
        amount: Number(totalPrice) * 100,
        currency: "usd",
        email: user.email,
        name: `${user.username}`,
        address: selectedUserCheckoutAddress,
        description: `Order for ${user.email}`,
        metadata: {
          test: "1",
        },
      };
      dispatch(createStripePaymentSecret(sendData));
    }
  }, [clientSecret, totalPrice, user, selectedUserCheckoutAddress, dispatch]);

  if (!isSecureStripeContext) {
    return (
      <Alert severity="warning" className="mx-auto max-w-lg">
        Stripe checkout requires HTTPS or localhost. Open the frontend with `https://...` or `http://localhost`.
      </Alert>
    );
  }

  if (!stripePublishableKey) {
    return (
      <Alert severity="error" className="mx-auto max-w-lg">
        Stripe publishable key is missing. Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in the frontend environment.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg">
        <Skeleton />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <Alert severity="error" className="mx-auto max-w-lg">
        {errorMessage}
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      {!clientSecret && (
        <Alert severity="info">
          Preparing secure payment form. If this takes too long, go back once and reopen the payment step.
        </Alert>
      )}

      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm clientSecret={clientSecret} totalPrice={totalPrice} />
        </Elements>
      )}
    </div>
  );
};

export default StripePayment;
