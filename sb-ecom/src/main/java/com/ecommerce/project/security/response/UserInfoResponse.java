package com.ecommerce.project.security.response;

import java.util.List;

public class UserInfoResponse {
    private Long id;
    private String jwtToken;
    private String username;
    private String email;
    private List<String> roles;
    private Boolean sellerApproved;
    private Boolean sellerActive;
    private String storeName;
    private String storeDescription;

    public UserInfoResponse(Long id, String username, List<String> roles, String email, String jwtToken) {
        this.id = id;
        this.username = username;
        this.roles = roles;
        this.email = email;
        this.jwtToken = jwtToken;
    }

    public UserInfoResponse(Long id, String username, List<String> roles) {
        this.id = id;
        this.username = username;
        this.roles = roles;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJwtToken() {
        return jwtToken;
    }

    public void setJwtToken(String jwtToken) {
        this.jwtToken = jwtToken;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getSellerApproved() {
        return sellerApproved;
    }

    public void setSellerApproved(Boolean sellerApproved) {
        this.sellerApproved = sellerApproved;
    }

    public Boolean getSellerActive() {
        return sellerActive;
    }

    public void setSellerActive(Boolean sellerActive) {
        this.sellerActive = sellerActive;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getStoreDescription() {
        return storeDescription;
    }

    public void setStoreDescription(String storeDescription) {
        this.storeDescription = storeDescription;
    }
}
