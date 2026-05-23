import api from "../../api/api"
import { sortOrdersByWorkflowPriority } from "../../utils/orderSorting";

const buildOrderQueryString = (queryString = "") => {
    const params = new URLSearchParams(queryString);
    if (!params.has("pageNumber")) {
        params.set("pageNumber", "0");
    }
    if (!params.has("sortBy")) {
        params.set("sortBy", "orderDate");
    }
    if (!params.has("sortOrder")) {
        params.set("sortOrder", "desc");
    }
    return params.toString();
};

export const fetchProducts = (queryString) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/public/products?${queryString}`);
        dispatch({
            type: "FETCH_PRODUCTS",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch products",
         });
    }
};

export const fetchProductReviews = (productId) => async (dispatch) => {
    try {
        const { data } = await api.get(`/public/products/${productId}/reviews`);
        dispatch({
            type: "FETCH_PRODUCT_REVIEWS",
            payload: data,
        });
    } catch {
        dispatch({
            type: "FETCH_PRODUCT_REVIEWS",
            payload: [],
        });
    }
};

export const fetchProductReviewEligibility = (productId) => async (dispatch) => {
    try {
        const { data } = await api.get(`/products/${productId}/reviews/eligibility`);
        dispatch({
            type: "FETCH_PRODUCT_REVIEW_ELIGIBILITY",
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: "FETCH_PRODUCT_REVIEW_ELIGIBILITY",
            payload: {
                canReview: false,
                alreadyReviewed: false,
                message: error?.response?.data?.message || "You are not eligible to review this product",
            },
        });
    }
};

export const submitProductReview = (productId, sendData, toast) => async (dispatch) => {
    try {
        await api.post(`/products/${productId}/reviews`, sendData);
        toast.success("Review submitted successfully");
        await dispatch(fetchProductReviews(productId));
        await dispatch(fetchProductReviewEligibility(productId));
        await dispatch(fetchProducts("pageNumber=0"));
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to submit review");
    }
};

export const fetchWishlist = () => async (dispatch) => {
    try {
        const { data } = await api.get("/wishlist");
        dispatch({ type: "FETCH_WISHLIST", payload: data });
    } catch (error) {
        dispatch({
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch wishlist",
        });
    }
};

export const addProductToWishlist = (productId, toast) => async (dispatch) => {
    try {
        const { data } = await api.post(`/wishlist/products/${productId}`);
        dispatch({ type: "ADD_WISHLIST_ITEM", payload: data });
        toast?.success("Added to wishlist");
    } catch (error) {
        toast?.error(error?.response?.data?.message || "Failed to add to wishlist");
    }
};

export const removeProductFromWishlist = (productId, toast) => async (dispatch) => {
    try {
        await api.delete(`/wishlist/products/${productId}`);
        dispatch({ type: "REMOVE_WISHLIST_ITEM", payload: productId });
        toast?.success("Removed from wishlist");
    } catch (error) {
        toast?.error(error?.response?.data?.message || "Failed to remove from wishlist");
    }
};

export const toggleProductWishlist = (productId, isWishlisted, toast) => async (dispatch) => {
    if (isWishlisted) {
        await dispatch(removeProductFromWishlist(productId, toast));
    } else {
        await dispatch(addProductToWishlist(productId, toast));
    }
};


export const fetchSellerProducts = (queryString = "") => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });

    const { data } = await api.get(`/seller/products?${queryString}`);

    dispatch({
      type: "FETCH_SELLER_PRODUCTS",
      payload: {
        products: data.content,
        pagination: {
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          lastPage: data.lastPage,
        },
      },
    });

    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch seller products",
    });
  }
};


export const fetchSellerOrders = (queryString = "") => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const normalizedQuery = buildOrderQueryString(queryString);
        const res = await api.get(`/seller/orders?${normalizedQuery}`);
        dispatch({
          type: "FETCH_SELLER_ORDERS",
          payload: {
          orders: sortOrdersByWorkflowPriority(res.data.content),
          pagination: {
            pageNumber: res.data.pageNumber,
            pageSize: res.data.pageSize,
            totalElements: res.data.totalElements,
            totalPages: res.data.totalPages,
          },
        },
      });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        dispatch({
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch seller orders",
        });
    }
};



export const fetchCategories = () => async (dispatch) => {
    try {
        dispatch({ type: "CATEGORY_LOADER" });
        const { data } = await api.get(`/public/categories`);
        dispatch({
            type: "FETCH_CATEGORIES",
            payload: data.content,
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "CATEGORY_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch categories",
         });
    }
};


export const addToCart = (data, qty = 1, toast) => 
    async (dispatch) => {
        try {
            await api.post(`/carts/products/${data.productId}/quantity/${qty}`);
            await dispatch(getUserCart());
            toast.success(`${data?.productName} added to the cart`);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to add item to cart");
        }
};


export const increaseCartQuantity = 
    (data, toast, currentQuantity, setCurrentQuantity) =>
    async (dispatch) => {
        try {
            await api.put(`/cart/products/${data.productId}/quantity/add`);
            const newQuantity = currentQuantity + 1;
            setCurrentQuantity(newQuantity);
            await dispatch(getUserCart());
        } catch (error) {
            toast.error(error?.response?.data?.message || "Quantity reached limit");
        }
    };



export const decreaseCartQuantity = 
    (data) => async (dispatch) => {
        try {
            await api.put(`/cart/products/${data.productId}/quantity/delete`);
            await dispatch(getUserCart());
        } catch (error) {
            console.log(error);
        }
    }

export const removeFromCart =  (data, toast) => async (dispatch) => {
    try {
        await api.delete(`/carts/${data.cartId}/product/${data.productId}`);
        await dispatch(getUserCart());
        toast.success(`${data.productName} removed from cart`);
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to remove item from cart");
    }
}



export const authenticateSignInUser 
    = (sendData, toast, reset, navigate, setLoader) => async (dispatch) => {
        try {
            setLoader(true);
            const { data } = await api.post("/auth/signin", sendData);
            dispatch({ type: "LOGIN_USER", payload: data });
            localStorage.setItem("auth", JSON.stringify(data));
            reset();
            toast.success("Login Success");
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Internal Server Error");
        } finally {
            setLoader(false);
        }
}


export const registerNewUser 
    = (sendData, toast, reset, navigate, setLoader) => async () => {
        try {
            setLoader(true);
            const { data } = await api.post("/auth/signup", sendData);
            reset();
            toast.success(data?.message || "User Registered Successfully");
            navigate("/login");
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || error?.response?.data?.password || "Internal Server Error");
        } finally {
            setLoader(false);
        }
};


export const logOutUser = (navigate) => async (dispatch) => {
    try {
        await api.post("/auth/signout");
    } catch (error) {
        console.log(error);
    }
    dispatch({ type:"LOG_OUT" });
    dispatch({ type:"CLEAR_WISHLIST" });
    localStorage.removeItem("auth");
    localStorage.removeItem("CHECKOUT_ADDRESS");
    localStorage.removeItem("client-secret");
    localStorage.removeItem("cartItems");
    navigate("/login");
};

export const fetchCurrentUser = () => async (dispatch, getState) => {
    try {
        const { data } = await api.get("/auth/user");
        const existingAuth = getState().auth.user || JSON.parse(localStorage.getItem("auth") || "null");
        const mergedUser = {
            ...existingAuth,
            ...data,
            jwtToken: data?.jwtToken || existingAuth?.jwtToken,
        };
        dispatch({ type: "LOGIN_USER", payload: mergedUser });
        localStorage.setItem("auth", JSON.stringify(mergedUser));
    } catch (error) {
        console.log(error);
    }
};

export const updateSellerProfile =
    (sendData, toast, setLoader, navigate) => async (dispatch, getState) => {
        try {
            setLoader?.(true);
            const { data } = await api.put("/seller/profile", sendData);
            const existingAuth = getState().auth.user || JSON.parse(localStorage.getItem("auth") || "null");
            const mergedUser = {
                ...existingAuth,
                ...data,
                jwtToken: data?.jwtToken || existingAuth?.jwtToken,
            };
            dispatch({ type: "LOGIN_USER", payload: mergedUser });
            localStorage.setItem("auth", JSON.stringify(mergedUser));
            toast.success("Store profile updated successfully");
            navigate?.("/seller");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update seller profile");
        } finally {
            setLoader?.(false);
        }
    };

export const addUpdateUserAddress =
     (sendData, toast, addressId, setOpenAddressModal) => async (dispatch) => {
    /*
    const { user } = getState().auth;
    await api.post(`/addresses`, sendData, {
          headers: { Authorization: "Bearer " + user.jwtToken },
        });
    */
        dispatch({ type:"BUTTON_LOADER" });
        try {
            if (!addressId) {
                await api.post("/addresses", sendData);
            } else {
                await api.put(`/addresses/${addressId}`, sendData);
            }
        dispatch(getUserAddresses());
        toast.success("Address saved successfully");
        dispatch({ type:"IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Internal Server Error");
        dispatch({ type:"IS_ERROR", payload: null });
    } finally {
        setOpenAddressModal(false);
    }
};


export const deleteUserAddress = 
    (toast, addressId, setOpenDeleteModal) => async (dispatch) => {
    try {
        dispatch({ type: "BUTTON_LOADER" });
        await api.delete(`/addresses/${addressId}`);
        dispatch({ type: "IS_SUCCESS" });
        dispatch(getUserAddresses());
        dispatch(clearCheckoutAddress());
        toast.success("Address deleted successfully");
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Some Error Occured",
         });
    } finally {
        setOpenDeleteModal(false);
    }
};

export const clearCheckoutAddress = () => {
    return {
        type: "REMOVE_CHECKOUT_ADDRESS",
    }
};

export const getUserAddresses = () => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/users/addresses`);
        dispatch({type: "USER_ADDRESS", payload: data});
        const selectedAddress = localStorage.getItem("CHECKOUT_ADDRESS")
            ? JSON.parse(localStorage.getItem("CHECKOUT_ADDRESS"))
            : null;
        if (selectedAddress) {
            const addressStillExists = data.some(
                (address) => address.addressId === selectedAddress.addressId
            );
            if (!addressStillExists) {
                dispatch(clearCheckoutAddress());
            }
        }
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch user addresses",
         });
    }
};

