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
   const candidates = [
      `/api/posts?page=${page}&size=${size}&_=${Date.now()}`,
      `/api/post?page=${page}&size=${size}&_=${Date.now()}`
   ];

   let lastError;

   for (const endpoint of candidates) {
      try {
         const pageData = await apiRequest(endpoint);
         const posts = Array.isArray(pageData)
            ? pageData
            : Array.isArray(pageData?.content)
              ? pageData.content
              : Array.isArray(pageData?.posts)
                ? pageData.posts
                : [];

         return posts
            .filter(Boolean)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      } catch (error) {
         lastError = error;
      }
   }

   throw lastError || new Error("Unable to load posts.");
}

async function getPostById(id) {
   const candidates = [
      `/api/posts/${encodeURIComponent(id)}`,
      `/api/post/${encodeURIComponent(id)}`
   ];

   let lastError;

   for (const endpoint of candidates) {
      try {
         const result = await apiRequest(endpoint);
         const post = result?.post || result?.data?.post || result?.data || result;
         if (post && typeof post === "object") {
            return post;
         }
      } catch (error) {
         lastError = error;
      }
   }

   throw lastError || new Error(`Unable to load post ${id}.`);
}

async function createPost(post) {
   let student = null;
   try {
      const storedStudent = localStorage.getItem("student");
      student = storedStudent ? JSON.parse(storedStudent) : null;
   } catch {
      student = null;
   }

   const enrichedPost = {
      ...post,
      id: post.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `post-${Date.now()}`),
      createdAt: post.createdAt || new Date().toISOString(),
      status: post.status || "published",
      isPublished: post.isPublished ?? true,
      author: post.author || {
         id: student?.id || student?._id || null,
         fullName: student?.fullName || student?.name || "Unknown author"
      }
   };

   return apiRequest("/api/posts", {
      method: "POST",
      body: JSON.stringify(enrichedPost)
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