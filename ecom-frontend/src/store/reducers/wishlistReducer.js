const initialState = {
  items: [],
  productIds: [],
};

export const wishlistReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_WISHLIST": {
      const items = action.payload || [];
      return {
        ...state,
        items,
        productIds: items.map((item) => item.productId),
      };
    }
    case "ADD_WISHLIST_ITEM": {
      const item = action.payload;
      if (!item || state.productIds.includes(item.productId)) {
        return state;
      }

      return {
        ...state,
        items: [item, ...state.items],
        productIds: [item.productId, ...state.productIds],
      };
    }
    case "REMOVE_WISHLIST_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.payload),
        productIds: state.productIds.filter((productId) => productId !== action.payload),
      };
    case "CLEAR_WISHLIST":
      return initialState;
    default:
      return state;
  }
};