export const selectUserCheckoutAddress = (address) => {
    localStorage.setItem("CHECKOUT_ADDRESS", JSON.stringify(address));
    
    return {
        type: "SELECT_CHECKOUT_ADDRESS",
        payload: address,
    }
};


export const addPaymentMethod = (method) => {
    return {
        type: "ADD_PAYMENT_METHOD",
        payload: method,
    }
};


export const createUserCart = (sendCartItems) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        await api.post('/cart/create', sendCartItems);
        await dispatch(getUserCart());
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to create cart items",
         });
    }
};


export const getUserCart = () => async (dispatch, getState) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get('/carts/users/cart');
        
        dispatch({
            type: "GET_USER_CART_PRODUCTS",
            payload: data.products,
            totalPrice: data.totalPrice,
            subtotalPrice: data.subtotalPrice,
            discountAmount: data.discountAmount,
            appliedCouponCode: data.appliedCouponCode,
            cartId: data.cartId
        })
        localStorage.setItem("cartItems", JSON.stringify(getState().carts.cart));
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        const statusCode = error?.response?.status;
        if (statusCode === 404) {
            dispatch({ type: "CLEAR_CART" });
            localStorage.setItem("cartItems", JSON.stringify([]));
            dispatch({ type: "IS_SUCCESS" });
            return;
        }
        console.log(error);
        dispatch({
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch cart items",
         });
    }
};

