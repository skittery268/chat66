import { createContext, useContext, useState, useCallback } from 'react';
import { socket } from '../config/socket.js';
import * as api from '../api';
import { useEffect } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const handleNewMessage = (message) => {
      console.log(message)
      setMessages((prev) => {
        if(prev.some(m => m._id == message._id)) return prev;
        return [...prev, message]
      });
    };

    const handleDeleteMessage = (messageId) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("deleteMessage", handleDeleteMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('deleteMessage', handleDeleteMessage);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const data = await api.getUserGroups();
      setGroups(data.data.groups);
    } finally {
      setLoadingGroups(false);
    }
  }, []);


  const createGroup = async (title) => {
    const data = await api.createGroup(title);
    setGroups((prev) => [...prev, data.data.group]);
    return data.data.group;
  };

  const joinGroup = async (id) => {
    const data = await api.joinGroup(id);
    setGroups((prev) => [...prev, data.data.group]);
    return data.data.group;
  };

  const deleteGroup = async (id) => {
    await api.deleteGroup(id);
    setGroups((prev) => prev.filter((g) => g._id !== id));
    if (activeGroup?._id === id) {
      setActiveGroup(null);
      setMessages([]);
    }
  };

  const selectGroup = async (group) => {
    if (activeGroup) {
      socket.emit('leaveGroup', activeGroup._id);
    }

    setActiveGroup(group);
    setLoadingMessages(true);

    socket.emit("joinGroup", group._id);
    try {
      const data = await api.getMessages(group._id);
      console.log(data)
      setMessages(data.data.messages);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (content) => {
    if (!activeGroup) return;
    await api.sendMessage(activeGroup._id, content);
    // setMessages((prev) => [...prev, data.data.message]);
  };

  const deleteMessage = async (messageId) => {
    await api.deleteMessage(messageId);
    // setMessages((prev) => prev.filter((m) => m._id !== messageId));
  };

  const reset = () => {
    if (activeGroup) {
      socket.emit('leaveGroup', activeGroup._id);
    }

    setGroups([]);
    setActiveGroup(null);
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        groups,
        activeGroup,
        messages,
        loadingGroups,
        loadingMessages,
        fetchGroups,
        createGroup,
        joinGroup,
        deleteGroup,
        selectGroup,
        sendMessage,
        deleteMessage,
        reset,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
