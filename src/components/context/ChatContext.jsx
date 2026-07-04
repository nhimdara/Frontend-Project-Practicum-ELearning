import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [pageContext, setPageContext] = useState('home');

  return (
    <ChatContext.Provider value={{ pageContext, setPageContext }}>
      {children}
    </ChatContext.Provider>
  );
};