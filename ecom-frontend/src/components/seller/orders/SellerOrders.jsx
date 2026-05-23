import { useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import OrderTable from "../../admin/orders/OrderTable";
import { fetchSellerOrders } from "../../../store/actions";
import { useSearchParams } from "react-router-dom";


const SellerOrders = () => {
  const dispatch = useDispatch();
  const { orders, pagination } = useSelector(state => state.sellerOrders);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    const currentPage = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1;

    params.set("pageNumber", currentPage - 1);
    params.set("sortBy", "orderDate");
    params.set("sortOrder", "desc");
    dispatch(fetchSellerOrders(params.toString()));
  }, [dispatch, searchParams]);

  const emptyOrder = !orders || orders.length === 0;

  return (
    <div className="pb-6 pt-20">
      {emptyOrder ? (
        <div className="flex flex-col items-center justify-center text-gray-600 py-10">
          <FaShoppingCart size={50} className="mb-3" />
          <h2 className="text-2xl font-semibold">No Orders Yet</h2>
        </div>
      ) : (
        <OrderTable
          adminOrder={orders}
          pagination={pagination}
          title="Seller Orders"
          showDetails
        />
      )}
    </div>
  );
};

export default SellerOrders;
