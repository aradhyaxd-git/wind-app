import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
 
const client = axios.create({ baseURL: `${BASE_URL}/api` });
 
export async function fetchData(from, to, horizon = 24) {
  const { data } = await client.get("/data", {
    params: { from, to, horizon },
  });
  return data;
}

export async function fetchReliability() {
  const { data } = await client.get("/reliability");
  return data;
}

export async function fetchHealth() {
  const { data } = await client.get("/health");
  return data;
}