export const applyCouponToUserCart = (code, toast, setLoader, setCouponCode) => async (dispatch) => {
    try {
        setLoader?.(true);
        const { data } = await api.post("/carts/users/cart/coupon", { code });
        dispatch({
            type: "GET_USER_CART_PRODUCTS",
            payload: data.products,
            totalPrice: data.totalPrice,
            subtotalPrice: data.subtotalPrice,
            discountAmount: data.discountAmount,
            appliedCouponCode: data.appliedCouponCode,
            cartId: data.cartId,
        });
        setCouponCode?.("");
        toast.success(`Coupon ${data.appliedCouponCode} applied successfully`);
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to apply coupon");
    } finally {
        setLoader?.(false);
    }
};

export const removeCouponFromUserCart = (toast, setLoader) => async (dispatch) => {
    try {
        setLoader?.(true);
        const { data } = await api.delete("/carts/users/cart/coupon");
        dispatch({
            type: "GET_USER_CART_PRODUCTS",
            payload: data.products,
            totalPrice: data.totalPrice,
            subtotalPrice: data.subtotalPrice,
            discountAmount: data.discountAmount,
            appliedCouponCode: data.appliedCouponCode,
            cartId: data.cartId,
        });
        toast.success("Coupon removed successfully");
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to remove coupon");
    } finally {
        setLoader?.(false);
    }
};


