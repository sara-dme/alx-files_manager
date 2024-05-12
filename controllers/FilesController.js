const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../db');
const redisClient = require('../redis');


const router = express.Router();
const upload = multer({ dest: process.env.UPLOAD_DIR || '/tmp/files_manager' });


class FilesController {
    static async postUpload(req, res) {
      // Retrieve user based on the token
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
}

export default FilesController;