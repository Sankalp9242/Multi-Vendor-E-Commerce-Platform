// store/sellerProductReducer.js
const initialState = {
  products: [],
  pagination: {},
};

const updateProductList = (products, updatedProduct) =>
  products.map((product) =>
    product.productId === updatedProduct.productId ? { ...product, ...updatedProduct } : product
  );

export const sellerProductReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_SELLER_PRODUCTS":
      return {
        ...state,
        products: action.payload.products,
        pagination: action.payload.pagination,
      };
    case "ADD_SELLER_PRODUCT":
      return {
        ...state,
        products: [action.payload, ...state.products],
        pagination: {
          ...state.pagination,
          totalElements: (state.pagination?.totalElements || 0) + 1,
        },
      };
    case "UPDATE_SELLER_PRODUCT":
      return {
        ...state,
        products: updateProductList(state.products, action.payload),
      };
    case "REMOVE_SELLER_PRODUCT":
      return {
        ...state,
        products: state.products.filter((product) => product.productId !== action.payload),
        pagination: {
          ...state.pagination,
          totalElements: Math.max((state.pagination?.totalElements || 1) - 1, 0),
        },
      };
    default:
      return state;
  }
};
