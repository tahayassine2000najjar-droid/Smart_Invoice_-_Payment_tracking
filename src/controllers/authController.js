const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema } = require('../utils/validation');

exports.register = async (req, res) => {
  try {
  
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    generateAndSendToken(user, 201, res);
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la création du compte.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: "Email ou mot de passe manquant." });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects.' });
    }

    generateAndSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur de serveur lors de la connexion.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Impossible de récupérer le profil.' });
  }
};


const generateAndSendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};