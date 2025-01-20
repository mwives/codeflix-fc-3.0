const { config } = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
config({
  path: __dirname + '/config/.env',
});

// Generate a token with the 'admin-catalog' role
const token = jwt.sign(
  {
    realm_access: {
      roles: ['admin-catalog'],
    },
  },
  process.env.JWT_PRIVATE_KEY,
  { expiresIn: '24h', algorithm: 'RS256' },
);

console.log(token);
