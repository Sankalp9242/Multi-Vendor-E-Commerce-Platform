const initialState = {
    analytics: {},
    commission: {},
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
            
        default:
            return state;
    }
};
