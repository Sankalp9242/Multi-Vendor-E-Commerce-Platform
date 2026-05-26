const initialState = {
  sellers: null,
  pagination: {},
  analytics: {},
};

const updateSellerList = (sellers, updatedSeller) => {
  if (!sellers || !updatedSeller) {
    return sellers;
  }

  const updatedSellerId = updatedSeller.userId ?? updatedSeller.id;

  return sellers.map((seller) =>
    seller.userId === updatedSellerId || seller.id === updatedSellerId
      ? { ...seller, ...updatedSeller }
      : seller
  );
};

export const sellerReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_SELLER_ANALYTICS":
      return {
        ...state,
        analytics: action.payload,
      };
    case "GET_SELLERS":
      return {
        ...state,
        sellers: action.payload,
        pagination: {
          ...state.pagination,
          pageNumber: action.pageNumber,
          pageSize: action.pageSize,
          totalElements: action.totalElements,
          totalPages: action.totalPages,
          lastPage: action.lastPage,
        },
      };
    case "UPDATE_SELLER_IN_LIST":
      return {
        ...state,
        sellers: updateSellerList(state.sellers, action.payload),
      };
    default:
      return state;
  }
};
