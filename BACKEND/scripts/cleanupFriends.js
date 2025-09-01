import mongoose from "mongoose";
import User from "../src/models/User.js";
 // adjust path to your User model

// Replace with your MongoDB connection string
const MONGO_URI = "mongodb+srv://shwetasharmaith_db_user:shweta123@cluster0.jljhnga.mongodb.net/streamify_db?retryWrites=true&w=majority&appName=Cluster0";

async function cleanupFriends() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find();
    console.log(`🔍 Found ${users.length} users`);

    for (const user of users) {
      const cleanedFriends = [];

      for (const friendId of user.friends) {
        const exists = await User.exists({ _id: friendId });
        if (exists) {
          cleanedFriends.push(friendId);
        } else {
          console.log(`🗑 Removing invalid friend ID ${friendId} from user ${user._id}`);
        }
      }

      if (cleanedFriends.length !== user.friends.length) {
        user.friends = cleanedFriends;
        await user.save();
        console.log(`✅ Cleaned friends list for user ${user._id}`);
      }
    }

    console.log("🎉 Cleanup complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

cleanupFriends();
