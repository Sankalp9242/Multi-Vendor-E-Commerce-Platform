const initialState = {
  orders: [],
  pagination: {},
};

export const sellerOrderReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_SELLER_ORDERS":
      return {
        ...state,
        orders: action.payload.orders,
        pagination: action.payload.pagination,
      };
    default:
      return state;
  }
};
