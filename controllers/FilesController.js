const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const mime = require('mime-types');



const upload = process.env.FOLDER_PATH || '/tmp/files_manager';


class FilesController {
    static async postUpload(req, res) {

      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { name, type, parentId = 0, isPublic = false, data } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing name"});
      }
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: "Missing type"});
      }
      if (!req.file && type !== 'folder') {
        return res.status(400).json({ error: "Missing data"});
      }
      if (parentId !== 0) {
        const parentFile = await dbClient.fileCollection.findOne({_id: parentId });
        if (!parentFile) {
            return res.status(400).json({ error: "Parent not found"});
        }
        if (parentFile.type !== 'folder') {
            return res.status(400).json({ error: "Parent is not a folder"})
        }
      }
      const fileData = {
        userId,
        name,
        type,
        parentId,
        isPublic,
      };
      if (type === 'file' || type === 'image') {
        const filePath = `${process.env.FOLDER_PATH || '/tmp/files_manager'}/${uuidv4()}`;
      }
      fs.renameSync(req.file.path, filePath);
      fileData.localPath = filePath;
      const insertedFile = await dbClient.filesCollection.insertOne(fileData);
      res.status(201).json(insertedFile.ops[0]);
    };

    static async getShow(req, res) {
        const token = req.header('X-Token');
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const fileId = req.params.id;
        const file = await dbClient.filesCollection.findOne({ _id: fileId, userId });
        if (!file) {
          return res.status(404).json({ error: 'Not found' });
        }

        res.json(file);
    };
      
    static async getIndex(req, res) {

        const token = req.header('X-Token');
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { parentId = '0', page = '0' } = req.query;
        const limit = 20;
        const skip = parseInt(page) * limit;

        const files = await dbClient.filesCollection
          .find({ userId, parentId })
          .limit(limit)
          .skip(skip)
          .toArray();

        res.json(files);
    };
    static async putPublish(req, res) {
        const token = req.header('X-Token');
        const userId = await redisClient.get(`auth_${token}`);
         if (!userId) {
             return res.status(401).json({ error: 'Unauthorized' });
         }

         const fileId = req.params.id;
         const file = await dbClient.filesCollection.findOne({ _id: fileId, userId });
         if (!file) {
             return res.status(404).json({ error: 'Not found' });
        }

         await dbClient.filesCollection.updateOne({ _id: fileId }, { $set: { isPublic: true } });

        res.status(200).json({ ...file, isPublic: true });
    }
    static async putUnpublish(req, res) {
        const token = req.header('X-Token');
        const userId = await redisClient.get(`auth_${token}`);
         if (!userId) {
             return res.status(401).json({ error: 'Unauthorized' });
         }

        const fileId = req.params.id;
        const file = await dbClient.filesCollection.findOne({ _id: fileId, userId });
         if (!file) {
              return res.status(404).json({ error: 'Not found' });
            }

        await dbClient.filesCollection.updateOne({ _id: fileId }, { $set: { isPublic: false } });

        res.status(200).json({ ...file, isPublic: false });
    }
    static async getFile(req, res) {
        try {
            const { id } = req.params;

            const file = await dbClient.filesCollection.findOne({ _id: id });

            if (!file) {
                return res.status(404).json({ error: 'Not found' });
            }

            const isAuthenticated = req.userId; 
            if (!file.isPublic && (!isAuthenticated || file.userId !== req.userId)) {
                return res.status(404).json({ error: 'Not found' });
            }

            if (file.type === 'folder') {
                return res.status(400).json({ error: "A folder doesn't have content" });
            }

            if (!fs.existsSync(file.localPath)) {
                return res.status(404).json({ error: 'Not found' });
            }

            const mimeType = mime.lookup(file.name);

            const fileContent = fs.readFileSync(file.localPath);
            res.set('Content-Type', mimeType);
            res.send(fileContent);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    
}

export default FilesController;