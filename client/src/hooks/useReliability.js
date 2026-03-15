import { useState, useEffect } from "react";
import { fetchReliability } from "@/utils/api.js";

export function useReliability() {
  const [reliability, setReliability] = useState(null);
  const [loading, setLoading]= useState(true);

  useEffect(() => {
    fetchReliability()
      .then(setReliability)
      .catch(() => setReliability(null))
      .finally(() => setLoading(false));
  }, []);

  return { reliability, loading };
}