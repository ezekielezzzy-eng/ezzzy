const BASE_URL = "https://lamzytechnewsapi.onrender.com";
async function apiRequest(endpoint, options = {}, authRequired = false) {
   const headers = { "Content-Type": "application/json", ...options.headers };
   const token = localStorage.getItem("token");

   if (authRequired && !token) {
      throw new Error("You must be logged in to do this.");
   }
   if (token) {
      headers.Authorization = `Bearer ${token}`;
   }

   const requestOptions = { ...options, headers };
   if (!requestOptions.method || requestOptions.method.toUpperCase() === "GET") {
      requestOptions.cache = "no-store";
   }

   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 15000);
   requestOptions.signal = controller.signal;

   let response;
   try {
      response = await fetch(`${BASE_URL}${endpoint}`, requestOptions);
   } catch (error) {
      if (error.name === "AbortError") {
         throw new Error("The server took too long to respond.");
      }
      throw new Error("Could not connect to the posts server.");
   } finally {
      clearTimeout(timeout);
   }
   const responseText = await response.text();
   let result = {};
   try {
      result = responseText ? JSON.parse(responseText) : {};
   } catch {
      result = { message: responseText };
   }
   if (!response.ok || result.success === false) {
      if (response.status === 401) {
         localStorage.removeItem("token");
         localStorage.removeItem("student");
      }
      throw new Error(result.message || `Request failed (${response.status}).`);
   }
   return result.data ?? result;
}

async function getAllPosts(page = 0, size = 10) {
   return apiRequest(`/api/posts?page=${page}&size=${size}&_=${Date.now()}`);
}

async function getPostById(id) {
   return apiRequest(`/api/posts/${encodeURIComponent(id)}`);
}

async function createPost(post) {
   return apiRequest("/api/posts", {
      method: "POST",
      body: JSON.stringify(post)
   }, true);
}

async function updatePost(id, post) {
   return apiRequest(`/api/posts/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(post)
   }, true);
}

async function deletePost(id) {
   return apiRequest(`/api/posts/${encodeURIComponent(id)}`, { method: "DELETE" }, true);
}