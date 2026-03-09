const express = require('express');
const cors = require('cors');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const invoiceRoutes = require('./routes/invoices');
const paymentRoutes = require('./routes/payments');
const recoveryRoutes = require('./routes/recoveryActions');
const statsRoutes = require('./routes/stats');
const errorHandler = require('./middleware/errorHandler');

const swaggerDoc = YAML.load(path.join(__dirname, 'swagger', 'swagger.yaml'));

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/recovery-actions', recoveryRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => res.json({ ok: true, name: 'Recouvra+' }));


app.use(errorHandler);

module.exports = app;
