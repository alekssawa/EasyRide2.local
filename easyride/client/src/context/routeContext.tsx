import React, { createContext, useContext, useState, ReactNode } from "react";

// interface DriverWithCoordinates {
//   id: string;
//   coordinates: [number, number];
// }

// type Suggestion = { lat: number; lon: number; };

interface RouteContextType {
  orderId: number | null;
  setOrderId: React.Dispatch<React.SetStateAction<number | null>>;
}

const RouteContext = createContext<RouteContextType | null>(null);

interface RouteProviderProps {
  children: ReactNode;
}

export function RouteProvider({ children }: RouteProviderProps) {
  // const [GnearestDriver, setGNearestDriver] = useState<DriverWithCoordinates | null>(null);
  // const [fromGSuggestions, setGFromSuggestions] = useState<Suggestion[]>([]);
  // const [toGSuggestions, setGToSuggestions] = useState<Suggestion[]>([]);
  const [orderId, setOrderId] = useState<number | null>(null);

  const value: RouteContextType = {
    // GnearestDriver,
    // setGNearestDriver,
    // fromGSuggestions,
    // setGFromSuggestions,
    // toGSuggestions,
    // setGToSuggestions,
    orderId,
    setOrderId,
  };

  return (
    <RouteContext.Provider value={value}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error("useRoute must be used within a RouteProvider");
  }
  return context;
}