export const createStripePaymentSecret 
    = (sendData) => async (dispatch) => {
        try {
            dispatch({ type: "IS_FETCHING" });
            const { data } = await api.post("/order/stripe-client-secret", sendData);
            dispatch({ type: "CLIENT_SECRET", payload: data });
              localStorage.setItem("client-secret", JSON.stringify(data));
              dispatch({ type: "IS_SUCCESS" });
        } catch (error) {
            console.log(error);
            dispatch({ 
                type: "IS_ERROR",
                payload: error?.response?.data?.message || "Failed to create client secret",
             });
        }
};


export const stripePaymentConfirmation 
    = (sendData, setErrorMesssage, setLoadng, toast, onSuccess) => async (dispatch) => {
        try {
            setLoadng(true);
            const response  = await api.post("/order/users/payments/online", sendData);
            if (response.data) {
                localStorage.removeItem("CHECKOUT_ADDRESS");
                localStorage.removeItem("cartItems");
                localStorage.removeItem("client-secret");
                dispatch({ type: "REMOVE_CLIENT_SECRET_ADDRESS"});
                dispatch({ type: "CLEAR_CART"});
                await dispatch(getUserCart());
                if (onSuccess) {
                    onSuccess();
                }
                toast.success("Order Accepted");
              } else {
                setErrorMesssage("Payment Failed. Please try again.");
              }
        } catch (error) {
            setErrorMesssage(error?.response?.data?.message || "Payment Failed. Please try again.");
        } finally {
            setLoadng(false);
        }
};

export const analyticsAction = (isAdmin = true) => async (dispatch) => {
        try {
            dispatch({ type: "IS_FETCHING"});
            const endpoint = isAdmin ? "/admin/app/analytics" : "/seller/app/analytics";
            const { data } = await api.get(endpoint);
            dispatch({
                type: isAdmin ? "FETCH_ANALYTICS" : "FETCH_SELLER_ANALYTICS",
                payload: data,
            })
            dispatch({ type: "IS_SUCCESS"});
        } catch (error) {
            dispatch({ 
                type: "IS_ERROR",
                payload: error?.response?.data?.message || "Failed to fetch analytics data",
            });
        }
};

export const fetchCommissionSettings = () => async (dispatch) => {
    try {
        const { data } = await api.get("/admin/commission");
        dispatch({
            type: "FETCH_COMMISSION",
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch commission settings",
        });
    }
};

export const fetchCouponsDashboard = (queryString = "pageNumber=0&pageSize=20&sortBy=couponId&sortOrder=desc") => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const { data } = await api.get(`/admin/coupons?${queryString}`);
        dispatch({
            type: "FETCH_COUPONS",
            payload: data.content,
            pagination: {
                pageNumber: data.pageNumber,
                pageSize: data.pageSize,
                totalElements: data.totalElements,
                totalPages: data.totalPages,
                lastPage: data.lastPage,
            },
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        dispatch({
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch coupons",
        });
    }
};

