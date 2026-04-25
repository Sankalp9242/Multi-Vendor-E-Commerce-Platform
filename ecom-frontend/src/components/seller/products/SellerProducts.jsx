import { useState } from "react";
import { MdAddShoppingCart } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../shared/Loader";
import { FaBoxOpen } from "react-icons/fa";
import { DataGrid } from "@mui/x-data-grid";
import { sellerProductTableColumn } from "../../helper/tableColumn";
import Modal from "../../shared/Modal";
import DeleteModal from "../../shared/DeleteModal";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import AddProductForm from "../../admin/products/AddProductForm";
import ImageUploadForm from "../../admin/products/ImageUploadForm";
import ProductViewModal from "../../shared/ProductViewModal";
import { deleteProduct } from "../../../store/actions";
import useSellerProductFilter from "../../../hooks/useSellerProductFilter";

const SellerProducts = () => {
  const { products, pagination } = useSelector((state) => state.sellerProducts);
  const { isLoading } = useSelector((state) => state.errors);
  const dispatch = useDispatch();

  const [selectedProduct, setSelectedProduct] = useState("");
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openProductViewModal, setOpenProductViewModal] = useState(false);
  const [openImageUploadModal, setOpenImageUploadModal] = useState(false);
  const [loader, setLoader] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathname = useLocation().pathname;

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpenUpdateModal(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setOpenDeleteModal(true);
  };

  const handleImageUpload = (product) => {
    setSelectedProduct(product);
    setOpenImageUploadModal(true);
  };

  const handleProductView = (product) => {
    setSelectedProduct(product);
    setOpenProductViewModal(true);
  };

  useSellerProductFilter();

  const tableRecords = products?.map((item) => ({
    id: item.productId,
    productName: item.productName,
    productStatus: item.productStatus,
    sellerName: item.sellerName,
    description: item.description,
    discount: item.discount,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    specialPrice: item.specialPrice,
  }));

  const handlePaginationChange = (paginationModel) => {
    const page = paginationModel.page + 1;
    params.set("page", page.toString());
    navigate(`${pathname}?${params}`);
  };

  const onDeleteHandler = () => {
    dispatch(deleteProduct(setLoader, selectedProduct?.id, toast, setOpenDeleteModal, false));
  };

  const emptyProduct = !products || products.length === 0;

  return (
    <div>
      <div className="flex justify-end pb-10 pt-6">
        <button
          onClick={() => setOpenAddModal(true)}
          className="flex items-center gap-2 rounded-md bg-custom-blue px-4 py-2 font-semibold text-white"
        >
          <MdAddShoppingCart className="text-xl" />
          Add Product
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Seller listings follow marketplace moderation. New products and product changes stay <strong>PENDING</strong> until an admin approves them.
      </div>

      {isLoading ? (
        <Loader />
      ) : emptyProduct ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-600">
          <FaBoxOpen size={50} className="mb-3" />
          <h2 className="text-2xl font-semibold">No products yet</h2>
        </div>
      ) : (
        <DataGrid
          rows={tableRecords}
          columns={sellerProductTableColumn(
            handleEdit,
            handleDelete,
            handleImageUpload,
            handleProductView
          )}
          paginationMode="server"
          rowCount={pagination?.totalElements || 0}
          onPaginationModelChange={handlePaginationChange}
        />
      )}

      <Modal
        open={openAddModal || openUpdateModal}
        setOpen={openUpdateModal ? setOpenUpdateModal : setOpenAddModal}
      >
        <AddProductForm
          setOpen={openUpdateModal ? setOpenUpdateModal : setOpenAddModal}
          product={selectedProduct}
          update={openUpdateModal}
        />
      </Modal>

      <Modal open={openImageUploadModal} setOpen={setOpenImageUploadModal}>
        <ImageUploadForm setOpen={setOpenImageUploadModal} product={selectedProduct} />
      </Modal>

      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        loader={loader}
        title="Delete Product"
        onDeleteHandler={onDeleteHandler}
      />

      <ProductViewModal
        open={openProductViewModal}
        setOpen={setOpenProductViewModal}
        product={selectedProduct}
      />
    </div>
  );
};

export default SellerProducts;
