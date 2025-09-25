// controllers/auth.controller.js
export const signUp = (req, res) => {
  res.status(201).json({ message: 'User signed up successfully' });
};

export const signIn = (req, res) => {
  res.status(200).json({ message: 'User signed in successfully' });
};

export const signOut = (req, res) => {
  res.status(200).json({ message: 'User signed out successfully' });
};
