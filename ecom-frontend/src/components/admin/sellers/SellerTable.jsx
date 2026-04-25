import React, { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { sellerTableColumns } from "../../helper/tableColumn";
import { useDispatch } from "react-redux";
import { updateSellerStatusDashboard } from "../../../store/actions";

const SellerTable = ({ sellers, pagination }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pathname = useLocation().pathname;
  const params = new URLSearchParams(searchParams);
  const [currentPage, setCurrentPage] = useState(pagination?.pageNumber || 1);
  const [loader, setLoader] = useState(false);

  const tableRecords = sellers?.map((item) => {
    return {
      id: item.userId,
      username: item.username,
      email: item.email,
      storeName: item.storeName || "Store profile pending",
      sellerApproved: Boolean(item.sellerApproved),
      sellerActive: Boolean(item.sellerActive),
    };
  });

  const handlePaginationChange = (paginationModel) => {
    const page = paginationModel.page + 1;
    setCurrentPage(page);

    params.set("page", page.toString());
    navigate(`${pathname}?${params}`);
  };

  const handleApprove = (seller) => {
    dispatch(
      updateSellerStatusDashboard(
        seller.id,
        {
          sellerApproved: true,
          sellerActive: seller.sellerActive,
        },
        toast,
        setLoader
      )
    );
  };

  const handleActivation = (seller) => {
    dispatch(
      updateSellerStatusDashboard(
        seller.id,
        {
          sellerApproved: seller.sellerApproved,
          sellerActive: !seller.sellerActive,
        },
        toast,
        setLoader
      )
    );
  };

  return (
    <div>
      <div className="max-w-fit mx-auto">
        <DataGrid
          className="w-full"
          rows={tableRecords}
          paginationMode="server"
          rowCount={pagination?.totalElements || 0}
          loading={loader}
          columns={sellerTableColumns(handleApprove, handleActivation)}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: pagination?.pageSize || 10,
                page: currentPage - 1,
              },
            },
          }}
          onPaginationModelChange={handlePaginationChange}
          disableRowSelectionOnClick
          disableColumnResize
          pagination
          pageSizeOptions={[pagination?.pageSize || 10]}
          paginationOptions={{
            showFirstButton: true,
            showLastButton: true,
            hideNextButton: currentPage === pagination?.totalPages,
          }}
        />
      </div>
    </div>
  );
};

export default SellerTable;
