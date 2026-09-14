import jwt from 'jsonwebtoken';

const generateToken = (res, userId, rememberMe = true, req = null) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '7d' : '1d' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '1d' }
  );

  const host = req ? (req.headers?.host || (typeof req.get === 'function' ? req.get('host') : '') || '') : '';
  const isProductionDomain = process.env.NODE_ENV === 'production' && host.includes('sweettreeon.com');

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && isProductionDomain,
    sameSite: 'lax',
    ...(isProductionDomain && { domain: '.sweettreeon.com' })
  };

  if (rememberMe) {
    res.cookie('token', accessToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  } else {
    res.cookie('token', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);
  }

  return accessToken;
};

export default generateToken;
