import { useEffect, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { FaTags } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Modal from "../../shared/Modal";
import DeleteModal from "../../shared/DeleteModal";
import Loader from "../../shared/Loader";
import ErrorPage from "../../shared/ErrorPage";
import CouponForm from "./CouponForm";
import { deleteCouponDashboardAction, fetchCouponsDashboard } from "../../../store/actions";

const Coupons = () => {
  const dispatch = useDispatch();
  const { coupons, couponPagination } = useSelector((state) => state.admin);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const [currentPage, setCurrentPage] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [deleteLoader, setDeleteLoader] = useState(false);

  useEffect(() => {
    dispatch(fetchCouponsDashboard(`pageNumber=${currentPage}&pageSize=10&sortBy=couponId&sortOrder=desc`));
  }, [dispatch, currentPage]);

  const rows = useMemo(
    () =>
      (coupons || []).map((coupon) => ({
        id: coupon.couponId,
        code: coupon.code,
        description: coupon.description || "No description",
        discountPercentage: `${Number(coupon.discountPercentage || 0).toFixed(2)}%`,
        minimumOrderAmount: `$${Number(coupon.minimumOrderAmount || 0).toFixed(2)}`,
        expiryDate: coupon.expiryDate || "No expiry",
        active: coupon.active ? "Active" : "Inactive",
        raw: coupon,
      })),
    [coupons]
  );

  const columns = [
    { field: "code", headerName: "Code", minWidth: 160, flex: 1, headerAlign: "center", align: "center" },
    { field: "discountPercentage", headerName: "Discount", minWidth: 140, flex: 1, headerAlign: "center", align: "center" },
    { field: "minimumOrderAmount", headerName: "Minimum Order", minWidth: 160, flex: 1, headerAlign: "center", align: "center" },
    { field: "expiryDate", headerName: "Expiry", minWidth: 160, flex: 1, headerAlign: "center", align: "center" },
    { field: "active", headerName: "Status", minWidth: 140, flex: 1, headerAlign: "center", align: "center" },
    { field: "description", headerName: "Description", minWidth: 260, flex: 1.2, headerAlign: "center", align: "center" },
    {
      field: "action",
      headerName: "Action",
      minWidth: 240,
      flex: 1,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setSelectedCoupon(params.row.raw);
              setOpenModal(true);
            }}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setSelectedCoupon(params.row.raw);
              setOpenDeleteModal(true);
            }}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (errorMessage) {
    return <ErrorPage message={errorMessage} />;
  }

  return (
    <div>
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Coupon Management</h1>
          <p className="mt-2 text-slate-500">
            Create and control promo codes that buyers can apply during checkout.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCoupon(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 rounded-md bg-custom-blue px-5 py-3 font-semibold text-white transition hover:text-slate-200"
        >
          <FaTags />
          Add Coupon
        </button>
      </div>

      {isLoading ? (
        <Loader />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-slate-600">
          <FaTags className="mx-auto mb-4 text-5xl text-slate-400" />
          <h2 className="text-2xl font-semibold text-slate-800">No coupons created yet</h2>
          <p className="mt-2">Start with a promotional code like SAVE10 or FESTIVE20.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white">
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            paginationMode="server"
            rowCount={couponPagination?.totalElements || 0}
            disableRowSelectionOnClick
            pageSizeOptions={[couponPagination?.pageSize || 10]}
            onPaginationModelChange={(paginationModel) => setCurrentPage(paginationModel.page)}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: couponPagination?.pageSize || 10,
                  page: currentPage,
                },
              },
            }}
          />
        </div>
      )}

      <Modal
        open={openModal}
        setOpen={setOpenModal}
        title={selectedCoupon ? "Update Coupon" : "Create Coupon"}
      >
        <CouponForm coupon={selectedCoupon} setOpen={setOpenModal} />
      </Modal>

      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        loader={deleteLoader}
        title="Delete this coupon"
        onDeleteHandler={() =>
          dispatch(
            deleteCouponDashboardAction(
              selectedCoupon?.couponId,
              toast,
              setOpenDeleteModal,
              setDeleteLoader
            )
          )
        }
      />
    </div>
  );
};

export default Coupons;
