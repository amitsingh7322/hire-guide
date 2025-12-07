'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, ArrowLeft, Search, MoreVertical } from 'lucide-react';
import { toastError, toastSuccess } from '@/lib/ToastContext';

interface Conversation {
  user_id: string;
  userName?: string;
  userEmail?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message?: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check authentication
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
  }, [authLoading, user, router]);

  // Fetch conversations - ONLY ONCE when component mounts
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res: any = await api.get('/api/messages');
        
        if (res.success && res.conversations) {
          setConversations(res.conversations);
          
          // Auto-select first conversation or from URL
          const urlUserId = searchParams.get('user');
          if (urlUserId) {
            setSelectedUserId(urlUserId);
          } else if (res.conversations.length > 0) {
            setSelectedUserId(res.conversations.user_id); // ✅ FIXED: 
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        toastError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]); // ✅ FIXED: Removed searchParams

  // Fetch messages with specific user
  useEffect(() => {
    if (!selectedUserId || !user) return;

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res: any = await api.get(`/api/messages/conversation/${selectedUserId}`);
        
        if (!isMounted) return;
        
        if (res.success && res.messages) {
          setMessages(res.messages);
          
          // Auto-scroll to bottom
          setTimeout(() => {
            const messagesContainer = document.getElementById('messages-container');
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to fetch messages:', error);
      }
    };

    // Fetch on mount
    fetchMessages();

    // Poll every 5 seconds
    const interval = setInterval(fetchMessages, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedUserId, user]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      setSendingMessage(true);
      
      console.log('📤 Sending message to:', selectedUserId);
      console.log('Message:', newMessage);
      
      const res: any = await api.post('/api/messages', {
        receiverId: selectedUserId,
        content: newMessage,
      });

      console.log('📥 Response:', res);

      if (res && res.success && res.message) {
        console.log('✅ Message sent successfully');
        
        setMessages([...messages, res.message]);
        setNewMessage('');
        toastSuccess('Message sent!');
        
        setTimeout(() => {
          const messagesContainer = document.getElementById('messages-container');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      } else {
        console.error('❌ Invalid response:', res);
        toastError('Failed to send message');
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      toastError(error?.response?.data?.error || error?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
    conv.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected conversation
  const selectedConversation = conversations.find(c => c.user_id === selectedUserId);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Conversations List */}
      <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              {conversations.length === 0
                ? 'No conversations yet. Start a conversation!'
                : 'No matching conversations'}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.user_id}
                onClick={() => setSelectedUserId(conv.user_id)}
                className={`w-full px-4 py-4 border-b border-gray-100 text-left transition ${
                  selectedUserId === conv.user_id
                    ? 'bg-teal-50 border-l-4 border-l-teal-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{conv.userName}</p>
                    <p className="text-sm text-gray-600 truncate">{conv.userEmail}</p>
                  </div>
                  {conv.unreadCount && conv.unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-teal-600 text-white text-xs rounded-full font-semibold">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{conv.lastMessage}</p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedConversation?.userName}
                </h2>
                <p className="text-sm text-gray-600">{selectedConversation?.userEmail}</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Messages Container */}
            <div
              id="messages-container"
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-600">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                        msg.sender_id === user?.id
                          ? 'bg-teal-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <p className="break-words">{msg.content || msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender_id === user?.id ? 'text-teal-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  disabled={sendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 flex items-center gap-2 font-semibold transition"
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* Mobile Chat View */}
      {selectedUserId && (
        <div className="md:hidden flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setSelectedUserId(null)}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedConversation?.userName}
              </h2>
            </div>
          </div>

          <div
            id="messages-container"
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-600">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      msg.sender_id === user?.id
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="break-words">{msg.content || msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender_id === user?.id ? 'text-teal-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                disabled={sendingMessage}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {sendingMessage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
