const { Server } = require('socket.io');
const Message = require('./Modules/Message');
const Appointment = require('./Modules/Appointment');

const onlineusers = Object.create(null);
let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(v => v.trim()) : '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User Connected:', socket.id);

        socket.on('register', (userId) => {
            if (!userId) return;
            onlineusers[String(userId)] = socket.id;
            socket.userId = String(userId);
        });

        socket.on('sendMessage', async (data, callback) => {
            try {
                const { appointmentId, senderId, text } = data || {};
                if (!appointmentId || !senderId || !text?.trim()) {
                    return callback?.({ success: false, message: 'appointmentId, senderId and text are required' });
                }

                const appointment = await Appointment.findById(appointmentId);
                if (!appointment) return callback?.({ success: false, message: 'Appointment not found' });

                const sender = String(senderId);
                const learner = String(appointment.learnerId);
                const mentor = String(appointment.mentorId);
                if (sender !== learner && sender !== mentor) {
                    return callback?.({ success: false, message: 'Unauthorized' });
                }
                if (appointment.status !== 'accepted') {
                    return callback?.({ success: false, message: 'Chat is available only for accepted appointments' });
                }

                const newMessage = await Message.create({
                    appointmentId,
                    senderId,
                    text: text.trim()
                });
                const populatedMessage = await newMessage.populate('senderId', 'name');
                const receiverId = sender === learner ? mentor : learner;

                if (onlineusers[receiverId]) {
                    io.to(onlineusers[receiverId]).emit('receiveMessage', populatedMessage);
                }
                socket.emit('receiveMessage', populatedMessage);
                callback?.({ success: true, message: populatedMessage });
            } catch (err) {
                console.error('sendMessage error:', err);
                callback?.({ success: false, message: 'Unable to send message' });
            }
        });

        socket.on('disconnect', () => {
            if (socket.userId && onlineusers[socket.userId] === socket.id) {
                delete onlineusers[socket.userId];
            }
        });
    });

    return io;
}

function getIO() {
    if (!io) throw new Error('Socket.IO has not been initialized');
    return io;
}

module.exports = { initSocket, getIO, onlineusers };
