const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Return JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user.id, username, email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    // Return JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET api/auth/messages
// @desc    Get user messages/notifications
// @access  Private
router.get("/messages", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("messages");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    // Sort messages by createdAt descending (newest first)
    const sortedMessages = user.messages.sort((a, b) => b.createdAt - a.createdAt);
    res.json(sortedMessages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   PUT api/auth/messages/:messageId/read
// @desc    Mark a message as read
// @access  Private
router.put("/messages/:messageId/read", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const message = user.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    message.isRead = true;
    await user.save();

    res.json({ msg: "Message marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
