import { DataGrid } from '@mui/x-data-grid'
import { adminOrderTableColumn } from '../../helper/tableColumn';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../../shared/Modal';
import UpdateOrderForm from './UpdateOrderForm';
import SellerOrderDetails from '../../seller/orders/SellerOrderDetails';
import { useSelector } from 'react-redux';

const OrderTable = ({ adminOrder, pagination, title = "All Orders", showDetails = false }) => {
  const [updateOpenModal, setUpdateOpenModal] = useState(false);
  const [detailsOpenModal, setDetailsOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(
    pagination?.pageNumber + 1 || 1
  );

  const [searchParams] = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const pathname = useLocation().pathname;
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const allowEdit = useMemo(() => !isAdmin, [isAdmin]);

const tableRecords = adminOrder?.map((item) => {
  return {
    id: item.orderId,
    email: item.email,
    totalAmount: item.totalAmount,
    status: item.orderStatus,
    date: item.orderDate,
    payment: item.payment,
    orderItems: item.orderItems,
    subtotalAmount: item.subtotalAmount,
    discountAmount: item.discountAmount,
    couponCode: item.couponCode,
    addressId: item.addressId,
    carrierName: item.carrierName,
    trackingNumber: item.trackingNumber,
    estimatedDeliveryDate: item.estimatedDeliveryDate,
    deliveredAt: item.deliveredAt,
  }
});

const handlePaginationChange = (paginationModel) => {
  const page = paginationModel.page + 1;
  setCurrentPage(page);
  params.set("page", page.toString());
  navigate(`${pathname}?${params}`)
}

const handleEdit = (order) => {
  setSelectedItem(order);
  setUpdateOpenModal(true);
}

const handleView = (order) => {
  setSelectedItem(order);
  setDetailsOpenModal(true);
}

  return (
    <div>
      <h1 className='text-slate-800 text-3xl text-center font-bold pb-6 uppercase'>
        {title}
      </h1>

      <div>
         <DataGrid
         className='w-full'
            rows={tableRecords}
            columns={adminOrderTableColumn(handleEdit, showDetails || isAdmin ? handleView : null, allowEdit)}
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

      {allowEdit && (
        <Modal
          open={updateOpenModal}
          setOpen={setUpdateOpenModal}
          title='Update Order Status'>
            <UpdateOrderForm
              setOpen={setUpdateOpenModal}
              open={updateOpenModal}
              loader={loader}
              setLoader={setLoader}
              selectedId={selectedItem.id}
              selectedItem={selectedItem}
              />
        </Modal>
      )}

      {(showDetails || isAdmin) && (
        <Modal
          open={detailsOpenModal}
          setOpen={setDetailsOpenModal}
          title='Order Details'>
            <SellerOrderDetails order={selectedItem} onClose={() => setDetailsOpenModal(false)} />
        </Modal>
      )}
    </div>
  )
}

export default OrderTable
