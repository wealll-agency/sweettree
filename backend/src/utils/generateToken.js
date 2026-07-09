import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_sweettree_2026_enterprise',
    { expiresIn: '30d' }
  );

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return token;
};

export default generateToken;
