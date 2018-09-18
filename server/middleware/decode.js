// Decode jwt token
import jwt from 'jsonwebtoken';

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

const decode = (token) => {
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject(e);
  }

  const user = Object.assign({}, { _id: decoded._id, accountType: decoded.role });

  return user;
};

export default decode;
