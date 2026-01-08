// store/sellerProductReducer.js
const initialState = {
  products: [],
  pagination: {},
};

export const sellerProductReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_SELLER_PRODUCTS":
      return {
        ...state,
        products: action.payload.products,
        pagination: action.payload.pagination,
      };
    default:
      return state;
  }
};
