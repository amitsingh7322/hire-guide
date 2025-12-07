'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { X } from 'lucide-react';
import { toastError } from '@/lib/ToastContext';

interface MessagingModalProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MessagingModal({
  recipientId,
  recipientName,
  onClose,
  onSuccess,
}: MessagingModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);

    try {
      await api.post('/api/messages', {
        recipient_id: recipientId,
        message,
      });

      setMessage('');
      onSuccess();
    } catch (err: any) {
      toastError(err?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Message {recipientName}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full border rounded px-3 py-2 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
