const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
import dbClient from '../utils/db';
import redisClient from '../utils/redis';  
import { ObjectId } from 'mongodb';
const mime = require('mime-types');



const upload = process.env.FOLDER_PATH || '/tmp/files_manager';


class FilesController {
    static async postUpload(req, res) {

      const token = req.header('X-Token');
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!token) return res.status(401).json({ error: 'Unauthorized' });
      const { name, type, isPublic = false, data } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing name"});
      }
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: "Missing type"});
      }
      if (!data && type !== 'folder') {
        return res.status(400).json({ error: "Missing data"});
      }
      let parentId = req.body.parentId || '0';
      if (parentId !== '0') {
        const parentFile = await dbClient.dbClient.collection('files').findOne({_id: parentId });
        if (!parentFile) {
            return res.status(400).json({ error: "Parent not found"});
        }
        if (parentFile.type !== 'folder') {
            return res.status(400).json({ error: "Parent is not a folder"})
        }
      }
      parentId = parentId !== '0' ? ObjectId(parentId) : '0';

      const fileData = {
        userId: ObjectId(userId),
        name,
        type,
        parentId: parentId !== '0' ? ObjectId(parentId) : '0',
        isPublic: isPublic || false,
      };
      
      if (type === 'folder') {
        const newfolder = await dbClient.dbClient.collection('files').insertOne({
          userId, name, type, isPublic: isPublic || false, parentId,});
        fileData.parentId = parentId === '0' ? 0 : ObjectId(parentId);
        return res.status(201).json({ id: newfolder.insertedId, ...fileData });
      }
      const filePath = `${upload}/${uuidv4()}`;
      fileData.localPath = filePath;
      const insertedFile = await dbClient.dbClient.collection('files').insertOne(fileData);
      res.status(201).json(insertedFile.ops[0]);
    };

    static async getShow(req, res) {
        const token = req.header('X-Token');
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const fileId = req.params.id;
        const file = await dbClient.dbClient.collection('files').findOne({ _id: fileId, userId });
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

        const files = await dbClient.dbClient.collection('files')
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
         const file = await dbClient.dbClient.collection('files').findOne({ _id: fileId, userId });
         if (!file) {
             return res.status(404).json({ error: 'Not found' });
        }

         await dbClient.dbClient.collection('files').updateOne({ _id: fileId }, { $set: { isPublic: true } });

        res.status(200).json({ ...file, isPublic: true });
    }
    static async putUnpublish(req, res) {
        const token = req.header('X-Token');
        const userId = await redisClient.get(`auth_${token}`);
         if (!userId) {
             return res.status(401).json({ error: 'Unauthorized' });
         }

        const fileId = req.params.id;
        const file = await dbClient.dbClient.collection('files').findOne({ _id: fileId, userId });
         if (!file) {
              return res.status(404).json({ error: 'Not found' });
            }

        await dbClient.dbClient.collection('files').updateOne({ _id: fileId }, { $set: { isPublic: false } });

        res.status(200).json({ ...file, isPublic: false });
    }
    static async getFile(req, res) {
        try {
            const { id } = req.params;

            const file = await dbClient.dbClient.collection('files').findOne({ _id: id });

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