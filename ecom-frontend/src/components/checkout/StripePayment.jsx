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

const stripePromise = isSecureStripeContext
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const StripePayment = () => {
  const dispatch = useDispatch();
  const { clientSecret } = useSelector((state) => state.auth);
  const { totalPrice } = useSelector((state) => state.carts);
  const { isLoading } = useSelector((state) => state.errors);
  const { user, selectedUserCheckoutAddress } = useSelector((state) => state.auth);

  useEffect(() => {
    if (
      isSecureStripeContext &&
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg">
        <Skeleton />
      </div>
    );
  }

  return (
    <>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm clientSecret={clientSecret} totalPrice={totalPrice} />
        </Elements>
      )}
    </>
  );
};

export default StripePayment;
