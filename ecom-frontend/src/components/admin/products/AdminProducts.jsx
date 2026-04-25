import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../shared/Loader';
import { FaBoxOpen } from 'react-icons/fa';
import { DataGrid } from '@mui/x-data-grid';
import { adminModerationProductTableColumn } from '../../helper/tableColumn';
import { useDashboardProductFilter } from '../../../hooks/useProductFilter';
import DeleteModal from '../../shared/DeleteModal';
import { approveProductFromDashboard, deleteProduct } from '../../../store/actions';
import toast from 'react-hot-toast';
import ProductViewModal from '../../shared/ProductViewModal';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const AdminProducts = () => {
  const {products, pagination} = useSelector((state) => state.products);
  const { isLoading } = useSelector((state) => state.errors);
  const [currentPage, setCurrentPage] = useState(
      pagination?.pageNumber + 1 || 1
    );

  const dispatch = useDispatch();
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openProductViewModal, setOpenProductViewModal] = useState(false);

  const [loader, setLoader] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathname = useLocation().pathname;

  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user?.roles?.includes("ROLE_ADMIN");

  useDashboardProductFilter();

const tableRecords = products?.map((item) => {
  return {
    id: item.productId,
    productName: item.productName,
    productStatus: item.productStatus,
    sellerName: item.sellerName || "Unknown Seller",
    description: item.description,
    discount: item.discount,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    specialPrice: item.specialPrice,
  }
});

const handleDelete = (product) => {
  setSelectedProduct(product);
  setOpenDeleteModal(true);
};

const handleApprove = (product) => {
  setSelectedProduct(product);
  dispatch(approveProductFromDashboard(product.id, toast, setLoader));
};

const handleProductView = (product) => {
  setSelectedProduct(product);
  setOpenProductViewModal(true);
};


const handlePaginationChange = (paginationModel) => {
  const page = paginationModel.page + 1;
  setCurrentPage(page);
  params.set("page", page.toString());
  navigate(`${pathname}?${params}`)
};


const onDeleteHandler = () => {
  dispatch(deleteProduct(setLoader, selectedProduct?.id, toast, setOpenDeleteModal, isAdmin));
};

  const emptyProduct = !products || products?.length ===0;
  return (
    <div>
      <div className='rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600'>
        Admin can review pending listings, approve products for the marketplace, or reject them. Product creation and inventory changes belong only to sellers.
      </div>


    {!emptyProduct && (
      <h1 className='text-slate-800 text-3xl text-center font-bold pb-6 uppercase'>
        All Products</h1>
    )}
    {isLoading ? (
      <Loader />
    ) : (
      <>
      {emptyProduct ? (
        <div className='flex flex-col items-center justify-center text-gray-600 py-10'>
          <FaBoxOpen size={50} className='mb-3'/>
          <h2 className='text-2xl font-semibold'>
            No products created yet  
          </h2>
        </div>
      ) : (
        <div className='max-w-full'>
          <DataGrid
            className='w-full'
            rows={tableRecords}
            columns={adminModerationProductTableColumn(
              handleApprove,
              handleDelete,
              handleProductView)}
            paginationMode='server'
            rowCount={pagination?.totalElements || 0}
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
            pageSizeOptions={[pagination?.pageSize || 10]}
            pagination
            paginationOptions={{
              showFirstButton: true,
              showLastButton: true,
              hideNextButton: currentPage === pagination?.totalPages,
            }}
            />
        </div>
      )}
      </>
    )}


    <DeleteModal
      open={openDeleteModal}
      setOpen={setOpenDeleteModal}
      loader={loader}
      title="Delete Product"
      onDeleteHandler={onDeleteHandler} />

      <ProductViewModal 
        open={openProductViewModal}
        setOpen={setOpenProductViewModal}
        product={selectedProduct}
      />
    </div>
  )
}

export default AdminProducts
