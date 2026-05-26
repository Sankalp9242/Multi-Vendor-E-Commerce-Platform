const initialState = {
  adminOrders: [],
  userOrders: [],
  pagination: {},
};

const updateOrderList = (orders, updatedOrder) =>
  orders.map((order) =>
    order.orderId === updatedOrder.orderId ? { ...order, ...updatedOrder } : order
  );

export const orderReducer = (state = initialState, action) => {
  switch (action.type) {

    // Admin / Seller Orders
    case "GET_ADMIN_ORDERS":
      return {
        ...state,
        adminOrders: action.payload,
        pagination: {
          pageNumber: action.pageNumber,
          pageSize: action.pageSize,
          totalElements: action.totalElements,
          totalPages: action.totalPages,
          lastPage: action.lastPage,
        },
      };

    // ✅ User Orders
    case "GET_USER_ORDERS":
      return {
        ...state,
        userOrders: action.payload,
        pagination: action.pagination,
      };

    case "UPDATE_ADMIN_ORDER":
      return {
        ...state,
        adminOrders: updateOrderList(state.adminOrders, action.payload),
      };

    case "UPDATE_USER_ORDER":
      return {
        ...state,
        userOrders: updateOrderList(state.userOrders, action.payload),
      };

    default:
      return state;
  }
};
