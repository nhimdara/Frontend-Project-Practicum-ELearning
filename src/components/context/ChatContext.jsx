import React, { createContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [pageContext, setPageContext] = useState('home');

  return (
    <ChatContext.Provider value={{ pageContext, setPageContext }}>
      {children}
    </ChatContext.Provider>
  );
};
