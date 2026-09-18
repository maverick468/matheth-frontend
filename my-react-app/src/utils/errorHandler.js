export function handleApiError(error) {
  if (error.response) {
    // Server responded with an error status code
    return error.response.data.message || "An unexpected error occurred on the server.";
  } else if (error.request) {
    // Request was made but no response received
    return "Unable to connect to the server. Please check your network connection.";
  } else {
    // Error setting up the request
    return error.message || "An unknown error occurred.";
  }
}