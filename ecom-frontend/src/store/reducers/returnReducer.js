const initialState = {
  buyerReturns: [],
  sellerReturns: [],
  adminReturns: [],
};

export const returnReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_BUYER_RETURNS":
      return {
        ...state,
        buyerReturns: action.payload,
      };
    case "FETCH_SELLER_RETURNS":
      return {
        ...state,
        sellerReturns: action.payload,
      };
    case "FETCH_ADMIN_RETURNS":
      return {
        ...state,
        adminReturns: action.payload,
      };
    default:
      return state;
  }
};
