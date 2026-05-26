import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, AlertCircle, MessageCircle, CheckCircle, Plus, Clock, Zap, RefreshCw } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'admin' | 'Admin';
  senderEmail?: string;
  timestamp: any;
}

interface CustomerCareTicket {
  id: string;
  name: string;
  email: string;
  issue: string;
  messages: Message[];
  createdAt: any;
  status: 'pending' | 'in-progress' | 'resolved';
}

export const CustomerCareChatPage = () => {
  const [customerCareTickets, setCustomerCareTickets] = useState<CustomerCareTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<CustomerCareTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    complaint: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = getAuth();
  const user = auth.currentUser;

  const handleRefresh = async () => {
    if (!selectedTicket) return;
    
    try {
      setIsRefreshing(true);
      // Re-fetch the specific ticket to get latest messages
      const ticketRef = doc(db, 'customer_care', selectedTicket.id);
      
      // Wait a moment then fetch
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const docSnap = await getDoc(ticketRef);
      if (docSnap.exists()) {
        const updatedTicket: CustomerCareTicket = {
          id: docSnap.id,
          name: docSnap.data().name || '',
          email: docSnap.data().email || '',
          issue: docSnap.data().issue || '',
          messages: docSnap.data().messages || [],
          createdAt: docSnap.data().createdAt,
          status: docSnap.data().status || 'pending'
        };
        
        // Update the selected ticket
        setSelectedTicket(updatedTicket);
        
        // Update in the tickets list
        setCustomerCareTickets(prev => 
          prev.map(ticket => 
            ticket.id === updatedTicket.id ? updatedTicket : ticket
          )
        );
      }
    } catch (err: any) {
      console.error('Error refreshing chat:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper function to check if ticket is recent (within last 24 hours)
  const isRecentTicket = (createdAt: any) => {
    if (!createdAt?.seconds) return false;
    const ticketDate = new Date(createdAt.seconds * 1000);
    const now = new Date();
    const hoursAgo = (now.getTime() - ticketDate.getTime()) / (1000 * 60 * 60);
    return hoursAgo < 24;
  };

  // Helper function to format time difference
  const getRelativeTime = (timestamp: any) => {
    if (!timestamp?.seconds) return 'Unknown';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  // Fetch user's customer care tickets
  useEffect(() => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const ticketsCollection = collection(db, 'customer_care');
      const q = query(ticketsCollection, where('email', '==', user.email), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedTickets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          email: doc.data().email || '',
          issue: doc.data().issue || '',
          messages: doc.data().messages || [],
          createdAt: doc.data().createdAt,
          status: doc.data().status || 'pending'
        }));
        
        setCustomerCareTickets(fetchedTickets);
        setError(null);
        
        // Select first ticket if none selected
        if (fetchedTickets.length > 0 && !selectedTicket) {
          setSelectedTicket(fetchedTickets[0]);
        }
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error fetching customer care tickets:', err);
      setError(err.message || 'Failed to load customer care tickets');
    } finally {
      setLoading(false);
    }
  }, [user?.email, selectedTicket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedTicket) return;

    try {
      setSending(true);

      const ticketRef = doc(db, 'customer_care', selectedTicket.id);
      const newMsg: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: {
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: 0
        }
      };

      await updateDoc(ticketRef, {
        messages: arrayUnion(newMsg),
        updatedAt: serverTimestamp()
      });

      setNewMessage('');
      setError(null);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.complaint.trim() || !user?.email) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitLoading(true);

      const ticketsCollection = collection(db, 'customer_care');
      await addDoc(ticketsCollection, {
        name: formData.name,
        email: user.email,
        issue: formData.complaint,
        createdAt: serverTimestamp(),
        status: 'pending',
        messages: []
      });

      setFormData({ name: '', complaint: '' });
      setSubmitSuccess(true);
      setError(null);

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowSubmitForm(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting ticket:', err);
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-96"
      >
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to view your customer care tickets</p>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-96"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading customer care tickets...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-screen flex flex-col md:flex-row gap-4 p-4 max-w-7xl mx-auto"
    >
      {/* Tickets List */}
      <div className="w-full md:w-80 flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Tickets</h2>
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {customerCareTickets.length} {customerCareTickets.length === 1 ? 'ticket' : 'tickets'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              title="Refresh tickets"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSubmitForm(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Submit new ticket"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {customerCareTickets.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tickets yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Submit your first ticket using the + button</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {customerCareTickets.map((ticket, index) => {
                const lastAdmin = ticket.messages?.slice().reverse().find((m: any) => m.sender === 'admin' || m.sender === 'Admin');
                const isRecent = isRecentTicket(ticket.createdAt);
                const relativeTime = getRelativeTime(ticket.createdAt);
                
                return (
                  <motion.button
                    key={ticket.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-3 rounded-lg transition-colors relative overflow-hidden ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-800 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {/* Recent Badge */}
                    {isRecent && index === 0 && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        RECENT
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between gap-2 pr-12">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-1">
                          {ticket.issue}
                        </p>
                        {lastAdmin ? (
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1 line-clamp-1">
                            ✓ Admin: {lastAdmin.text}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {relativeTime}
                          </p>
                        )}
                        {lastAdmin && lastAdmin.timestamp && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Response: {getRelativeTime(lastAdmin.timestamp)}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            ticket.status === 'resolved'
                              ? 'bg-green-500'
                              : ticket.status === 'in-progress'
                              ? 'bg-yellow-500'
                              : 'bg-red-400'
                          }`}
                        />
                        {isRecent && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded">New</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">
                    {selectedTicket.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {selectedTicket.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : selectedTicket.status === 'in-progress'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {selectedTicket.status || 'pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
              {/* Initial Ticket */}
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-2">
                    Initial Ticket
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedTicket.issue}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(selectedTicket.createdAt?.seconds * 1000).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Messages */}
              {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                <AnimatePresence>
                  {selectedTicket.messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg p-4 ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-gray-100 border border-green-200 dark:border-green-800 rounded-bl-none'
                        }`}
                      >
                        {/* Admin Label */}
                        {(msg.sender === 'admin' || msg.sender === 'Admin') && (
                          <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-1">
                            Admin Response {msg.senderEmail && `(${msg.senderEmail})`}
                          </p>
                        )}
                        <p className="text-sm">{msg.text}</p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.sender === 'user'
                              ? 'text-blue-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {new Date(msg.timestamp?.seconds * 1000).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-900 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a ticket to view the conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Ticket Modal */}
      <AnimatePresence>
        {showSubmitForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSubmitForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6"
            >
              {/* Header */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Submit a Ticket
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Tell us what's wrong. We'll look into it as soon as possible.
                </p>
              </div>

              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                    Ticket submitted successfully!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                    We'll review it shortly
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      disabled={submitLoading}
                    />
                  </div>

                  {/* Email Display */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                      disabled
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your email is auto-filled and will be used to contact you
                    </p>
                  </div>

                  {/* Ticket Textarea */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Ticket Details
                    </label>
                    <textarea
                      value={formData.complaint}
                      onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                      placeholder="Describe your issue in detail..."
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                      disabled={submitLoading}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowSubmitForm(false)}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      disabled={submitLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading || !formData.name.trim() || !formData.complaint.trim()}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {submitLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Submit Ticket
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
