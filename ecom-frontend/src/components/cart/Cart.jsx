import { useEffect } from "react";
import { MdArrowBack, MdShoppingCart } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ItemContent from "./ItemContent";
import CartEmpty from "./CartEmpty";
import { formatPrice } from "../../utils/formatPrice";
import { applyCouponToUserCart, getUserCart, removeCouponFromUserCart } from "../../store/actions";
import { useState } from "react";
import toast from "react-hot-toast";

const Cart = () => {
    const dispatch = useDispatch();
    const { cart, totalPrice, subtotalPrice, discountAmount, appliedCouponCode, cartId } = useSelector((state) => state.carts);
    const [couponCode, setCouponCode] = useState("");
    const [couponLoader, setCouponLoader] = useState(false);

    useEffect(() => {
        dispatch(getUserCart());
    }, [dispatch]);

    if (!cart || cart.length === 0) return <CartEmpty />;

    return (
        <div className="lg:px-14 sm:px-8 px-4 py-10">
            <div className="flex flex-col items-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <MdShoppingCart size={36} className="text-gray-700" />
                    Your Cart
                </h1>
                <p className="text-lg text-gray-600 mt-2">All your selected items</p>
            </div>

            <div className="grid md:grid-cols-5 grid-cols-4 gap-4 pb-2 font-semibold items-center">
                <div className="md:col-span-2 justify-self-start text-lg text-slate-800 lg:ps-4">
                    Product
                </div>

                <div className="justify-self-center text-lg text-slate-800">
                    Price
                </div>

                <div className="justify-self-center text-lg text-slate-800">
                    Quantity
                </div>

                <div className="justify-self-center text-lg text-slate-800">
                    Total
                </div>
            </div>

            <div>
                {cart && cart.length > 0 &&
                    cart.map((item, i) => <ItemContent key={i} {...item} cartId={cartId} />)}
            </div>

            <div className="border-t-[1.5px] border-slate-200 py-4 flex sm:flex-row sm:px-0 px-2 flex-col sm:justify-between gap-4">
                <div></div>
                <div className="flex text-sm gap-1 flex-col">
                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <h2 className="mb-3 text-base font-semibold text-slate-800">Have a coupon?</h2>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                value={couponCode}
                                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                                placeholder="Enter coupon code"
                                className="flex-1 rounded-md border border-slate-300 px-4 py-2 outline-none focus:border-custom-blue"
                            />
                            <button
                                disabled={couponLoader || !couponCode.trim()}
                                onClick={() => dispatch(applyCouponToUserCart(couponCode, toast, setCouponLoader, setCouponCode))}
                                className="rounded-md bg-custom-blue px-5 py-2 font-semibold text-white transition hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {couponLoader ? "Applying..." : "Apply Coupon"}
                            </button>
                        </div>
                        {appliedCouponCode && (
                            <div className="mt-3 flex flex-col gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
                                <span>
                                    Applied coupon <strong>{appliedCouponCode}</strong> and saved {formatPrice(discountAmount)}
                                </span>
                                <button
                                    disabled={couponLoader}
                                    onClick={() => dispatch(removeCouponFromUserCart(toast, setCouponLoader))}
                                    className="font-semibold text-emerald-800 underline underline-offset-2"
                                >
                                    Remove coupon
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between w-full md:text-lg text-sm font-semibold">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotalPrice || totalPrice)}</span>
                    </div>
                    <div className="flex justify-between w-full md:text-lg text-sm font-semibold text-emerald-700">
                        <span>Discount</span>
                        <span>-{formatPrice(discountAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between w-full md:text-lg text-sm font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(totalPrice)}</span>
                    </div>

                    <p className="text-slate-500">
                        Taxes and shipping calculated at checkout
                    </p>

                    <Link className="w-full flex justify-end" to="/checkout">
                    <button
                        onClick={() => {}}
                        className="font-semibold w-[300px] py-2 px-4 rounded-xs bg-custom-blue text-white flex items-center justify-center gap-2 hover:text-gray-300 transition duration-500">
                        <MdShoppingCart size={20} />
                        Checkout
                    </button>
                    </Link>

                    <Link className="flex gap-2 items-center mt-2 text-slate-500" to="/products">
                        <MdArrowBack />
                        <span>Continue Shopping</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
