package com.ecommerce.project.service;

import com.ecommerce.project.payload.AnalyticsResponse;
import com.ecommerce.project.config.AppConstants;
import com.ecommerce.project.model.Order;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.ProductStatus;
import com.ecommerce.project.model.User;
import com.ecommerce.project.payload.OrderDTO;
import com.ecommerce.project.payload.ProductDTO;
import com.ecommerce.project.repositories.OrderRepository;
import com.ecommerce.project.repositories.ProductRepository;
import com.ecommerce.project.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsServiceImpl implements AnalyticsService{

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlatformSettingsService platformSettingsService;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public AnalyticsResponse getAnalyticsData() {
        AnalyticsResponse response = new AnalyticsResponse();

        long productCount = productRepository.count();
        long sellerCount = userRepository.countByRolesRoleName(com.ecommerce.project.model.AppRole.ROLE_SELLER);
        long totalOrders = orderRepository.count();
        Double totalRevenue = orderRepository.getTotalRevenue();
        long pendingProductApprovals = productRepository.countByProductStatus(ProductStatus.PENDING);
        List<OrderDTO> recentOrders = orderRepository.findTop5ByOrderByOrderDateDesc().stream()
                .map(order -> modelMapper.map(order, OrderDTO.class))
                .toList();
        List<ProductDTO> pendingProducts = productRepository.findTop5ByProductStatusOrderByProductIdAsc(ProductStatus.PENDING).stream()
                .map(this::mapProductToDto)
                .toList();

        response.setProductCount(String.valueOf(productCount));
        response.setSellerCount(String.valueOf(sellerCount));
        response.setTotalOrders(String.valueOf(totalOrders));
        response.setTotalRevenue(String.valueOf(totalRevenue != null ? totalRevenue : 0));
        response.setPendingProductApprovals(String.valueOf(pendingProductApprovals));
        response.setCommissionPercentage(String.valueOf(platformSettingsService.getCommissionPercentage()));
        response.setRecentOrders(recentOrders);
        response.setPendingProducts(pendingProducts);
        return response;
    }

    @Override
    public AnalyticsResponse getSellerAnalyticsData(Long sellerId) {
        AnalyticsResponse response = new AnalyticsResponse();

        long productCount = productRepository.countByUserUserId(sellerId);
        long totalOrders = orderRepository.countOrdersBySeller(sellerId);
        Double totalRevenue = orderRepository.getRevenueBySeller(sellerId);
        long pendingOrders = orderRepository.countOrdersBySellerAndStatus(sellerId, AppConstants.ORDER_STATUS_PENDING);
        long deliveredOrders = orderRepository.countOrdersBySellerAndStatus(sellerId, AppConstants.ORDER_STATUS_DELIVERED);
        Long soldUnits = orderRepository.getSoldUnitsBySeller(sellerId);
        double commissionPercentage = platformSettingsService.getCommissionPercentage();
        double grossSales = totalRevenue != null ? totalRevenue : 0;
        double sellerEarnings = grossSales - (grossSales * commissionPercentage / 100.0);

        response.setProductCount(String.valueOf(productCount));
        response.setTotalOrders(String.valueOf(totalOrders));
        response.setTotalRevenue(String.valueOf(grossSales));
        response.setPendingOrders(String.valueOf(pendingOrders));
        response.setDeliveredOrders(String.valueOf(deliveredOrders));
        response.setSoldUnits(String.valueOf(soldUnits != null ? soldUnits : 0));
        response.setGrossSales(String.valueOf(grossSales));
        response.setSellerEarnings(String.valueOf(sellerEarnings));
        response.setCommissionPercentage(String.valueOf(commissionPercentage));
        return response;
    }

    private ProductDTO mapProductToDto(Product product) {
        ProductDTO productDTO = modelMapper.map(product, ProductDTO.class);
        if (product.getUser() != null) {
            productDTO.setSellerId(product.getUser().getUserId());
            productDTO.setSellerName(product.getUser().getStoreName() != null
                    ? product.getUser().getStoreName()
                    : product.getUser().getUserName());
        }
        return productDTO;
    }
}
