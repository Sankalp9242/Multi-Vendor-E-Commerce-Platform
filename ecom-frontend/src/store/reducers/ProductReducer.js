const initialState = {
    products: null,
    categories: null,
    productReviews: [],
    productReviewEligibility: null,
    pagination: {},
};

const updateProductList = (products, updatedProduct) => {
    if (!products || !updatedProduct) {
        return products;
    }

    return products.map((product) =>
        product.productId === updatedProduct.productId ? { ...product, ...updatedProduct } : product
    );
};

const removeProductFromList = (products, productId) => {
    if (!products) {
        return products;
    }

    return products.filter((product) => product.productId !== productId);
};

export const productReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_PRODUCTS":
            return {
                ...state,
                products: action.payload,
                pagination: {
                    ...state.pagination,
                    pageNumber: action.pageNumber,
                    pageSize: action.pageSize,
                    totalElements: action.totalElements,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };
    
        case "FETCH_CATEGORIES":
            return {
                ...state,
                categories: action.payload,
                pagination: {
                    ...state.pagination,
                    pageNumber: action.pageNumber,
                    pageSize: action.pageSize,
                    totalElements: action.totalElements,
                    totalPages: action.totalPages,
                    lastPage: action.lastPage,
                },
            };

        case "FETCH_PRODUCT_REVIEWS":
            return {
                ...state,
                productReviews: action.payload,
            };

        case "FETCH_PRODUCT_REVIEW_ELIGIBILITY":
            return {
                ...state,
                productReviewEligibility: action.payload,
            };

        case "UPDATE_PRODUCT_IN_LIST":
            return {
                ...state,
                products: updateProductList(state.products, action.payload),
            };

        case "REMOVE_PRODUCT_FROM_LIST":
            return {
                ...state,
                products: removeProductFromList(state.products, action.payload),
                pagination: {
                    ...state.pagination,
                    totalElements: Math.max((state.pagination?.totalElements || 1) - 1, 0),
                },
            };
        
    
        default:
            return state;
    }
};
