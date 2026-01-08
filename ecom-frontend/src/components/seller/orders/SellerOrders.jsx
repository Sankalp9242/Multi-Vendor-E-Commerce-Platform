import React, { useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import OrderTable from "../../admin/orders/OrderTable";
import { fetchSellerOrders } from "../../../store/actions";


const SellerOrders = () => {
  const dispatch = useDispatch();
  const { orders, pagination } = useSelector(state => state.sellerOrders);

  useEffect(() => {
    dispatch(fetchSellerOrders());
  }, []);

  const emptyOrder = !orders || orders.length === 0;

  return (
    <div className="pb-6 pt-20">
      {emptyOrder ? (
        <div className="flex flex-col items-center justify-center text-gray-600 py-10">
          <FaShoppingCart size={50} className="mb-3" />
          <h2 className="text-2xl font-semibold">No Orders Yet</h2>
        </div>
      ) : (
        <OrderTable adminOrder={orders} pagination={pagination} />
      )}
    </div>
  );
};

export default SellerOrders;
