const getApiErrorMessage = (err) => {
  let message = "Something went wrong. Please try again.";

  // Server responded with error
  if (err?.response) {
    const status = err.response.status;

    const apiMessage =
      err.response.data?.message ||
      err.response.data?.error ||
      "";

    if (apiMessage.toLowerCase().includes("verify")) {
      return "Your email is not verified. Please check your inbox.";
    }

    switch (status) {
      case 400:
        return apiMessage || "Invalid request.";

      case 401:
        return "Unauthorized. Please login again.";

      case 403:
        return "Access denied.";

      case 404:
        return "Requested resource not found.";

      case 409:
        return apiMessage || "Conflict detected.";

      case 422:
        return apiMessage || "Validation failed.";

      case 429:
        return "Too many requests. Try again later.";

      default:
        if (status >= 500) {
          return "Server error. Please try again later.";
        }

        if (apiMessage) {
          return apiMessage;
        }

        return message;
    }
  }

  // Request sent but no response
  if (err?.request) {
    return "No response from server. Check your internet connection.";
  }

  // Timeout
  if (err?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  // Generic network error
  if (err?.message === "Network Error") {
    return "Network error. Unable to reach server.";
  }

  return message;
};

export default getApiErrorMessage;