export const createCouponDashboardAction =
    (sendData, toast, reset, setOpen, setLoader) => async (dispatch) => {
        try {
            setLoader?.(true);
            await api.post("/admin/coupons", sendData);
            toast.success("Coupon created successfully");
            reset?.();
            setOpen?.(false);
            await dispatch(fetchCouponsDashboard());
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to create coupon");
        } finally {
            setLoader?.(false);
        }
    };

export const updateCouponDashboardAction =
    (couponId, sendData, toast, reset, setOpen, setLoader) => async (dispatch) => {
        try {
            setLoader?.(true);
            await api.put(`/admin/coupons/${couponId}`, sendData);
            toast.success("Coupon updated successfully");
            reset?.();
            setOpen?.(false);
            await dispatch(fetchCouponsDashboard());
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update coupon");
        } finally {
            setLoader?.(false);
        }
    };

export const deleteCouponDashboardAction =
    (couponId, toast, setOpen, setLoader) => async (dispatch) => {
        try {
            setLoader?.(true);
            await api.delete(`/admin/coupons/${couponId}`);
            toast.success("Coupon deleted successfully");
            setOpen?.(false);
            await dispatch(fetchCouponsDashboard());
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete coupon");
        } finally {
            setLoader?.(false);
        }
    };

export const updateCommissionSettings =
    (commissionPercentage, toast, setLoader) => async (dispatch) => {
        try {
            setLoader?.(true);
            const { data } = await api.put("/admin/commission", {
                commissionPercentage: Number(commissionPercentage),
            });
            dispatch({
                type: "FETCH_COMMISSION",
                payload: data,
            });
            toast.success("Commission updated successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update commission");
        } finally {
            setLoader?.(false);
        }
    };

export const getOrdersForDashboard = (queryString, isAdmin) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const endpoint = isAdmin ? "/admin/orders" : "/seller/orders";
        const normalizedQuery = buildOrderQueryString(queryString);
        const { data } = await api.get(`${endpoint}?${normalizedQuery}`);
        dispatch({
            type: "GET_ADMIN_ORDERS",
            payload: sortOrdersByWorkflowPriority(data.content),
            pageNumber: data.pageNumber,
            pageSize: data.pageSize,
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            lastPage: data.lastPage,
        });
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch orders data",
         });
    }
};



export const updateOrderStatusFromDashboard =
     (orderId, orderStatusData, toast, setLoader, isAdmin) => async (dispatch) => {
    try {
        setLoader(true);
        const endpoint = isAdmin ? "/admin/orders/" : "/seller/orders/";
        const { data } = await api.put(`${endpoint}${orderId}/status`, orderStatusData);
        toast.success(data.message || "Order updated successfully");
        if (isAdmin) {
            await dispatch(getOrdersForDashboard("", true));
        } else {
            await dispatch(fetchSellerOrders());
        }
    } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
        setLoader(false)
    }
};


export const dashboardProductsAction = (queryString, isAdmin) => async (dispatch) => {
    try {
        dispatch({ type: "IS_FETCHING" });
        const endpoint = isAdmin ? "/admin/products" : "/seller/products";
        const { data } = await api.get(`${endpoint}?${queryString}`);
        const actionType = isAdmin ? "FETCH_PRODUCTS" : "FETCH_SELLER_PRODUCTS";
        const payload = isAdmin
            ? {
                type: actionType,
                payload: data.content,
                pageNumber: data.pageNumber,
                pageSize: data.pageSize,
                totalElements: data.totalElements,
                totalPages: data.totalPages,
                lastPage: data.lastPage,
            }
            : {
                type: actionType,
                payload: {
                    products: data.content,
                    pagination: {
                        pageNumber: data.pageNumber,
                        pageSize: data.pageSize,
                        totalElements: data.totalElements,
                        totalPages: data.totalPages,
                        lastPage: data.lastPage,
                    },
                },
            };
        dispatch(payload);
        dispatch({ type: "IS_SUCCESS" });
    } catch (error) {
        console.log(error);
        dispatch({ 
            type: "IS_ERROR",
            payload: error?.response?.data?.message || "Failed to fetch dashboard products",
         });
    }
};


