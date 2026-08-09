import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [pageContext, setPageContext] = useState('home');

  return (
    <ChatContext.Provider value={{ pageContext, setPageContext }}>
      {children}
    </ChatContext.Provider>
  );
};
