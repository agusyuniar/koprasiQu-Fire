const {myDB} = require('../database')
const fs = require('fs')
const { uploader } = require('../helper/uploader')




module.exports = {
    getAllProduct: (req,res) => {
        const script = `select p.id,p.nama_product,p.deskripsi,
        json_arrayagg(json_object('size',s.size,'stock',stock,'harga',harga)) as variant,
        json_arrayagg(json_object('img',pi.img_path, 'id',pi.id, 'product_id',pi.product_id)) as images
        from  products p 
        left join product_img pi
        on p.id = pi.product_id 
        left join sizes s
        on s.product_id = pi.product_id and pi.id=s.id
        group by p.id
        `
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal memuat product'})
            console.log(results);

            res.status(200).send(results)                
            // const script2` = ``
        })
    },

    editImageById:(req,res)=>{
        console.log(req.params.id);
        console.log(req.body.id);
        
        const script = `UPDATE product_img SET WHERE id=${myDB.escape(req.params.id)}`
        myDB.query(script,req.body,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal ambil gbr dari ID'})
            res.status(200).send(results)
        })
    },
    deleteImageById:(req,res)=>{
        const script=`select * from product_img where id = ${myDB.escape(req.params.id)}`
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gambar tdk ada',err})

            script2 = `delete from product_img where id = ${myDB.escape(req.params.id)}`
            myDB.query(script2,(err,results2)=>{
                if(err) return res.status(500).send({message:'gagal delete',err})
                fs.unlinkSync('./public'+results[0].img_path)
                res.status(200).send({message:'Berhasil delete',results2})
            })
        })
    },
    // getAllProduct: (req,res) => {
    //     const script = `select p.*,
    //                     json_arrayagg(json_object('img',pi.img_path, 'id',pi.id)) as images,
    //                     json_arrayagg(json_object('size',size,'stock',stock,'harga',harga)) as variant
    //                     from products p
    //                     left join product_img pi
    //                     on p.id = pi.product_id
    //                     left join sizes s on p.id = s.product_id
    //                     group by p.id;`
    //     myDB.query(script,(err,results)=>{
    //         if(err) return res.status(500).send({message:'gagal memuat product'})
            
    //         // var images = JSON.parse(results[0].images)
    //         // var variant = JSON.parse(results[0].images)
    //         // var resultsIMG = ({...results})
    //         console.log(results);
    //         // console.log(images);
    //         // console.log(variant);
            
    //         res.status(200).send(results)
    //     })
    // },

    addProduct: (req,res) => {
        console.log('dikirim: ',req);
        console.log('bodyKirim: ',req.body);
        
        const script = `select * from products where nama_product = ${myDB.escape(req.body.nama_product)}`
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal memuat product',err})
            if(results.length>0){
                return res.status(500).send({message:'Nama produk sudah ada!'})
            }

            const script = `insert into products (nama_product,deskripsi)values(${myDB.escape(req.body.nama_product)},${myDB.escape(req.body.deskripsi)})`
            myDB.query(script,(err,results)=>{
                if(err) return res.status(500).send({message:'gagal menambah product',err})
                
                // const path = '/image/product'
                // const upload = uploader(path,'PROD').fields([{name:'image'}])
                // upload(req,res,(err)=>{
                //     if(err) return res.status(500).send({message:'add image fail',err})
                    
                //     const {image} = req.files
                //     console.log('isi image: ',image);
                    
                //     var insertData = []
                //     for(var i=0; i<image.length; i++){
                //         insertData.push(`${path}/${image[i].filename}`,req.insertId)
                //     }
                    
                //     const scriptIMG = `INSERT INTO product_img (img_path,product_id) values ?;`
                //     myDB.query(scriptIMG,[insertData],(err,results1)=>{
                //         if(err) return res.status(500).send({message:'upload img gagal',err})
    
                        res.status(200).send({message:'Tambah produk berhasil',results})
                //     })
                // })

            })
        })  
    },
    addProductImage : (req,res) => {
        console.log('fileKirim :',req.files);
        console.log('bodyData :',req.body);

              const path = '/image/product'
                const upload = uploader(path,'PROD').fields([{name:'image'}])
                upload(req,res,(err)=>{
                    if(err) return res.status(500).send({message:'add image fail',err})
                    
                    const {image} = req.files
                    console.log('isi image: ',image);
                    const data = JSON.parse(req.body.data);

                    // console.log(id);
                    
                    var insertData = []
                    for(var i=0; i<image.length; i++){
                        insertData.push([`${path}/${image[i].filename}`,data.product_id])
                    }
                    
                    const scriptIMG = `INSERT INTO product_img (img_path,product_id) values ?;`
                    myDB.query(scriptIMG,[insertData],(err,results1)=>{
                        if(err) return res.status(500).send({message:'upload img gagal',err})

                    res.status(200).send({message:'sukses add image',results1})

                    })
                })
    },
    
    editProduct: (req,res)=> {
        const script = `update products set ? where id = ${myDB.escape(req.params.id)}`
        myDB.query(script,req.body,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal edit product',err})
            res.status(200).send({message:'berhasil mengubah product',results})
        })
    },
    deleteProduct:(req,res)=>{
        const script = `delete from products where id = ${myDB.escape(req.params.id)}`
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal menghapus product',err})
            res.status(200).send({message:'product berhasi dihapus',results})
        })
    }
}