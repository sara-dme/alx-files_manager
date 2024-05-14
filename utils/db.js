import { MongoClient } from 'mongodb';
 


class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;
    //create a mongodb client
    MongoClient.connect(url, { useUnifiedTopology: true}, (err, client) => {
    if (!err) {
      this.dbClient = client.db(database);
    } else {
        console.log(err.message);
        this.dbClient = false;
     }
    });
  }
    // check if the connection to MongoDB is alive
    isAlive() {
        return !!this.dbClient;
    }

    //get the num of doc in the users collection
    async nbUsers() {
      const userCount = this.dbClient.collection('users').countDocuments();
        return userCount;
     }

    //get the nb of doc in the files collection
    async nbFiles() {
     
        const filesCount = this.dbClient.collection('files').countDocuments();
        return filesCount;
    
    }
}

export default new DBClient();