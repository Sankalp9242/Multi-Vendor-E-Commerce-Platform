const initialState = {
    analytics: {},
    commission: {},
    coupons: [],
    couponPagination: {},
};

export const adminReducer = (state = initialState, action) => {
    switch (action.type) {
        case "FETCH_ANALYTICS":
            return {
                ...state,
                analytics: action.payload,
            };
        case "FETCH_COMMISSION":
            return {
                ...state,
                commission: action.payload,
            };
        case "FETCH_COUPONS":
            return {
                ...state,
                coupons: action.payload,
                couponPagination: action.pagination || {},
            };
            
        default:
            return state;
    }
};
