import axios from "axios";

const client = axios.create({ baseURL: "/api" });
export async function fetchData(from, to, horizon = 4) {
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