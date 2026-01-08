const initialState = {
  adminOrders: [],
  userOrders: [],
  pagination: {},
};

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

    default:
      return state;
  }
};
