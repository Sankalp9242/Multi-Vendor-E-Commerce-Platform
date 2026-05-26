package com.ecommerce.project.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecommerce.project.exceptions.APIException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");

    @Autowired
    private Cloudinary cloudinary;

    @Value("${cloudinary.enabled:false}")
    private boolean cloudinaryEnabled;

    @Value("${cloudinary.cloud-name:}")
    private String cloudinaryCloudName;

    @Value("${cloudinary.api-key:}")
    private String cloudinaryApiKey;

    @Value("${cloudinary.api-secret:}")
    private String cloudinaryApiSecret;

    @Value("${cloudinary.folder:ecommerce/products}")
    private String cloudinaryFolder;

    @Override
    public String uploadImage(String path, MultipartFile file) throws IOException {
        String extension = validateImage(file);

        if (cloudinaryEnabled) {
            validateCloudinaryConfigured();
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", cloudinaryFolder,
                            "resource_type", "image",
                            "public_id", UUID.randomUUID().toString(),
                            "overwrite", false
                    )
            );
            Object secureUrl = uploadResult.get("secure_url");
            if (secureUrl == null) {
                throw new APIException("Cloudinary upload failed");
            }
            return secureUrl.toString();
        }

        String randomId = UUID.randomUUID().toString();
        String fileName = randomId.concat(extension);
        Path uploadPath = Paths.get(path).toAbsolutePath().normalize();
        Path filePath = uploadPath.resolve(fileName).normalize();

        if (!filePath.startsWith(uploadPath)) {
            throw new APIException("Invalid image path");
        }

        Files.createDirectories(uploadPath);

        Files.copy(file.getInputStream(), filePath);
        return fileName;
    }

    private String validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new APIException("Image file is required");
        }

        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new APIException("Image size must be 5MB or less");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new APIException("Only image files are allowed");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || originalFileName.isBlank() || !originalFileName.contains(".")) {
            throw new APIException("Image file must include a valid extension");
        }

        String extension = originalFileName.substring(originalFileName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new APIException("Only JPG, PNG, and WEBP images are allowed");
        }

        return extension;
    }

    private void validateCloudinaryConfigured() {
        if (cloudinaryCloudName.isBlank() || cloudinaryApiKey.isBlank() || cloudinaryApiSecret.isBlank()) {
            throw new APIException("Cloudinary is enabled but credentials are not configured");
        }
    }
}
