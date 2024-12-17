require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT;
const equipmentRoutes = require('./routes/equipmentRoutes');
const userRoutes = require('./routes/userRoutes');
const borrowRecordsRoutes = require('./routes/borrowRecords');
app.use(cors());
app.use(express.json());

app.use('/image_return', express.static('image_return'));
app.use('/image_borrow', express.static('image_borrow'));
app.use('/uploads', express.static('uploads'));
app.use('/api/equipment', equipmentRoutes);
app.use('/api/borrowRecords', borrowRecordsRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
