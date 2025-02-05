const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const db = require('./config/db.config');
const User = require('./models/User');
const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');
const authRoutes = require('./routes/auth.routes');

app.use(express.json());
app.use(express.static('views'));
app.use('/routes/auth', authRoutes);




io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_room', (room) => {
    socket.join(room);
    io.to(room).emit('user_joined', `User joined ${room}`);
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
    io.to(room).emit('user_left', `User left ${room}`);
  });

  socket.on('send_message', async (data) => {
    const message = new GroupMessage({
      from_user: data.username,
      room: data.room,
      message: data.message
    });
    await message.save();
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('user_typing', `${data.username} is typing...`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});



// Routes
app.post('/api/signup', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    res.json({ user: { username: user.username, firstname: user.firstname, lastname: user.lastname } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});