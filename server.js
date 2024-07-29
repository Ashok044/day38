const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory data storage
const rooms = [];
const bookings = [];

// Endpoint to create a room
app.post('/rooms', (req, res) => {
  const { name, seats, amenities, pricePerHour } = req.body;

  const room = {
    id: rooms.length + 1,
    name,
    seats,
    amenities,
    pricePerHour,
    bookings: []
  };

  rooms.push(room);
  res.status(201).json({ message: 'Room created successfully', room });
});

// Endpoint to book a room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  // Check if the room exists
  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  // Check if the room is already booked for the given date and time
  const isBooked = room.bookings.some(booking =>
    booking.date === date &&
    ((startTime >= booking.startTime && startTime < booking.endTime) ||
     (endTime > booking.startTime && endTime <= booking.endTime))
  );

  if (isBooked) {
    return res.status(400).json({ message: 'Room is already booked for the given time' });
  }

  const booking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
    roomName: room.name,
    bookingDate: new Date(),
    status: 'Booked'
  };

  bookings.push(booking);
  room.bookings.push(booking);

  res.status(201).json({ message: 'Room booked successfully', booking });
});

// Endpoint to list all rooms with booked data
app.get('/rooms', (req, res) => {
  const roomData = rooms.map(room => ({
    roomName: room.name,
    bookings: room.bookings.map(b => ({
      customerName: b.customerName,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status
    }))
  }));

  res.json(roomData);
});

// Endpoint to list all customers with booked data
app.get('/customers', (req, res) => {
  const customerData = bookings.map(b => ({
    customerName: b.customerName,
    roomName: b.roomName,
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime
  }));

  res.json(customerData);
});

// Endpoint to list how many times a customer has booked a room
app.get('/customer-bookings/:customerName', (req, res) => {
  const { customerName } = req.params;

  const customerBookings = bookings.filter(b => b.customerName === customerName);

  res.json(customerBookings);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
