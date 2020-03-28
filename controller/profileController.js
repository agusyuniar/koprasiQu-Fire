const { uploader } = require('../helper/uploader')
const { myDB } = require('../database')
const fs = require('fs')
const { createJWTtoken } = require('../helper/jwt')

module.exports = {
    editProfileImage: (req,res) => {
        // console.log(req.params.id);
        
        var iduser = req.params.id
        var script = `select profil_img FROM orangtua WHERE id=${myDB.escape(iduser)}`
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send(err,' script 1 edit PP')
            
            if(results.length>0){
                const path = '/image/profile'
                const upload = uploader(path, 'POS').fields([{ name: 'image'}]);
                
                upload(req,res,(err)=>{
                    if(err) return res.status(500).json({message:'Upload failed !', error: err.message})
                    
                    const {image} = req.files;
                    
                    const data = {profil_img: path + '/' + image[0].filename}
                    console.log('log dlm edit \n',image);
                    console.log('after update\n',results[0].profil_img)
                    
                    scriptEdit = `UPDATE orangtua SET ? WHERE id=${myDB.escape(iduser)}`
                    myDB.query(scriptEdit,data,(err,results1)=>{
                        if(err) {
                            fs.unlinkSync('./public' + path + '/' + results[0].filename) //unsync dari gambar lama
                            return res.status(500).send(err)
                        }
                        
                        if(!path=='/image/profile/deafult/avatar.png'){
                            fs.unlinkSync('./public' + results[0].profil_img)
                            // res.status(200).send(results1)
                        }
                        res.status(200).send(results1)

                          
                    })
                })
            }
        })
    },
    editStudentProfileImage: (req,res) => {
        // console.log(req.params.id);
        
        var iduser = req.params.id
        var script = `select profil_img FROM murid WHERE id=${myDB.escape(iduser)}`
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send(err,' script 1 edit PP')
            
            if(results.length>0){
                const path = '/image/profile'
                const upload = uploader(path, 'POS').fields([{ name: 'image'}]);
                
                upload(req,res,(err)=>{
                    if(err) return res.status(500).json({message:'Upload failed !', error: err.message})
                    
                    const {image} = req.files;
                    
                    const data = {profil_img: path + '/' + image[0].filename}
                    console.log('log dlm edit \n',image);
                    console.log('after update\n',results[0].profil_img)
                    
                    scriptEdit = `UPDATE murid SET ? WHERE id=${myDB.escape(iduser)}`
                    myDB.query(scriptEdit,data,(err,results1)=>{
                        if(err) {
                            fs.unlinkSync('./public' + path + '/' + results[0].filename) //unsync dari gambar lama
                            return res.status(500).send(err)
                        }
                        
                        if(!path=='/image/profile/deafult/avatar.png'){
                            fs.unlinkSync('./public' + results[0].profil_img)
                            // res.status(200).send(results1)
                        }
                        res.status(200).send(results1)

                          
                    })
                })
            }
        })
    }
}