import { useEffect } from "react";
import { FaHeartBroken } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "../../store/actions";
import ProductCard from "../shared/ProductCard";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const products = items.map((item) => item.product).filter(Boolean);

  return (
    <div className="lg:px-14 sm:px-8 px-4 py-14 2xl:w-[90%] 2xl:mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Wishlist</h1>
        <p className="mt-2 text-slate-600">Products you saved for later.</p>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-center text-slate-600">
          <FaHeartBroken className="mb-4 text-4xl text-rose-500" />
          <h2 className="text-xl font-semibold text-slate-800">Your wishlist is empty</h2>
          <p className="mt-2 text-sm">Tap the heart on products you want to revisit.</p>
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.productId} {...product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
