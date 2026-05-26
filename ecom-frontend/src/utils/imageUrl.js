const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url);

export const getProductImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (isAbsoluteUrl(image)) {
    return image;
  }

  const backendUrl = import.meta.env.VITE_BACK_END_URL || "";
  const normalizedBackendUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;
  const normalizedImage = image.startsWith("/") ? image.slice(1) : image;

  if (normalizedImage.startsWith("images/")) {
    return `${normalizedBackendUrl}/${normalizedImage}`;
  }

  return `${normalizedBackendUrl}/images/${normalizedImage}`;
};
