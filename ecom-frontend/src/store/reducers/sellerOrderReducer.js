const initialState = {
  orders: [],
  pagination: {},
};

const updateOrderList = (orders, updatedOrder) =>
  orders.map((order) =>
    order.orderId === updatedOrder.orderId ? { ...order, ...updatedOrder } : order
  );

export const sellerOrderReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_SELLER_ORDERS":
      return {
        ...state,
        orders: action.payload.orders,
        pagination: action.payload.pagination,
      };
    case "UPDATE_SELLER_ORDER":
      return {
        ...state,
        orders: updateOrderList(state.orders, action.payload),
      };
    default:
      return state;
  }
};
