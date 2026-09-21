import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getError } from '../lib/api';
import { getUser } from '../lib/auth';
import { Spinner, Empty, Toast } from '../components/UI';

export default function Appointments() {
  const user = getUser();
  const navigate = useNavigate();
  const isMentor = user?.role === 'mentor';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

 const load = useCallback(async () => {
  setLoading(true);

  try {
    if (isMentor) {
      // Mentor ko pending requests + accepted appointments dono chahiye
      const [requestsRes, appointmentsRes] = await Promise.all([
        api.get('/appointments/my-requests'),
        api.get('/appointments/my-appointments'),
      ]);

      const pendingRequests = Array.isArray(requestsRes.data)
        ? requestsRes.data
        : [];

      const allAppointments = Array.isArray(appointmentsRes.data)
        ? appointmentsRes.data
        : [];

      // Duplicate appointments remove karo
      const appointmentMap = new Map();

      [...pendingRequests, ...allAppointments].forEach((appointment) => {
        appointmentMap.set(appointment._id, appointment);
      });

      setItems([...appointmentMap.values()]);
    } else {
      // Learner
      const { data } = await api.get(
        '/appointments/my-appointments'
      );

      setItems(Array.isArray(data) ? data : []);
    }
  } catch (e) {
    setMsg(getError(e));
  } finally {
    setLoading(false);
  }
}, [isMentor]);

  useEffect(() => {
    load();
  }, [load]);

const respond = async (id, status) => {
  try {
    await api.put(
      `/appointments/${id}/respond`,
      { status }
    );

    await load();

    setMsg(
      status === 'accepted'
        ? 'Request accepted.'
        : 'Request rejected.'
    );
  } catch (e) {
    setMsg(getError(e));
  }
};

  const openChat = (appointmentId) => {
    navigate(`/dashboard/messages?appointmentId=${appointmentId}`);
  };

  const openVideoCall = (appointment) => {
    const room = appointment.room || `dailygram-${appointment._id}`;
    const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(room)}`;
    window.open(jitsiUrl, '_blank', 'noopener,noreferrer');
  };

  const renderBodyContent = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-3 justify-center text-slate-500 py-16 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <Spinner />
          <span className="text-sm font-medium"> Loading appointments… </span>
        </div>
      );
    }
    if (!items.length) {
      return (
        <Empty
          icon="📭"
          title={isMentor ? 'No pending requests' : 'No appointments yet'}
          text={isMentor ? 'New learner requests will appear here.' : 'Accepted appointments will appear here.'}
        />
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((appointment) => {
          const otherPerson = isMentor ? appointment.learnerId : appointment.mentorId;
          const personName = otherPerson?.name || 'User';
          const personEmail = otherPerson?.email || '';
          const firstInitial = personName.charAt(0).toUpperCase();
          const isPending = appointment.status === 'pending';
          const isAccepted = appointment.status === 'accepted';
          return (
            <article key={appointment._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4 transition-all hover:border-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold rounded-full flex items-center justify-center text-sm flex-shrink-0" aria-hidden="true">
                  {firstInitial}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">
                    {personName}
                  </h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {personEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-y border-dashed border-slate-200/80 py-2.5 text-xs">
                <span className="text-slate-500"> Skill:{' '} <strong className="text-slate-900 font-semibold"> {appointment.skill} </strong> </span>
                <span className="text-slate-500 flex items-center gap-1.5"> Status:{' '} <strong className={` px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isPending ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : isAccepted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-red-50 text-red-700 border border-red-200/60'} `}> {appointment.status} </strong> </span>
              </div>
              {isPending && isMentor && (
                <div className="flex gap-2">
                  <button onClick={() => respond(appointment._id, 'accepted')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-2xs cursor-pointer">
                    Accept
                  </button>
                  <button onClick={() => respond(appointment._id, 'rejected')} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-2xs cursor-pointer">
                    Reject
                  </button>
                </div>
              )}
              {isAccepted && (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg text-xs text-slate-600 flex items-center justify-between gap-2">
                    <span> Room: </span>
                    <code className="font-mono font-bold text-indigo-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-3xs truncate">
                      {appointment.room || `dailygram-${appointment._id}`}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openChat(appointment._id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer">
                      💬 Message
                    </button>
                    <button onClick={() => openVideoCall(appointment)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors cursor-pointer">
                      📹 Video Call
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <header>
        <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase block mb-1"> APPOINTMENTS </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900"> {isMentor ? 'Incoming requests' : 'Your sessions'} </h1>
        <p className="text-slate-500 mt-1 text-sm leading-relaxed">
          {isMentor ? 'Accept or reject learner requests.' : 'Your accepted mentor appointments appear here.'}
        </p>
      </header>
      <main className="w-full">
        {renderBodyContent()}
      </main>
      <Toast
        message={msg}
        type={msg.includes('accepted') || msg.includes('rejected') ? 'success' : 'error'}
        onClose={() => setMsg('')}
      />
    </div>
  );
}
