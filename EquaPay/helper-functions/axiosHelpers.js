import { useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase-config";
import server from "../components/server";

const myAxios = {
  createToken: () => {
    const cancelToken = axios.CancelToken.source();
    return cancelToken;
  },

  get: async (path, cancelToken = null, headers = {}) => {
    const token = await auth.currentUser.getIdToken(); //getIdToken() will retrieve the id token and refresh it if necessary
    try {
      const response = await axios.get(server.url + path, {
        cancelToken: cancelToken?.token,
        headers: {
          Authorization: "Bearer " + token,
          ...headers,
        },
      });
      return response;
    } catch (err) {
      throw err;
    }
  },

  delete: async (path, headers = {}) => {
    const token = await auth.currentUser.getIdToken(); //getIdToken() will retrieve the id token and refresh it if necessary
    try {
      await axios.delete(server.url + path, {
        headers: {
          Authorization: "Bearer " + token,
          ...headers,
        },
      });
    } catch (err) {
      throw err;
    }
  },

  post: async (path, post, headers = {}) => {
    const token = await auth.currentUser.getIdToken(); //getIdToken() will retrieve the id token and refresh it if necessary
    try {
      const response = await axios.post(server.url + path, post, {
        headers: {
          Authorization: "Bearer " + token,
          ...headers,
        },
      });
      return response;
    } catch (err) {
      throw err;
    }
  },

  put: async (path, data = {}, headers = {}) => {
    const token = await auth.currentUser.getIdToken(); //getIdToken() will retrieve the id token and refresh it if necessary
    try {
      await axios.put(server.url + path, data, {
        headers: {
          Authorization: "Bearer " + token,
          ...headers,
        },
      });
    } catch (err) {
      throw err;
    }
  },

  run: async (func) => {
    try {
      await func();
    } catch (err) {
      // Handles the canceled error, which just tells us that the request was canceled
      if (err.name === "CanceledError") {
        console.log("canceled request");
      } else {
        throw err;
      }
    }
  },
};

const hooks = {
  useGet: (url, deps = []) => {
    const cancelToken = createToken();
    useEffect(() => {
      const response = myAxios.get(url, cancelToken);
    }, [...deps]);

    return () => {
      cancelToken.cancel();
    };
  },
};

export default myAxios;
