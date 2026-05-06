import { useState } from "react";
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import ProductViewModal from "./ProductViewModal";
import truncateText from "../../utils/truncateText";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, toggleProductWishlist } from "../../store/actions";
import toast from "react-hot-toast";

const ProductCard = ({
  productId,
  productName,
  image,
  description,
  quantity,
  price,
  discount,
  specialPrice,
  averageRating,
  reviewCount,
  sellerName,
  productStatus,
  about = false,
}) => {
  const [openProductViewModal, setOpenProductViewModal] = useState(false);
  const btnLoader = false;
  const [selectedViewProduct, setSelectedViewProduct] = useState("");
  const isAvailable = quantity && Number(quantity) > 0;
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { productIds } = useSelector((state) => state.wishlist);
  const isWishlisted = productIds.includes(productId);

  const handleProductView = (product) => {
    if (!about) {
      setSelectedViewProduct(product);
      setOpenProductViewModal(true);
    }
  };

  const addToCartHandler = (cartItems) => {
    dispatch(addToCart(cartItems, 1, toast));
  };

  const wishlistHandler = (event) => {
    event.stopPropagation();
    if (!user) {
      toast.error("Please login to use wishlist");
      return;
    }
    dispatch(toggleProductWishlist(productId, isWishlisted, toast));
  };

  return (
    <div className="overflow-hidden rounded-lg border shadow-xl transition-shadow duration-300">
      <div
        onClick={() => {
          handleProductView({
            id: productId,
            productName,
            image,
            description,
            quantity,
            price,
            discount,
            specialPrice,
            averageRating,
            reviewCount,
            sellerName,
            productStatus,
          });
        }}
        className="relative aspect-3/2 w-full overflow-hidden"
      >
        {!about && (
          <button
            type="button"
            onClick={wishlistHandler}
            className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-rose-600 shadow-md transition hover:bg-rose-50"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlisted ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
        <img
          className="h-full w-full cursor-pointer transform transition-transform duration-300 hover:scale-105"
          src={image}
          alt={productName}
        />
      </div>
      <div className="p-4">
        <h2
          onClick={() => {
            handleProductView({
              id: productId,
              productName,
              image,
              description,
              quantity,
              price,
              discount,
              specialPrice,
              averageRating,
              reviewCount,
              sellerName,
              productStatus,
            });
          }}
          className="mb-2 cursor-pointer text-lg font-semibold"
        >
          {truncateText(productName, 50)}
        </h2>

        <div className="mb-3 flex items-center gap-2 text-sm text-amber-600">
          <FaStar />
          <span>{Number(averageRating || 0).toFixed(1)}</span>
          <span className="text-slate-500">({reviewCount || 0} reviews)</span>
        </div>

        <div className="max-h-20 min-h-20">
          <p className="text-sm text-gray-600">{truncateText(description, 80)}</p>
        </div>

        {!about && (
          <div className="flex items-center justify-between">
            {specialPrice ? (
              <div className="flex flex-col">
                <span className="text-gray-400 line-through">${Number(price).toFixed(2)}</span>
                <span className="text-xl font-bold text-slate-700">
                  ${Number(specialPrice).toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-slate-700">${Number(price).toFixed(2)}</span>
            )}

            <button
              disabled={!isAvailable || btnLoader}
              onClick={() =>
                addToCartHandler({
                  image,
                  productName,
                  description,
                  specialPrice,
                  price,
                  productId,
                  quantity,
                })
              }
              className={`w-36 justify-center rounded-lg bg-blue-500 px-3 py-2 text-white transition-colors duration-300 ${
                isAvailable ? "opacity-100 hover:bg-blue-600" : "opacity-70"
              } flex items-center`}
            >
              <FaShoppingCart className="mr-2" />
              {isAvailable ? "Add to Cart" : "Stock Out"}
            </button>
          </div>
        )}
      </div>
      <ProductViewModal
        open={openProductViewModal}
        setOpen={setOpenProductViewModal}
        product={selectedViewProduct}
        isAvailable={isAvailable}
      />
    </div>
  );
};

export default ProductCard;
