import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, AlertCircle, MessageCircle, CheckCircle, Plus } from 'lucide-react';
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
  arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: any;
}

interface Complaint {
  id: string;
  name: string;
  email: string;
  complaint: string;
  messages: Message[];
  createdAt: any;
  status: 'pending' | 'in-progress' | 'resolved';
}

export const ComplaintsChatPage = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedComplaint?.messages]);

  // Fetch user's complaints
  useEffect(() => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const complaintsCollection = collection(db, 'complaints');
      const q = query(complaintsCollection, where('email', '==', user.email), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedComplaints = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          email: doc.data().email || '',
          complaint: doc.data().complaint || '',
          messages: doc.data().messages || [],
          createdAt: doc.data().createdAt,
          status: doc.data().status || 'pending'
        }));
        
        setComplaints(fetchedComplaints);
        setError(null);
        
        // Select first complaint if none selected
        if (fetchedComplaints.length > 0 && !selectedComplaint) {
          setSelectedComplaint(fetchedComplaints[0]);
        }
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [user?.email, selectedComplaint]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedComplaint) return;

    try {
      setSending(true);

      const complaintRef = doc(db, 'complaints', selectedComplaint.id);
      const newMsg: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: serverTimestamp()
      };

      await updateDoc(complaintRef, {
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

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.complaint.trim() || !user?.email) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitLoading(true);

      const complaintsCollection = collection(db, 'complaints');
      await addDoc(complaintsCollection, {
        name: formData.name,
        email: user.email,
        complaint: formData.complaint,
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
      console.error('Error submitting complaint:', err);
      setError(err.message || 'Failed to submit complaint');
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to view your complaints</p>
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
          <p className="text-gray-600 dark:text-gray-400">Loading complaints...</p>
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
      {/* Complaints List */}
      <div className="w-full md:w-80 flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Your Complaints</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {complaints.length} {complaints.length === 1 ? 'complaint' : 'complaints'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSubmitForm(true)}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="Submit new complaint"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {complaints.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No complaints yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {complaints.map((complaint) => (
                <motion.button
                  key={complaint.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedComplaint(complaint)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedComplaint?.id === complaint.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-800 border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-1">
                        {complaint.complaint}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(complaint.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          complaint.status === 'resolved'
                            ? 'bg-green-500'
                            : complaint.status === 'in-progress'
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {selectedComplaint ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">
                    {selectedComplaint.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {selectedComplaint.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedComplaint.status === 'resolved'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : selectedComplaint.status === 'in-progress'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {selectedComplaint.status || 'pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
              {/* Initial Complaint */}
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-2">
                    Initial Complaint
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedComplaint.complaint}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(selectedComplaint.createdAt?.seconds * 1000).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Messages */}
              {selectedComplaint.messages && selectedComplaint.messages.length > 0 && (
                <AnimatePresence>
                  {selectedComplaint.messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg p-4 ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.sender === 'user'
                              ? 'text-blue-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {new Date(msg.timestamp?.seconds * 1000).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
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
              <p>Select a complaint to view the conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Complaint Modal */}
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
                  Submit a Complaint
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
                    Complaint submitted successfully!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                    We'll review it shortly
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitComplaint} className="space-y-4">
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

                  {/* Complaint Textarea */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                      Complaint Details
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
                      Submit Complaint
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
