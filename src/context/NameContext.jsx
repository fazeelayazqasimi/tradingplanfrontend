import { createContext, useContext, useState, useEffect } from 'react';

const NameContext = createContext(null);

export const NameProvider = ({ children }) => {
  const [visitorName, setVisitorName] = useState(() => {
    return localStorage.getItem('visitorName') || '';
  });

  useEffect(() => {
    if (visitorName) {
      localStorage.setItem('visitorName', visitorName);
    }
  }, [visitorName]);

  const clearName = () => {
    setVisitorName('');
    localStorage.removeItem('visitorName');
  };

  return (
    <NameContext.Provider value={{ visitorName, setVisitorName, clearName }}>
      {children}
    </NameContext.Provider>
  );
};

export const useName = () => {
  const context = useContext(NameContext);
  if (!context) throw new Error('useName must be used within NameProvider');
  return context;
};