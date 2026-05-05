const initialState = {
  userReports: null,
  sellerReports: null,
  adminReports: null,
};

export const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_USER_REPORTS":
      return {
        ...state,
        userReports: action.payload,
      };
    case "FETCH_SELLER_REPORTS":
      return {
        ...state,
        sellerReports: action.payload,
      };
    case "FETCH_ADMIN_REPORTS":
      return {
        ...state,
        adminReports: action.payload,
      };
    default:
      return state;
  }
};
