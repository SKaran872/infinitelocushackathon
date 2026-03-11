require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Document = require("./models/Document");

async function testShare() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const users = await User.find().limit(2);
    if (users.length < 2) {
      console.log("Not enough users to test sharing.");
      process.exit(0);
    }

    const sender = users[0];
    const userToShare = users[1];

    let document = await Document.findOne({ owner: sender._id });
    if (!document) {
      document = new Document({
        title: "Test Share Doc",
        owner: sender._id,
      });
      await document.save();
    }

    console.log(`Simulating share from ${sender.username} to ${userToShare.username}`);

    if (!userToShare.messages) {
      userToShare.messages = [];
    }
    
    // Testing the exact logic from documents.js
    console.log("Attempting push...");
    userToShare.messages.push({
      senderName: sender.username,
      documentId: document._id,
      documentTitle: document.title,
      content: `${sender.username} has shared the document "${document.title}" with you.`
    });
    console.log("Push successful, attempting save...");
    
    await userToShare.save();
    console.log("Save successful!");

    // cleanup
    userToShare.messages.pop();
    await userToShare.save();
    
  } catch (err) {
    console.error("Test Error Caught:", err);
  } finally {
    process.exit(0);
  }
}

testShare();
