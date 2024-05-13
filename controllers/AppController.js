import redisClient from "../utils/redis";
import dbClient from "../utils/db";

const AppController = {
   getStatus : (req , res) => {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    res.status(200).json({ redis: redisAlive, db: dbAlive });
    },
    getStats: async (req, res) => {
        try {
          const userTotal = await db.nbUsers();
          const filesTotal = await db.nbFiles();
        res.status(200).json({ users: userTotal, files: filesTotal });
        } catch (error) {
            console.error("Error fetching stats:", error);
            res.status(500).send("Internal Server Error");
        }
    }
}
export default AppController;
