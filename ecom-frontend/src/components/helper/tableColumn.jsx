import { FaCheckCircle, FaEdit, FaEye, FaImage, FaPauseCircle, FaPlayCircle, FaTrashAlt } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";

const baseCellClasses = "text-slate-700 font-normal border text-center";
const baseHeaderClasses = "text-black font-semibold text-center border";

const renderActionButton = (onClick, Icon, label, className) => (
  <button onClick={onClick} className={`flex items-center rounded-md px-4 h-9 text-white ${className}`}>
    <Icon className="mr-2" />
    {label}
  </button>
);

const buildProductColumns = (config) => [
  {
    disableColumnMenu: true,
    sortable: false,
    field: "id",
    headerName: "Product ID",
    minWidth: 140,
    headerAlign: "center",
    align: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "productName",
    headerName: "Product",
    width: 220,
    headerAlign: "center",
    align: "center",
    sortable: false,
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "sellerName",
    headerName: "Seller",
    width: 180,
    headerAlign: "center",
    align: "center",
    sortable: false,
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "productStatus",
    headerName: "Status",
    width: 150,
    headerAlign: "center",
    align: "center",
    sortable: false,
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "price",
    headerName: "Price",
    minWidth: 120,
    headerAlign: "center",
    align: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "quantity",
    headerName: "Stock",
    minWidth: 120,
    headerAlign: "center",
    align: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "specialPrice",
    headerName: "Special Price",
    minWidth: 150,
    headerAlign: "center",
    align: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "description",
    headerName: "Description",
    minWidth: 220,
    headerAlign: "center",
    align: "center",
    sortable: false,
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "action",
    headerName: "Action",
    width: config.actionWidth || 320,
    headerAlign: "center",
    align: "center",
    sortable: false,
    headerClassName: "text-black font-semibold text-center",
    cellClassName: "text-slate-700 font-normal",
    renderCell: (params) => (
      <div className="flex h-full items-center justify-center space-x-2 pt-2">
        {config.handleApprove &&
          renderActionButton(
            () => config.handleApprove(params.row),
            FaCheckCircle,
            "Approve",
            "bg-emerald-600 hover:bg-emerald-700"
          )}
        {config.handleImageUpload &&
          renderActionButton(
            () => config.handleImageUpload(params.row),
            FaImage,
            "Image",
            "bg-green-500 hover:bg-green-600"
          )}
        {config.handleEdit &&
          renderActionButton(
            () => config.handleEdit(params.row),
            FaEdit,
            "Edit",
            "bg-blue-500 hover:bg-blue-600"
          )}
        {config.handleDelete &&
          renderActionButton(
            () => config.handleDelete(params.row),
            FaTrashAlt,
            "Delete",
            "bg-red-500 hover:bg-red-600"
          )}
        {config.handleProductView &&
          renderActionButton(
            () => config.handleProductView(params.row),
            FaEye,
            "View",
            "bg-slate-800 hover:bg-slate-900"
          )}
      </div>
    ),
  },
];

export const adminModerationProductTableColumn = (handleApprove, handleDelete, handleProductView) =>
  buildProductColumns({
    handleApprove,
    handleDelete,
    handleProductView,
    actionWidth: 360,
  });

export const sellerProductTableColumn = (handleEdit, handleDelete, handleImageUpload, handleProductView) =>
  buildProductColumns({
    handleEdit,
    handleDelete,
    handleImageUpload,
    handleProductView,
    actionWidth: 420,
  });

