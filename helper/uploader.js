const multer = require('multer')
const fs = require('fs')

module.exports = {
    uploader(destination, fileNamePrefix){
        var defaultPath = './public'

        const storage = multer.diskStorage({
            destination : (req, file, cb) => {
                const dir = defaultPath + destination
                if(fs.existsSync(dir)){
                    console.log(dir, 'ada');
                    cb(null, dir)
                }else {
                    fs.mkdir(dir,{recursive:true}, err => cb(err, dir))
                    console.log(cb, ' destination func');
                    
                }
            },

            filename: (req, file, cb) => {
                let originalname = file.originalname
                let ext = originalname.split('.')
                var d = new Date()
                var middlePrefix = d.getFullYear()+d.getDate().toString()+'_'+d.getMinutes()
                let filename = fileNamePrefix + Date.now() + '.' + ext[ext.length-1]
                // let filename = fileNamePrefix + req.user.id + middlePrefix + '.' + ext[ext.length-1]
                cb(null, filename) 
                console.log('filename func \n');
                console.log(middlePrefix)
                // console.log(req.user.id);
                console.log(cb);
                console.log(ext);
                console.log(fileNamePrefix);
            }
        })

        const imageFilter = (req, file, cb) => {
            const ext = /\.(jpg|JPG|jpeg|png|PNG|gif|pdf|doc|docx|xlsx|mp4|mp3)$/;
            if (!file.originalname.match(ext)) {
                return cb(new Error('Format file tidak didukung'), false);
            }
            cb(null, true);
        };

        return multer({
            storage,
            fileFilter: imageFilter
        });
    }
}