export const updateProductFromDashboard = 
    (sendData, toast, reset, setLoader, setOpen, isAdmin) => async (dispatch) => {
    try {
        setLoader(true);
        if (isAdmin) {
            throw new Error("Admin cannot update seller inventory directly");
        }
        await api.put(`/seller/products/${sendData.id}`, sendData);
        toast.success("Product updated and sent for approval");
        reset();
        setOpen(false);
        await dispatch(fetchSellerProducts());
    } catch (error) {
        toast.error(error?.response?.data?.message || error?.message || "Product update failed");
    } finally {
        setLoader(false);
    }
};

export const approveProductFromDashboard =
    (productId, toast, setLoader) => async (dispatch) => {
        try {
            setLoader?.(true);
            await api.put(`/admin/products/${productId}/approve`);
            toast.success("Product approved successfully");
            await dispatch(dashboardProductsAction("", true));
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to approve product");
        } finally {
            setLoader?.(false);
        }
    };



export const addNewProductFromDashboard = 
    (sendData, toast, reset, setLoader, setOpen, isAdmin) => async(dispatch) => {
        try {
            setLoader(true);
            if (isAdmin) {
                throw new Error("Admin cannot create products");
            }
            await api.post(`/seller/categories/${sendData.categoryId}/product`,
                sendData
            );
            toast.success("Product created and sent for approval");
            reset();
            setOpen(false);
            await dispatch(fetchSellerProducts());
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || error?.message || "Product creation failed");
        } finally {
            setLoader(false);
        }
    }

export const deleteProduct = 
    (setLoader, productId, toast, setOpenDeleteModal, isAdmin) => async (dispatch) => {
    try {
        setLoader(true)
        const endpoint = isAdmin ? "/admin/products/" : "/seller/products/";
        await api.delete(`${endpoint}${productId}`);
        toast.success("Product deleted successfully");
        setOpenDeleteModal(false);
        if (isAdmin) {
            await dispatch(dashboardProductsAction("", true));
        } else {
            await dispatch(fetchSellerProducts());
        }
    } catch (error) {
        console.log(error);
        toast.error(
            error?.response?.data?.message || "Some Error Occured"
        )
    } finally {
        setLoader(false);
    }
};


export const updateProductImageFromDashboard = 
    (formData, productId, toast, setLoader, setOpen, isAdmin) => async (dispatch) => {
    try {
        setLoader(true);
        if (isAdmin) {
            throw new Error("Admin cannot update seller inventory directly");
        }
        await api.put(`/seller/products/${productId}/image`, formData);
        toast.success("Image uploaded and product sent for approval");
        setOpen(false);
        await dispatch(fetchSellerProducts());
    } catch (error) {
        toast.error(error?.response?.data?.message || error?.message || "Product Image upload failed");
    } finally {
        setLoader(false);
    }
};

export const getAllCategoriesDashboard = (queryString) => async (dispatch) => {
  dispatch({ type: "CATEGORY_LOADER" });
  try {
    const { data } = await api.get(`/public/categories?${queryString}`);
    dispatch({
      type: "FETCH_CATEGORIES",
      payload: data["content"],
      pageNumber: data["pageNumber"],
      pageSize: data["pageSize"],
      totalElements: data["totalElements"],
      totalPages: data["totalPages"],
      lastPage: data["lastPage"],
    });

    dispatch({ type: "CATEGORY_SUCCESS" });
  } catch (err) {
    console.log(err);

    dispatch({
      type: "IS_ERROR",
      payload: err?.response?.data?.message || "Failed to fetch categories",
    });
  }
};