export const adminOrderTableColumn = (handleEdit, handleView, allowEdit = true) => [
  {
    sortable: false,
    disableColumnMenu: true,
    field: "id",
    headerName: "Order ID",
    minWidth: 180,
    headerAlign: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "email",
    headerName: "Email",
    align: "center",
    width: 250,
    sortable: false,
    headerAlign: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "totalAmount",
    headerName: "Total Amount",
    align: "center",
    width: 180,
    headerAlign: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "status",
    headerName: "Status",
    align: "center",
    width: 180,
    sortable: false,
    headerAlign: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "date",
    headerName: "Order Date",
    align: "center",
    width: 180,
    sortable: false,
    headerAlign: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    field: "action",
    headerName: "Action",
    headerAlign: "center",
    sortable: false,
    width: allowEdit ? (handleView ? 360 : 240) : 180,
    headerClassName: "text-black font-semibold text-center",
    cellClassName: "text-slate-700 font-normal",
    renderCell: (params) => (
      <div className="flex h-full items-center justify-center space-x-2 pt-2">
        {allowEdit &&
          renderActionButton(
            () => handleEdit(params.row),
            FaEdit,
            "Edit",
            "bg-blue-500 hover:bg-blue-600"
          )}
        {handleView &&
          renderActionButton(
            () => handleView(params.row),
            FaEye,
            "View",
            "bg-slate-800 hover:bg-slate-900"
          )}
      </div>
    ),
  },
];

export const categoryTableColumns = (handleEdit, handleDelete) => [
  {
    sortable: false,
    disableColumnMenu: true,
    field: "id",
    headerName: "Category ID",
    minWidth: 280,
    headerAlign: "center",
    align: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "categoryName",
    headerName: "Category Name",
    align: "center",
    width: 380,
    sortable: false,
    headerAlign: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    field: "action",
    headerName: "Action",
    headerAlign: "center",
    sortable: false,
    width: 320,
    headerClassName: "text-black font-semibold text-center",
    cellClassName: "text-slate-700 font-normal",
    renderCell: (params) => (
      <div className="flex justify-center space-x-2 h-full pt-2">
        {renderActionButton(() => handleEdit(params.row), FaEdit, "Edit", "bg-blue-500 hover:bg-blue-600")}
        {renderActionButton(
          () => handleDelete(params.row),
          FaTrashAlt,
          "Delete",
          "bg-red-500 hover:bg-red-600"
        )}
      </div>
    ),
  },
];

export const sellerTableColumns = (handleApprove, handleActivation) => [
  {
    disableColumnMenu: true,
    field: "id",
    headerName: "Seller ID",
    minWidth: 160,
    headerAlign: "center",
    align: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "username",
    headerName: "Username",
    minWidth: 180,
    headerAlign: "center",
    align: "center",
    sortable: false,
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "storeName",
    headerName: "Store",
    minWidth: 200,
    headerAlign: "center",
    align: "center",
    sortable: false,
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
  },
  {
    disableColumnMenu: true,
    field: "sellerApproved",
    headerName: "Approved",
    width: 140,
    headerAlign: "center",
    align: "center",
    sortable: false,
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
    renderCell: (params) => (params.row.sellerApproved ? "Yes" : "No"),
  },
  {
    disableColumnMenu: true,
    field: "sellerActive",
    headerName: "Active",
    width: 140,
    headerAlign: "center",
    align: "center",
    sortable: false,
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
    renderCell: (params) => (params.row.sellerActive ? "Yes" : "No"),
  },
  {
    disableColumnMenu: true,
    field: "email",
    headerName: "Email",
    align: "center",
    width: 260,
    sortable: false,
    headerAlign: "center",
    headerClassName: baseHeaderClasses,
    cellClassName: baseCellClasses,
    renderCell: (params) => (
      <div className="flex items-center justify-center gap-1">
        <MdOutlineEmail className="text-slate-700 text-lg" />
        <span>{params?.row?.email}</span>
      </div>
    ),
  },
  {
    disableColumnMenu: true,
    field: "action",
    headerName: "Action",
    width: 340,
    headerAlign: "center",
    align: "center",
    sortable: false,
    headerClassName: "text-black font-semibold text-center",
    cellClassName: "text-slate-700 font-normal",
    renderCell: (params) => (
      <div className="flex h-full items-center justify-center space-x-2 pt-2">
        {renderActionButton(
          () => handleApprove(params.row),
          FaCheckCircle,
          params.row.sellerApproved ? "Reconfirm" : "Approve",
          "bg-emerald-600 hover:bg-emerald-700"
        )}
        {renderActionButton(
          () => handleActivation(params.row),
          params.row.sellerActive ? FaPauseCircle : FaPlayCircle,
          params.row.sellerActive ? "Deactivate" : "Activate",
          params.row.sellerActive ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
        )}
      </div>
    ),
  },
];
