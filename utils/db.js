import { MongoClient } from 'mongodb';
 
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    //create a mongodb client
    MongoClient.connect(url, { useUnifiedTopology: true}, (err, client) => {
    if (!err) {
    this.db = client.db(database);
    this.usersCollection = this.db.collection('users');
    this.filesCollection = this.db.collection('files');
    } else {
        console.log(err.message);
        this.db = false;
     }
    });
  }
    // check if the connection to MongoDB is alive
    isAlive() {
        return Boolean(this.db)
    }

    //get the num of doc in the users collection
    async nbUsers() {
      const userCount = this.usersCollection.countDocuments();
        return userCount;
     }

    //get the nb of doc in the files collection
    async nbFiles() {
     
        const filesCount = this.filesCollection.countDocuments();
        return filesCount;
    
    }
}

const dbClient = new DBClient();
module.exports = dbClient;