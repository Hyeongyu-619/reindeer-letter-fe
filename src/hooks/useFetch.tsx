"use client";

import instance from "@/api/instance";
import { AxiosInstance, CanceledError, isAxiosError } from "axios";
import { useEffect, useState } from "react";
import useLocalStorage from "./useLocalStorage";

interface UseFetchType<B> {
  route: string;
  body: B;
  method: keyof AxiosInstance;
}

/**
 * 서버 상태를 가져오는 커스텀 훅입니다.
 *
 * @param route API 경로
 * @param method HTTP 메소드
 * @returns 서버 상태 (데이터, 로딩 상태, 에러 상태, 에러 객체)
 */
export default function useFetch<T, B>({
  route,
  body,
  method,
}: UseFetchType<B>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error>();
  const [token] = useLocalStorage("token");

  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        if (method === "get" || method === "delete") {
          const response = await instance[method]<T>(route, {
            signal: abortController.signal,
            headers: { Authorization: `Bearer ${token}` },
          });
          setData(response.data);
        } else if (method === "post" || method === "put") {
          const response = await instance[method]<T>(route, body, {
            signal: abortController.signal,
            headers: { Authorization: `Bearer ${token}` },
          });
          setData(response.data);
        } else throw new Error("지원하지 않는 메소드입니다.");
      } catch (error) {
        setIsError(true);
        if (error instanceof CanceledError) setError(error);
        else if (isAxiosError(error))
          setError(new Error(error.response?.data.message));
        else setError(new Error("알 수 없는 오류가 발생했습니다."));
      } finally {
        setIsLoading(false);
      }
    })();
    return () => {
      abortController.abort();
    };
  }, [route, token, method, body]);

  return { data, isLoading, error, isError };
}
