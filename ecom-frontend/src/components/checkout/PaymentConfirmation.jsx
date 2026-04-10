import { useEffect, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { stripePaymentConfirmation } from '../../store/actions';
import Skeleton from '../shared/Skeleton';

const PaymentConfirmation = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { cart } = useSelector((state) => state.carts);

  const paymentIntent = searchParams.get("payment_intent");
  const clientSecret = searchParams.get("payment_intent_client_secret");
  const redirectStatus = searchParams.get("redirect_status");
  const selectedUserCheckoutAddress = localStorage.getItem("CHECKOUT_ADDRESS")
    ? JSON.parse(localStorage.getItem("CHECKOUT_ADDRESS"))
    : null;

  useEffect(() => {
    if (
      paymentIntent &&
      clientSecret &&
      redirectStatus === "succeeded" &&
      selectedUserCheckoutAddress?.addressId &&
      cart?.length > 0
    ) {
      const sendData = {
        addressId: selectedUserCheckoutAddress.addressId,
        pgName: "Stripe",
        pgPaymentId: paymentIntent,
        pgStatus: "succeeded",
        pgResponseMessage: "Payment successful",
      };

      dispatch(stripePaymentConfirmation(sendData, setErrorMessage, setLoading, toast));
    }
  }, [paymentIntent, clientSecret, redirectStatus, selectedUserCheckoutAddress, cart, dispatch]);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      {loading ? (
        <div className='max-w-xl mx-auto'>
          <Skeleton />
        </div>
      ) : (
        <div className="p-8 rounded-lg shadow-lg text-center max-w-md mx-auto border border-gray-200">
          <div className="text-green-500 mb-4 flex justify-center">
            <FaCheckCircle size={64} />
          </div>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase! Your payment was successful, and we're processing your order.
          </p>
          {errorMessage && (
            <p className='text-red-600 font-medium'>{errorMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentConfirmation;
