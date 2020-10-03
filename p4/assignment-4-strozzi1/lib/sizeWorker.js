const { connectToDB, getDBReference } = require('./mongo');
const { connectToRabbitMQ, getChannel } = require('./rabbitmq');
const { ObjectId, GridFSBucket } = require('mongodb');
const Jimp = require('jimp');
const sizeOf = require('image-size');
const crypto = require('crypto');
const { Readable } = require('stream');
const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

const { linkPhoto } = require('../models/photo');



function getDownloadStreamById(id) {
    const db = getDBReference();
    const bucket = new GridFSBucket(db, { bucketName: 'photos' });

    if (!ObjectId.isValid(id)) {
        return null;
    } else {
        return bucket.openDownloadStream(new ObjectId(id));
    }
}



async function addImage(id, dimension, size, image) {
    Jimp.read(image)
        .then(async (image) => {
            if (dimension.width >= size) {
                image.resize(size, Jimp.AUTO);
                image.getBuffer(Jimp.MIME_JPEG, async (err, buf) => {
                    if (err) {
                        console.log(err);
                    } else {
                        
                        const db = getDBReference();
                        const bucket = new GridFSBucket(db, {
                            bucketName: 'photos'
                        });

                        if (dimension.width == size) {
                            size = "orig";
                            console.log("here");
                        }
                        
                        let filename = crypto.pseudoRandomBytes(16).toString('hex') + ".jpg";
                        let metadata = {
                            contentType: "image/jpeg",
                            size: size.toString(),
                            businessid: -1,
                            caption: "",
                            photoid: id
                        };
                        
                        const uploadStream = bucket.openUploadStream(
                            filename,
                            { metadata: metadata }
                        );

                        const readable = new Readable();
                        readable._read = () => {};
                        readable.push(buf);
                        readable.push(null);

                        readable.pipe(uploadStream)
                            .on('finish', async (result) => {
                                console.log("result id " + result._id + ", filename: " + filename);
                                linkPhoto(id, size, filename);
                                
                            });
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
}

connectToDB(async () => {
    await connectToRabbitMQ('photos');
    console.log("SizeWorker Ready.");
    const channel = getChannel();
    channel.consume('photos', msg => {
        
        const id = msg.content.toString();
        const imageChunks = [];

        getDownloadStreamById(id)
            .on('data', chunk => {
                imageChunks.push(chunk);
            })
            .on('end', async () => {
                const image = Buffer.concat(imageChunks);
                const dimension = sizeOf(image);

                addImage(id, dimension, 1024, image);
                addImage(id, dimension, 640, image);
                addImage(id, dimension, 256, image);
                addImage(id, dimension, 128, image);
                addImage(id, dimension, dimension.width, image);
            });

        channel.ack(msg);
    });
});

/*connectToDB(async () => {
    console.log(" -- Size worker connected to DB");
    const db = getDBReference();
    const bucket = new GridFSBucket(db, {
        bucketName: 'photos'
    });
    await connectToRabbitMQ('photos');
    const channel = getChannel();
    channel.consume('photos', msg => {
        console.log("== msg: ", msg);
        const id = msg.content.toString();
        console.log("== id: ", id);
        const imageChunks = [];
        getDownloadStreamById(id)
            .on('data', chunk => {
                imageChunks.push(chunk);
            })
            .on('end', async () => {
                const dimensions = sizeOf(Buffer.concat(imageChunks));
                var allfiles = {};
                var allUrls = {};
                allUrls["orig"] = `media/photos/${id}-orig.jpg`;
                
                if(dimensions.height >= 1024 || dimensions.width >=1024){
                    var sizes = [ 128, 256, 640, 1024];
                    Jimp.read(Buffer.concat(imageChunks), (err, lenna) => {
                        if (err) throw err;
                        sizes.forEach(function (size){
                            var filename = id + '-' + size+'.jpg';
                            allUrls[size.toString()] = `/media/photos/${filename}`
                            lenna
                            .resize(size, size) // resize
                            .quality(60) // set JPEG quality
                            .write(filename); // save
                            //console.log("");
                            const metadata = {
                                filename: filename,
                                orig: `/photos/${id}`,
                                size: size
                            };
                            const uploadStream = bucket.openUploadStream(
                                filename,
                                {metadata: metadata}
                            );
                            fs.createReadStream(image.path).pipe(uploadStream)
                                .on('error', (err) => {
                                    reject(err);
                                })
                                .on('finish', (result) => {
                                    resolve(result._id);
                                    console.log("new image id: ", result._id);
                                });
       
                        });
                      });
                    
                }
                //console.log(`== Dimensions for image ${id}:`, dimensions);
                //const result = await updateImageSizeById(id, dimensions);
            });
            channel.ack(msg);
    });
});*/