import { createContext, useContext, useMemo } from 'react';

const FOUNDATION_AUTH = Object.freeze({
  configured: false,
  status: 'unconfigured',
  session: null,
  user: null,
  permissions: [],
});

const AuthContext = createContext(FOUNDATION_AUTH);

export function AuthProvider({ children, value }) {
  const contextValue = useMemo(() => value ?? FOUNDATION_AUTH, [value]);
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
