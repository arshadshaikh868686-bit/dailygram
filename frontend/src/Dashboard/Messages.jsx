import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getError } from '../lib/api';
import { getUser } from '../lib/auth';
import { getSocket } from '../lib/socket';
import { Spinner, Empty, Toast } from '../components/UI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faPaperPlane,
  faHand,
  faKey,
  faFolderOpen
} from '@fortawesome/free-solid-svg-icons';

export default function Messages() {
  const user = getUser();
  const userId = user?.userid?.toString();

  const [searchParams] = useSearchParams();

  const [appointmentId, setAppointmentId] = useState(
    searchParams.get('appointmentId') || ''
  );

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // =====================================================
  // SYNC APPOINTMENT ID FROM URL
  // =====================================================

  useEffect(() => {
    const urlAppointmentId =
      searchParams.get('appointmentId') || '';

    setAppointmentId(urlAppointmentId);
  }, [searchParams]);

  // =====================================================
  // FETCH MESSAGES
  // =====================================================

  const fetchMessages = useCallback(async () => {
    if (!appointmentId.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.get(
        `/message/${appointmentId}`
      );

      setMessages(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      setToastMessage(getError(error));
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId]);

  // =====================================================
  // SOCKET SETUP
  // =====================================================

  useEffect(() => {
    const socket = getSocket();

    socketRef.current = socket;

    if (userId) {
      socket.emit('register', userId);
    }

    const handleIncomingMessage = (message) => {
      if (
        message?.appointmentId?.toString() ===
        appointmentId?.toString()
      ) {
        setMessages((prev) => [
          ...prev,
          message
        ]);
      }
    };

    socket.on(
      'receiveMessage',
      handleIncomingMessage
    );

    return () => {
      socket.off(
        'receiveMessage',
        handleIncomingMessage
      );
    };
  }, [appointmentId, userId]);

  // =====================================================
  // AUTO LOAD WHEN APPOINTMENT ID EXISTS
  // =====================================================

  useEffect(() => {
    if (appointmentId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [appointmentId, fetchMessages]);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSendMessage = (e) => {
    e.preventDefault();

    const cleanText = inputMessage.trim();

    if (!cleanText || !appointmentId) {
      return;
    }

    socketRef.current?.emit('sendMessage', {
      appointmentId,
      senderId: userId,
      text: cleanText
    });

    setInputMessage('');
  };

  // =====================================================
  // CHAT BODY
  // =====================================================

  const renderChatInterfaceBody = () => {

    if (!appointmentId) {
      return (
        <div className="flex-1 flex items-center justify-center bg-slate-50/50 p-6">

          <Empty
            icon={
              <FontAwesomeIcon
                icon={faComments}
                className="text-indigo-500 text-3xl"
              />
            }
            title="Choose a conversation"
            text="Open an accepted appointment from Appointments to start chatting."
          />

        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex-1 flex items-center gap-3 justify-center text-slate-500 bg-slate-50/50 py-12">

          <Spinner />

          <span className="text-xs font-semibold tracking-wide">
            Loading messages…
          </span>

        </div>
      );
    }

    return (
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* MESSAGES */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3.5 bg-slate-50/60">

          {messages.length ? (

            messages.map((msg, index) => {

              const msgSenderId =
                msg.senderId?._id?.toString() ||
                msg.senderId?.toString();

              const isMe =
                msgSenderId === userId;

              const timestamp = msg.createdAt
                ? new Date(
                    msg.createdAt
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '';

              return (
                <div
                  key={msg._id || index}
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl flex flex-col text-xs shadow-3xs relative leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white self-end rounded-br-none'
                      : 'bg-white text-slate-900 border border-slate-200/80 self-start rounded-bl-none'
                  }`}
                >

                  {!isMe && (
                    <span className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase mb-1 block">
                      {msg.senderId?.name || 'User'}
                    </span>
                  )}

                  <p className="whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {timestamp && (
                    <small
                      className={`text-[9px] mt-1 block select-none text-right opacity-65 ${
                        isMe
                          ? 'text-indigo-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {timestamp}
                    </small>
                  )}

                </div>
              );
            })

          ) : (

            <div className="my-auto">

              <Empty
                icon={
                  <FontAwesomeIcon
                    icon={faHand}
                    className="text-indigo-400 text-3xl"
                  />
                }
                title="No messages yet"
                text="Say hello when your appointment is accepted."
              />

            </div>

          )}

          <div ref={messagesEndRef} />

        </div>

        {/* MESSAGE INPUT */}
        <form
          className="p-3.5 border-t border-slate-200 bg-white flex gap-2.5 items-center"
          onSubmit={handleSendMessage}
        >

          <input
            value={inputMessage}
            onChange={(e) =>
              setInputMessage(e.target.value)
            }
            placeholder="Write a message…"
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all bg-white"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faPaperPlane} />

            <span>
              Send
            </span>

          </button>

        </form>

      </div>
    );
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-8">

      <header>

        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase block mb-1">
          REAL-TIME CHAT
        </span>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Messages
        </h1>

        <p className="text-slate-500 mt-1 text-sm leading-relaxed">
          Select an accepted appointment from Appointments to open its conversation.
        </p>

      </header>

      <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[550px] overflow-hidden shadow-sm">

        {/* APPOINTMENT ID BAR */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/60 flex gap-2.5 items-center">

          <div className="flex-1 relative flex items-center">

            <FontAwesomeIcon
              icon={faKey}
              className="absolute left-3 text-slate-400 text-xs pointer-events-none"
            />

            <input
              value={appointmentId}
              onChange={(e) =>
                setAppointmentId(e.target.value)
              }
              placeholder="Appointment ID..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 bg-white transition-all"
            />

          </div>

          <button
            onClick={fetchMessages}
            disabled={!appointmentId.trim()}
            className="bg-gray-700 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex-shrink-0 flex items-center gap-1.5"
          >

            <FontAwesomeIcon
              icon={faFolderOpen}
            />

            <span>
              Open Channel
            </span>

          </button>

        </div>

        {renderChatInterfaceBody()}

      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() =>
            setToastMessage('')
          }
        />
      )}

    </div>
  );
}