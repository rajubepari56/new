"use client";
import { useEffect, useRef, useState } from "react";
import { makeOrder, seed, step, type Order } from "./sim";

/** Rolling random-walk series. Starts empty on the server so hydration never mismatches. */
export function useSeries(n = 80, ms = 900, start = 100, drift = 0.04, vol = 0.45) {
  const [s, setS] = useState<number[]>([]);
  useEffect(() => {
    setS(seed(n, start, drift, vol));
    const id = setInterval(() => setS((p) => (p.length ? [...p.slice(1), step(p[p.length - 1], drift, vol)] : p)), ms);
    return () => clearInterval(id);
  }, [n, ms, start, drift, vol]);
  return s;
}

/** Streaming agent order log (newest first). */
export function useOrders(max = 14, ms = 1700) {
  const [o, setO] = useState<Order[]>([]);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    setO(Array.from({ length: 8 }, makeOrder).reverse());
    const id = setInterval(() => alive.current && setO((p) => [makeOrder(), ...p].slice(0, max)), ms);
    return () => { alive.current = false; clearInterval(id); };
  }, [max, ms]);
  return o;
}
