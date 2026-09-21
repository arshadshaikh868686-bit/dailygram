import { useEffect, useRef, useState } from 'react';
import api, { getError } from '../lib/api';
import { Spinner, Toast } from '../components/UI';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faBookOpen,
  faPaperPlane,
  faRobot,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';

export default function AI() {
  const [mode, setMode] = useState('chat');

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: "Hey 👋 I'm Safi. You can talk to me normally, ask questions, study something, or just chat with me.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const [syllabus, setSyllabus] = useState('');
  const [days, setDays] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [msg, setMsg] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [chatMessages]);

   const sendMessage = async (e) => {
    e?.preventDefault();

    const cleanMessage = chatInput.trim();

    if (!cleanMessage || chatLoading) return;

    const updatedMessages = [
      ...chatMessages,
      {
        role: 'user',
        text: cleanMessage,
      },
    ];

    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const { data } = await api.post('/ai/chat', {
        message: cleanMessage,
        history: chatMessages,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data?.reply || 'Sorry, I could not generate a response.',
        },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: getError(error),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };



  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const generate = async (e) => {
    e.preventDefault();

    if (!syllabus.trim()) {
      setMsg('Please enter your syllabus or topics.');
      return;
    }

    if (!days) {
      setMsg('Please enter the number of days.');
      return;
    }

    setLoading(true);
    setMsg('');
    setData(null);

    try {
      const response = await api.post('/ai/timetable', {
        syllabus: syllabus.trim(),
        days: Number(days),
      });

      setData(response.data);
    } catch (error) {
      setMsg(getError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      <header>
        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase block mb-1">
          AI ASSISTANT
        </span>

<h1 className="font-serif text-3xl font-bold tracking-normal text-gray-900">
  Meet <b className="font-bold text-blue-800">Safi</b>
</h1>


        <p className="text-slate-500 mt-1 text-sm leading-relaxed">
          Chat normally with Safi or let Safi create a study timetable for you.
        </p>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex gap-2 shadow-sm">

        <button
          onClick={() => setMode('chat')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            mode === 'chat'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FontAwesomeIcon icon={faComments} />
          Chat with Safi
        </button>

        <button
          onClick={() => setMode('planner')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            mode === 'planner'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FontAwesomeIcon icon={faBookOpen} />
          Study Planner
        </button>

      </div>

      {mode === 'chat' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

          <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/60">

            <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center">
               <img  className= 'h-full rounded-full w-full' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFDVeCvsOm2mIDjslfeLI1NXWhc-DTTxnABsaBXwWYVw&s=10'/>

              <FontAwesomeIcon
                className="text-indigo-600 text-lg"
              />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Safi
              </h2>

              <p className="text-xs text-green-600 font-medium">
                ● Online
              </p>
            </div>

          </div>

          <div className="h-[470px] overflow-y-auto p-5 bg-slate-50/50 flex flex-col gap-4">

            {chatMessages.map((message, index) => {
              const isUser = message.role === 'user';

              return (
                <div
                  key={index}
                  className={`flex ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >

                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-2 mb-1.5">
                      <img  className= 'h-10 rounded-full w-12' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFDVeCvsOm2mIDjslfeLI1NXWhc-DTTxnABsaBXwWYVw&s=10'/>
                        <FontAwesomeIcon
                          className="text-indigo-500 text-xs"
                        />

                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          Safi
                        </span>
                      </div>
                    )}

                    {message.text}
                  </div>

                </div>
              );
            })}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Spinner />
                    <span className="text-xs text-slate-500">
                      Safi is typing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />

          </div>

          <form
            onSubmit={sendMessage}
            className="p-3.5 border-t border-slate-200 bg-white flex gap-2.5 items-end"
          >

            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Talk to Safi..."
              rows={1}
              className="flex-1 resize-none px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all"
            />

            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              Send
            </button>

          </form>

          <div className="px-4 pb-3">
            <p className="text-[10px] text-slate-400">
              Press Enter to send • Shift + Enter for a new line
            </p>
          </div>

        </div>
      )}

      {mode === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* FORM */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Study Planner
                </h2>

                <p className="text-xs text-slate-500">
                  Create a personalized timetable
                </p>
              </div>

            </div>

            <form
              onSubmit={generate}
              className="space-y-5"
            >

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Syllabus / Topics
                </label>

                <textarea
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  placeholder="Example: React, Node.js, MongoDB, JavaScript..."
                  rows={7}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Number of Days
                </label>

                <input
                  type="number"
                  min="1"
                  max="365"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="Example: 10"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50"
                />
              </div>

              {msg && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs">
                  {msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Generating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faBookOpen} />
                    Generate Timetable
                  </>
                )}
              </button>

            </form>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <img  className= 'h-full  w-full' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFDVeCvsOm2mIDjslfeLI1NXWhc-DTTxnABsaBXwWYVw&s=10'/>
              
                <FontAwesomeIcon

                  className="text-indigo-600"
                />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Your Timetable
                </h2>

                <p className="text-xs text-slate-500">
                  Generated by Safi
                </p>
              </div>

            </div>

            {!data?.days?.length ? (
              <div className="h-[400px] flex items-center justify-center text-center">

                <div>
                  <FontAwesomeIcon
                    icon={faBookOpen}
                    className="text-slate-300 text-4xl mb-4"
                  />

                  <h3 className="font-semibold text-slate-500">
                    No timetable yet
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Enter your syllabus and generate your study plan.
                  </p>
                </div>

              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">

                {data.days.map((day) => (
                  <div
                    key={day.day}
                    className="border border-slate-200 rounded-xl p-4"
                  >

                    <div className="flex items-center justify-between mb-2">

                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        Day {day.day}
                      </span>

                    </div>

                    <div className="space-y-2">

                      {day.topics?.map((topic, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 rounded-lg px-3 py-2"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {topic}
                          </p>
                        </div>
                      ))}

                    </div>

                    {day.notes && (
                      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                        {day.notes}
                      </p>
                    )}

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      )}

      {msg && mode === 'chat' && (
        <Toast
          message={msg}
          onClose={() => setMsg('')}
        />
      )}

    </div>
  );
}