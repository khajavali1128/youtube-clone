import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { raw } from "express";

const storage = new Storage();

const rawVideoBucketName = "kvp1128-ytc-raw-videos";
const processedVideoBucketName = "kvp1128-ytc-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

export function setupDirectories(){
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);

}

export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        // Create the ffmpeg command
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
    .outputOptions("-vf", "scale=-1:360")
    .on("end", () => { 
        console.log('Video processed successfully');
        resolve();
    })
    .on("error", (err) => {
        console.log(`An error occurred: ${err.message}`);
        reject(err);
    })
    .save(`${localProcessedVideoPath}/${processedVideoName}`);    
    });
}

export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
      .file(fileName)
      .download({
        destination: `${localRawVideoPath}/${fileName}`,
      });
  
    console.log(
      `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    );
}

export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
    );

    await bucket.file(fileName).makePublic();

}

export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
  }

export function deleteProcessedVideo(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}


function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if(fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if(err) {
                    console.log(`An error occurred while deleting file ${filePath}`);
                    reject(err);
                } else {
                    console.log(`File ${filePath} deleted`);
                    resolve();
                }
            })
        } else {
            console.log(`File ${filePath} does not exist, skipping the deletion`);
            resolve();
        }
    })
}

function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
      console.log(`Directory created at ${dirPath}`);
    }
  }