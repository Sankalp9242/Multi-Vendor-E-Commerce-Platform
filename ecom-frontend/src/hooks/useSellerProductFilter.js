import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchSellerProducts } from "../store/actions";

const useSellerProductFilter = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();

    const page = searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1;

    params.set("pageNumber", page - 1);

    dispatch(fetchSellerProducts(params.toString()));
  }, [dispatch, searchParams]);
};

export default useSellerProductFilter;
