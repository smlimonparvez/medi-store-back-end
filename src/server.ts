import "dotenv/config";
import app from "./app";
import config from "./config";
import prisma from "./config/prisma";

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(config.port, () => {
      console.log(`🚀 MediStore server running on http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();