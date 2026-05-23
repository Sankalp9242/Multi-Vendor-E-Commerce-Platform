package com.ecommerce.project.service;

import com.ecommerce.project.config.AppConstants;
import com.ecommerce.project.model.AppRole;
import com.ecommerce.project.model.Category;
import com.ecommerce.project.model.Order;
import com.ecommerce.project.model.OrderItem;
import com.ecommerce.project.model.Payment;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.ProductStatus;
import com.ecommerce.project.model.ReturnRequest;
import com.ecommerce.project.model.User;
import com.ecommerce.project.payload.*;
import com.ecommerce.project.repositories.OrderRepository;
import com.ecommerce.project.repositories.ProductRepository;
import com.ecommerce.project.repositories.ReturnRequestRepository;
import com.ecommerce.project.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ReportServiceImpl implements ReportService {

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReturnRequestRepository returnRequestRepository;

    @Autowired
    private PlatformSettingsService platformSettingsService;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional(readOnly = true)
    public UserReportsResponse getUserReports(String email) {
        List<Order> orders = orderRepository.findAllByEmailOrderByOrderDateDesc(email);

        List<OrderDTO> orderHistoryReport = orders.stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .toList();

        List<PaymentHistoryDTO> paymentHistoryReport = orders.stream()
                .map(order -> buildPaymentHistory(order))
                .toList();

        List<DeliveryTrackingDTO> deliveryTrackingReport = orders.stream()
                .map(order -> new DeliveryTrackingDTO(
                        order.getOrderId(),
                        order.getOrderDate(),
                        order.getOrderStatus(),
                        order.getCarrierName(),
                        order.getTrackingNumber(),
                        order.getEstimatedDeliveryDate()
                ))
                .toList();

        Map<String, MonthlySpendingDTO> monthlySpendingMap = new LinkedHashMap<>();
        for (Order order : orders) {
            if (AppConstants.ORDER_STATUS_CANCELLED.equalsIgnoreCase(order.getOrderStatus())) {
                continue;
            }
            String monthKey = order.getOrderDate() != null ? order.getOrderDate().format(MONTH_FORMATTER) : "Unknown";
            MonthlySpendingDTO report = monthlySpendingMap.getOrDefault(
                    monthKey, new MonthlySpendingDTO(monthKey, 0L, 0.0)
            );
            report.setOrderCount(report.getOrderCount() + 1);
            report.setTotalAmount(report.getTotalAmount() + (order.getTotalAmount() != null ? order.getTotalAmount() : 0));
            monthlySpendingMap.put(monthKey, report);
        }

        List<ReturnRefundReportDTO> returnRefundReport = returnRequestRepository.findAllByBuyerId(
                userRepository.findByEmail(email).orElseThrow().getUserId()
        ).stream()
                .map(this::mapReturnRefundReport)
                .toList();

        return new UserReportsResponse(
                orderHistoryReport,
                paymentHistoryReport,
                deliveryTrackingReport,
                new ArrayList<>(monthlySpendingMap.values()),
                returnRefundReport
        );
    }

    @Override
    @Transactional(readOnly = true)
    public SellerReportsResponse getSellerReports(Long sellerId) {
        User seller = userRepository.findById(sellerId).orElseThrow();
        List<Order> sellerOrders = orderRepository.findAllOrdersBySeller(sellerId);
        List<Product> sellerProducts = productRepository.findByUserAndDeletedFalse(seller);

        List<OrderDTO> ordersReport = sellerOrders.stream()
                .map(order -> mapOrderForSeller(order, sellerId))
                .toList();

        Map<Long, ProductSalesReportDTO> productSalesMap = new LinkedHashMap<>();
        for (Product product : sellerProducts) {
            productSalesMap.put(
                    product.getProductId(),
                    new ProductSalesReportDTO(
                            product.getProductId(),
                            product.getProductName(),
                            product.getProductStatus() != null ? product.getProductStatus().name() : "UNKNOWN",
                            product.getQuantity(),
                            0L,
                            0.0
                    )
            );
        }

        long pendingCount = 0;
        long deliveredCount = 0;
        double grossSales = 0;

        for (Order order : sellerOrders) {
            String status = order.getOrderStatus() != null ? order.getOrderStatus().toUpperCase(Locale.ROOT) : "";
            if (AppConstants.ORDER_STATUS_PENDING.equals(status)) {
                pendingCount++;
            }
            if (AppConstants.ORDER_STATUS_DELIVERED.equals(status)) {
                deliveredCount++;
            }

            boolean countForRevenue = !AppConstants.ORDER_STATUS_CANCELLED.equals(status);
            for (OrderItem orderItem : order.getOrderItems()) {
                Product product = orderItem.getProduct();
                if (product == null || product.getUser() == null || !sellerId.equals(product.getUser().getUserId())) {
                    continue;
                }

                ProductSalesReportDTO report = productSalesMap.computeIfAbsent(
                        product.getProductId(),
                        key -> new ProductSalesReportDTO(
                                product.getProductId(),
                                product.getProductName(),
                                product.getProductStatus() != null ? product.getProductStatus().name() : "UNKNOWN",
                                product.getQuantity(),
                                0L,
                                0.0
                        )
                );

                if (countForRevenue) {
                    long unitsSold = report.getUnitsSold() + orderItem.getQuantity();
                    double revenue = report.getRevenue() + (orderItem.getOrderedProductPrice() * orderItem.getQuantity());
                    report.setUnitsSold(unitsSold);
                    report.setRevenue(revenue);
                    grossSales += orderItem.getOrderedProductPrice() * orderItem.getQuantity();
                }
            }
        }

        double commissionPercentage = platformSettingsService.getCommissionPercentage();
        double commissionDeduction = grossSales * commissionPercentage / 100.0;
        double netEarnings = grossSales - commissionDeduction;
        EarningsReportDTO earningsReport = new EarningsReportDTO(grossSales, commissionPercentage, commissionDeduction, netEarnings);
        EarningsReportDTO commissionDeductionReport = new EarningsReportDTO(grossSales, commissionPercentage, commissionDeduction, netEarnings);

        List<InventoryStockReportDTO> inventoryStockReport = sellerProducts.stream()
                .map(product -> new InventoryStockReportDTO(
                        product.getProductId(),
                        product.getProductName(),
                        product.getProductStatus() != null ? product.getProductStatus().name() : "UNKNOWN",
                        product.getQuantity()
                ))
                .toList();

        List<OrderStatusCountDTO> pendingVsDeliveredOrdersReport = List.of(
                new OrderStatusCountDTO(AppConstants.ORDER_STATUS_PENDING, pendingCount),
                new OrderStatusCountDTO(AppConstants.ORDER_STATUS_DELIVERED, deliveredCount)
        );

        List<ReturnRefundReportDTO> returnRefundReport = returnRequestRepository.findAllBySellerId(sellerId).stream()
                .map(this::mapReturnRefundReport)
                .toList();

        return new SellerReportsResponse(
                ordersReport,
                productSalesMap.values().stream()
                        .sorted(Comparator.comparing(ProductSalesReportDTO::getRevenue).reversed())
                        .toList(),
                earningsReport,
                commissionDeductionReport,
                inventoryStockReport,
                pendingVsDeliveredOrdersReport,
                returnRefundReport
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AdminReportsResponse getAdminReports() {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        List<User> sellers = userRepository.findAllByRoleName(AppRole.ROLE_SELLER);
        List<Product> activeProducts = productRepository.findByDeletedFalse();

        double totalPlatformSales = 0;
        Map<Long, SellerPerformanceAccumulator> sellerAccumulators = new LinkedHashMap<>();
        Map<Long, CategorySalesAccumulator> categoryAccumulators = new LinkedHashMap<>();
        Map<Long, TopProductAccumulator> productAccumulators = new LinkedHashMap<>();

        for (User seller : sellers) {
            sellerAccumulators.put(
                    seller.getUserId(),
                    new SellerPerformanceAccumulator(
                            seller.getUserId(),
                            seller.getUserName(),
                            seller.getStoreName(),
                            0L,
                            0.0
                    )
            );
        }

        for (Order order : orders) {
            String status = order.getOrderStatus() != null ? order.getOrderStatus().toUpperCase(Locale.ROOT) : "";
            if (AppConstants.ORDER_STATUS_CANCELLED.equals(status)) {
                continue;
            }

            totalPlatformSales += order.getTotalAmount() != null ? order.getTotalAmount() : 0;

            Map<Long, Double> sellerRevenuePerOrder = new LinkedHashMap<>();
            for (OrderItem orderItem : order.getOrderItems()) {
                Product product = orderItem.getProduct();
                if (product == null || product.getUser() == null) {
                    continue;
                }

                double lineRevenue = orderItem.getOrderedProductPrice() * orderItem.getQuantity();
                sellerRevenuePerOrder.merge(product.getUser().getUserId(), lineRevenue, Double::sum);

                Category category = product.getCategory();
                if (category != null) {
                    CategorySalesAccumulator categoryAccumulator = categoryAccumulators.computeIfAbsent(
                            category.getCategoryId(),
                            key -> new CategorySalesAccumulator(category.getCategoryId(), category.getCategoryName(), 0L, 0.0)
                    );
                    categoryAccumulator.unitsSold += orderItem.getQuantity();
                    categoryAccumulator.totalRevenue += lineRevenue;
                }

                TopProductAccumulator topProductAccumulator = productAccumulators.computeIfAbsent(
                        product.getProductId(),
                        key -> new TopProductAccumulator(
                                product.getProductId(),
                                product.getProductName(),
                                product.getUser().getStoreName() != null ? product.getUser().getStoreName() : product.getUser().getUserName(),
                                0L,
                                0.0
                        )
                );
                topProductAccumulator.unitsSold += orderItem.getQuantity();
                topProductAccumulator.totalRevenue += lineRevenue;
            }

            for (Map.Entry<Long, Double> entry : sellerRevenuePerOrder.entrySet()) {
                SellerPerformanceAccumulator accumulator = sellerAccumulators.get(entry.getKey());
                if (accumulator != null) {
                    accumulator.totalOrders += 1;
                    accumulator.grossSales += entry.getValue();
                }
            }
        }

        double commissionPercentage = platformSettingsService.getCommissionPercentage();
        double totalCommissionEarned = totalPlatformSales * commissionPercentage / 100.0;

        long approvedActive = sellers.stream().filter(seller -> Boolean.TRUE.equals(seller.getSellerApproved()) && Boolean.TRUE.equals(seller.getSellerActive())).count();
        long approvedInactive = sellers.stream().filter(seller -> Boolean.TRUE.equals(seller.getSellerApproved()) && Boolean.FALSE.equals(seller.getSellerActive())).count();
        long pendingApproval = sellers.stream().filter(seller -> Boolean.FALSE.equals(seller.getSellerApproved())).count();

        List<SellerPerformanceReportDTO> sellerPerformanceReport = sellerAccumulators.values().stream()
                .map(acc -> new SellerPerformanceReportDTO(
                        acc.sellerId,
                        acc.sellerName,
                        acc.storeName,
                        acc.totalOrders,
                        acc.grossSales,
                        acc.grossSales * commissionPercentage / 100.0,
                        acc.grossSales - (acc.grossSales * commissionPercentage / 100.0)
                ))
                .sorted(Comparator.comparing(SellerPerformanceReportDTO::getGrossSales).reversed())
                .toList();

        List<CategorySalesReportDTO> categoryWiseSalesReport = categoryAccumulators.values().stream()
                .map(acc -> new CategorySalesReportDTO(acc.categoryId, acc.categoryName, acc.unitsSold, acc.totalRevenue))
                .sorted(Comparator.comparing(CategorySalesReportDTO::getTotalRevenue).reversed())
                .toList();

        List<TopProductReportDTO> topProductsReport = productAccumulators.values().stream()
                .map(acc -> new TopProductReportDTO(acc.productId, acc.productName, acc.sellerName, acc.unitsSold, acc.totalRevenue))
                .sorted(Comparator.comparing(TopProductReportDTO::getTotalRevenue).reversed())
                .limit(8)
                .toList();

        List<ProductDTO> pendingProductApprovalsReport = activeProducts.stream()
                .filter(product -> product.getProductStatus() == ProductStatus.PENDING)
                .map(product -> {
                    ProductDTO dto = modelMapper.map(product, ProductDTO.class);
                    dto.setSellerId(product.getUser() != null ? product.getUser().getUserId() : null);
                    dto.setSellerName(product.getUser() != null
                            ? (product.getUser().getStoreName() != null ? product.getUser().getStoreName() : product.getUser().getUserName())
                            : null);
                    return dto;
                })
                .limit(8)
                .toList();

        List<ReturnRefundReportDTO> returnRefundManagementReport = returnRequestRepository.findAllWithDetailsOrderByUpdatedAtDesc()
                .stream()
                .map(this::mapReturnRefundReport)
                .toList();

        return new AdminReportsResponse(
                totalPlatformSales,
                totalCommissionEarned,
                sellerPerformanceReport,
                new SellerStatusReportDTO(approvedActive, approvedInactive, pendingApproval),
                pendingProductApprovalsReport,
                categoryWiseSalesReport,
                sellerPerformanceReport.stream().limit(8).toList(),
                topProductsReport,
                returnRefundManagementReport
        );
    }

    private PaymentHistoryDTO buildPaymentHistory(Order order) {
        Payment payment = order.getPayment();
        return new PaymentHistoryDTO(
                order.getOrderId(),
                order.getOrderDate(),
                order.getTotalAmount(),
                payment != null ? payment.getPaymentMethod() : "N/A",
                payment != null ? payment.getPgName() : "N/A",
                payment != null ? payment.getPgStatus() : "N/A",
                payment != null ? payment.getPgPaymentId() : "N/A"
        );
    }

    private OrderDTO mapOrderForSeller(Order order, Long sellerId) {
        OrderDTO dto = modelMapper.map(order, OrderDTO.class);
        List<OrderItemDTO> orderItemDTOs = order.getOrderItems().stream()
                .filter(orderItem -> orderItem.getProduct() != null
                        && orderItem.getProduct().getUser() != null
                        && sellerId.equals(orderItem.getProduct().getUser().getUserId()))
                .map(orderItem -> {
                    OrderItemDTO orderItemDTO = modelMapper.map(orderItem, OrderItemDTO.class);
                    orderItemDTO.setProduct(modelMapper.map(orderItem.getProduct(), ProductDTO.class));
                    return orderItemDTO;
                })
                .toList();

        dto.setOrderItems(orderItemDTOs);
        dto.setTotalAmount(orderItemDTOs.stream()
                .mapToDouble(orderItemDTO -> orderItemDTO.getOrderedProductPrice() * orderItemDTO.getQuantity())
                .sum());
        return dto;
    }

    private ReturnRefundReportDTO mapReturnRefundReport(ReturnRequest request) {
        OrderItem orderItem = request.getOrderItem();
        Product product = orderItem != null ? orderItem.getProduct() : null;
        double refundAmount = orderItem == null
                ? 0.0
                : orderItem.getOrderedProductPrice() * orderItem.getQuantity();

        String sellerName = request.getSeller() == null
                ? null
                : (request.getSeller().getStoreName() != null && !request.getSeller().getStoreName().isBlank()
                    ? request.getSeller().getStoreName()
                    : request.getSeller().getUserName());

        return new ReturnRefundReportDTO(
                request.getId(),
                request.getOrder() != null ? request.getOrder().getOrderId() : null,
                orderItem != null ? orderItem.getOrderItemId() : null,
                product != null ? product.getProductName() : "Unknown Product",
                request.getBuyer() != null ? request.getBuyer().getEmail() : null,
                sellerName,
                request.getReason(),
                request.getStatus() != null ? request.getStatus().name() : "UNKNOWN",
                refundAmount,
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }

    private static class SellerPerformanceAccumulator {
        private final Long sellerId;
        private final String sellerName;
        private final String storeName;
        private long totalOrders;
        private double grossSales;

        private SellerPerformanceAccumulator(Long sellerId, String sellerName, String storeName, long totalOrders, double grossSales) {
            this.sellerId = sellerId;
            this.sellerName = sellerName;
            this.storeName = storeName;
            this.totalOrders = totalOrders;
            this.grossSales = grossSales;
        }
    }

    private static class CategorySalesAccumulator {
        private final Long categoryId;
        private final String categoryName;
        private long unitsSold;
        private double totalRevenue;

        private CategorySalesAccumulator(Long categoryId, String categoryName, long unitsSold, double totalRevenue) {
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.unitsSold = unitsSold;
            this.totalRevenue = totalRevenue;
        }
    }

    private static class TopProductAccumulator {
        private final Long productId;
        private final String productName;
        private final String sellerName;
        private long unitsSold;
        private double totalRevenue;

        private TopProductAccumulator(Long productId, String productName, String sellerName, long unitsSold, double totalRevenue) {
            this.productId = productId;
            this.productName = productName;
            this.sellerName = sellerName;
            this.unitsSold = unitsSold;
            this.totalRevenue = totalRevenue;
        }
    }
}