export const createCategoryDashboardAction =
  (sendData, setOpen, reset, toast) => async (dispatch) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });
      await api.post("/admin/categories", sendData);
      dispatch({ type: "CATEGORY_SUCCESS" });
      reset();
      toast.success("Category Created Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.categoryName || "Failed to create new category"
      );

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const updateCategoryDashboardAction =
  (sendData, setOpen, categoryID, reset, toast) =>
  async (dispatch) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });

      await api.put(`/admin/categories/${categoryID}`, sendData);

      dispatch({ type: "CATEGORY_SUCCESS" });

      reset();
      toast.success("Category Update Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.categoryName || "Failed to update category"
      );

      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };

export const deleteCategoryDashboardAction =
  (setOpen, categoryID, toast) => async (dispatch) => {
    try {
      dispatch({ type: "CATEGORY_LOADER" });

      await api.delete(`/admin/categories/${categoryID}`);

      dispatch({ type: "CATEGORY_SUCCESS" });

      toast.success("Category Delete Successful");
      setOpen(false);
      await dispatch(getAllCategoriesDashboard());
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to delete category");
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Internal Server Error",
      });
    }
  };


  export const getAllSellersDashboard =
  (queryString) => async (dispatch) => {
    try {
      dispatch({ type: "IS_FETCHING" });
      const { data } = await api.get(`/admin/sellers?${queryString}`);
      dispatch({
        type: "GET_SELLERS",
        payload: data["content"],
        pageNumber: data["pageNumber"],
        pageSize: data["pageSize"],
        totalElements: data["totalElements"],
        totalPages: data["totalPages"],
        lastPage: data["lastPage"],
      });

      dispatch({ type: "IS_SUCCESS" });
    } catch (err) {
      console.log(err);
      dispatch({
        type: "IS_ERROR",
        payload: err?.response?.data?.message || "Failed to fetch sellers data",
      });
    }
  };

export const addNewDashboardSeller =
  (sendData, toast, reset, setOpen, setLoader) => async (dispatch) => {
    try {
      setLoader(true);
      await api.post("/auth/signup", {
        ...sendData,
        role: ["seller"],
      });
      reset();
      toast.success("Seller created successfully. Approval can be managed from the seller list.");

      await dispatch(getAllSellersDashboard());
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.password ||
          "Internal Server Error"
      );
    } finally {
      setLoader(false);
      setOpen(false);
    }
  };

export const updateSellerStatusDashboard =
  (sellerId, statusData, toast, setLoader) => async (dispatch) => {
    try {
      setLoader?.(true);
      await api.put(`/admin/sellers/${sellerId}/status`, statusData);
      toast.success("Seller status updated successfully");
      await dispatch(getAllSellersDashboard());
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to update seller status");
    } finally {
      setLoader?.(false);
    }
  };


export const fetchUserOrders = () => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });

    const { data } = await api.get("/user/orders?sortBy=orderDate&sortOrder=desc");

    dispatch({
      type: "GET_USER_ORDERS",
      payload: sortOrdersByWorkflowPriority(data.content),
      pagination: {
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        lastPage: data.lastPage,
      },
    });

    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    console.log(error);
    dispatch({
      type: "IS_ERROR",
      payload:
        error?.response?.data?.message || "Failed to fetch user orders",
    });
  }
};

export const fetchBuyerReturns = () => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get("/returns/my-returns");
    dispatch({ type: "FETCH_BUYER_RETURNS", payload: data });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch return requests",
    });
  }
};

export const createReturnRequestAction =
  (sendData, toast, setLoader, onSuccess) => async (dispatch) => {
    try {
      setLoader?.(true);
      await api.post("/returns/create", sendData);
      toast.success("Return request created successfully");
      await dispatch(fetchBuyerReturns());
      await dispatch(fetchUserOrders());
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create return request");
    } finally {
      setLoader?.(false);
    }
  };

