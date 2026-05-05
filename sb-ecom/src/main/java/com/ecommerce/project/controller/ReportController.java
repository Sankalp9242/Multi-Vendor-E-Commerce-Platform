package com.ecommerce.project.controller;

import com.ecommerce.project.payload.AdminReportsResponse;
import com.ecommerce.project.payload.SellerReportsResponse;
import com.ecommerce.project.payload.UserReportsResponse;
import com.ecommerce.project.service.ReportService;
import com.ecommerce.project.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private AuthUtil authUtil;

    @GetMapping("/user/reports")
    public ResponseEntity<UserReportsResponse> getUserReports() {
        return new ResponseEntity<>(reportService.getUserReports(authUtil.loggedInEmail()), HttpStatus.OK);
    }

    @GetMapping("/seller/reports")
    public ResponseEntity<SellerReportsResponse> getSellerReports() {
        return new ResponseEntity<>(reportService.getSellerReports(authUtil.loggedInUserId()), HttpStatus.OK);
    }

    @GetMapping("/admin/reports")
    public ResponseEntity<AdminReportsResponse> getAdminReports() {
        return new ResponseEntity<>(reportService.getAdminReports(), HttpStatus.OK);
    }
}
