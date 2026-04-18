package com.ecommerce.project.service;

import com.ecommerce.project.payload.AnalyticsResponse;
import com.ecommerce.project.config.AppConstants;
import com.ecommerce.project.repositories.OrderRepository;
import com.ecommerce.project.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsServiceImpl implements AnalyticsService{

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public AnalyticsResponse getAnalyticsData() {
        AnalyticsResponse response = new AnalyticsResponse();

        long productCount = productRepository.count();
        long totalOrders = orderRepository.count();
        Double totalRevenue = orderRepository.getTotalRevenue();

        response.setProductCount(String.valueOf(productCount));
        response.setTotalOrders(String.valueOf(totalOrders));
        response.setTotalRevenue(String.valueOf(totalRevenue != null ? totalRevenue : 0));
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

        response.setProductCount(String.valueOf(productCount));
        response.setTotalOrders(String.valueOf(totalOrders));
        response.setTotalRevenue(String.valueOf(totalRevenue != null ? totalRevenue : 0));
        response.setPendingOrders(String.valueOf(pendingOrders));
        response.setDeliveredOrders(String.valueOf(deliveredOrders));
        response.setSoldUnits(String.valueOf(soldUnits != null ? soldUnits : 0));
        return response;
    }
}