export const disputeReturnRequestAction =
  (returnId, comment, toast, setLoader, onSuccess) => async (dispatch) => {
    try {
      setLoader?.(true);
      await api.put(`/returns/${returnId}/dispute`, { comment });
      toast.success("Return dispute submitted for admin review");
      await dispatch(fetchBuyerReturns());
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to dispute return");
    } finally {
      setLoader?.(false);
    }
  };

export const fetchSellerReturns = () => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get("/seller/returns");
    dispatch({ type: "FETCH_SELLER_RETURNS", payload: data });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch seller returns",
    });
  }
};

export const approveSellerReturnAction =
  (returnId, comment, toast, setLoader, onSuccess) => async (dispatch) => {
    try {
      setLoader?.(true);
      await api.put(`/seller/returns/${returnId}/approve`, { comment });
      toast.success("Return approved successfully");
      await dispatch(fetchSellerReturns());
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve return");
    } finally {
      setLoader?.(false);
    }
  };

export const rejectSellerReturnAction =
  (returnId, comment, toast, setLoader, onSuccess) => async (dispatch) => {
    try {
      setLoader?.(true);
      await api.put(`/seller/returns/${returnId}/reject`, { comment });
      toast.success("Return rejected successfully");
      await dispatch(fetchSellerReturns());
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject return");
    } finally {
      setLoader?.(false);
    }
  };

export const updateSellerReturnStatusAction =
  (returnId, status, comment, toast, setLoader, onSuccess) => async (dispatch) => {
    try {
      setLoader?.(true);
      await api.put(`/seller/returns/${returnId}/status`, { status, comment });
      toast.success(`Return moved to ${status}`);
      await dispatch(fetchSellerReturns());
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update return status");
    } finally {
      setLoader?.(false);
    }
  };

export const fetchAdminReturns = () => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get("/admin/returns");
    dispatch({ type: "FETCH_ADMIN_RETURNS", payload: data });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch disputed returns",
    });
  }
};

export const reviewAdminReturnAction =
  (returnId, approve, comment, toast, setLoader, onSuccess) => async (dispatch) => {
    try {
      setLoader?.(true);
      await api.put(`/admin/returns/${returnId}/review`, { approve, comment });
      toast.success(approve ? "Dispute approved successfully" : "Dispute rejected successfully");
      await dispatch(fetchAdminReturns());
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to review dispute");
    } finally {
      setLoader?.(false);
    }
  };

export const processAdminRefundAction =
  (returnId, comment, toast, setLoader, onSuccess) => async (dispatch) => {
    try {
      setLoader?.(true);
      await api.put(`/admin/returns/${returnId}/process-refund`, { comment });
      toast.success("Refund processed successfully");
      await dispatch(fetchAdminReturns());
      await dispatch(fetchBuyerReturns());
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to process refund");
    } finally {
      setLoader?.(false);
    }
  };

export const closeAdminReturnAction =
  (returnId, comment, toast, setLoader, onSuccess) => async (dispatch) => {
    try {
      setLoader?.(true);
      await api.put(`/admin/returns/${returnId}/close`, { comment });
      toast.success("Return closed successfully");
      await dispatch(fetchAdminReturns());
      await dispatch(fetchBuyerReturns());
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to close return");
    } finally {
      setLoader?.(false);
    }
  };

export const fetchUserReports = () => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get("/user/reports");
    dispatch({ type: "FETCH_USER_REPORTS", payload: data });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch user reports",
    });
  }
};

export const fetchSellerReports = () => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get("/seller/reports");
    dispatch({ type: "FETCH_SELLER_REPORTS", payload: data });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch seller reports",
    });
  }
};

export const fetchAdminReports = () => async (dispatch) => {
  try {
    dispatch({ type: "IS_FETCHING" });
    const { data } = await api.get("/admin/reports");
    dispatch({ type: "FETCH_ADMIN_REPORTS", payload: data });
    dispatch({ type: "IS_SUCCESS" });
  } catch (error) {
    dispatch({
      type: "IS_ERROR",
      payload: error?.response?.data?.message || "Failed to fetch admin reports",
    });
  }
};
