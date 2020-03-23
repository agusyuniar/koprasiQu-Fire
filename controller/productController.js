const {myDB} = require('../database')
const fs = require('fs')
const { uploader } = require('../helper/uploader')




module.exports = {
    getAllProduct: (req,res) => {
        /*----------------script ini pending sementara--------------------*/
        // const script = `select p.id,p.nama_product,p.deskripsi,
        // json_arrayagg(json_object('size',s.size,'stock',stock,'harga',harga)) as variant,
        // json_arrayagg(json_object('img',pi.img_path, 'id',pi.id, 'product_id',pi.product_id)) as images
        // from  products p 
        // left join product_img pi
        // on p.id = pi.product_id 
        // left join sizes s
        // on s.product_id = pi.product_id and pi.id=s.id
        // group by p.id
        // `
        const script = `select p.*,
        json_arrayagg(json_object('img',pi.img_path, 'id',pi.id)) as images
        from products p
        left join product_img pi
        on p.id = pi.product_id
        group by p.id;`

        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal memuat product'})
            console.log(results);

            res.status(200).send(results)                
            // const script2` = ``
        })
    },
    getProductById: (req,res) => {
        // console.log('Params: ',req.params);
        
        const script = `select p.*,
        json_arrayagg(json_object('img',pi.img_path, 'id',pi.id)) as images
        from products p
        left join product_img pi
        on p.id = pi.product_id
        where p.id = ${myDB.escape(req.params.id)};`

        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal memuat product'})
            
            var images = JSON.parse(results[0].images)
            var final_result = ({...results[0],images})
            console.log(final_result);
            // console.log(images);
            
            res.status(200).send(final_result)        
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

            // const script = `insert into products (nama_product,deskripsi)values(${myDB.escape(req.body.nama_product)},${myDB.escape(req.body.deskripsi)})`
            // myDB.query(script,(err,results)=>{
            const script = `insert into products set ?`
            myDB.query(script,req.body,(err,results)=>{
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

                    
                    var insertData = []
                    if(!image){
                        return insertData.push([`${path}/default/default.jpg`,data.product_id])
                    }

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
        console.log('reqDiterima: ',req);
        
        const script = `update products set ? where id = ${myDB.escape(req.body.id)}`
        myDB.query(script,req.body,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal edit product',err})
            res.status(200).send({message:'berhasil mengubah product',results})
        })
    },
    deleteProduct: (req, res) => {
        
        const script = `delete from products where id = ${myDB.escape(req.params.id)}`
        myDB.query(script, (err, results) => {
            if (err) return res.status(500).send({ message: 'gagal menghapus product', err })
            
            const scriptIMG = `delete from product_img where product_id = ${myDB.escape(req.params.id)}`
            myDB.query(scriptIMG, (err, results1) => {
                console.log('IMGres: ',results1);
                if (err) return res.status(500).send({ message: 'gagal menghapus product', err })

                // fs.unlinkSync('./public' + results[0].profil_img)

                res.status(200).send({ message: 'product berhasil dihapus', results })
            })
        })
    },

    addToParentCart:(req,res) => {
        console.log('reqDiterima: \n',req.body);
        req.body.transaction_time=0
        const script = `select * from cart where product_id = ${myDB.escape(req.body.product_id)} and id_ortu = ${myDB.escape(req.body.id_ortu)} and checkout = 0`
        myDB.query(script,(err,results)=>{
            console.log(err);
            console.log(results.length);
            
            if (err) return res.status(500).send({ message: 'gagal akses product', err })
            if(results.length==0){
                // var {transaction_id, id_murid, checkout, method, virtaulaccount, paid, finish, transaction_time}=req.body
                // transaction_id, id_murid, checkout, method, virtaulaccount, paid, finish, transaction_time = 0
                const script1 = `insert into cart set ?`
                myDB.query(script1, req.body, (err,results1)=>{
                    console.log(err);
                    
                    if (err) return res.status(500).send({ message: 'gagal menambah cart', err })
                    
                    res.status(200).send(results1)
                })
            }else{
                newTotal = parseInt(results[0].total) + parseInt(req.body.total)
                const script1 = `update cart set total= ${newTotal} where product_id = ${myDB.escape(req.body.product_id)} and id_ortu = ${myDB.escape(req.body.id_ortu)}`
                myDB.query(script1, (err,results1)=>{
                    if (err) return res.status(500).send({ message: 'gagal menambah cart', err })
                    
                    res.status(200).send(results1)
                })
            }
        })
    },
    getCartbyParent:(req,res)=>{
        console.log('idMasuk: ',req.params);
        const script = `select * from cart where id_ortu = ${myDB.escape(req.params.id)} AND checkout = 0`
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal ambil cart',err})
            res.status(200).send(results)
        })
    },
    deleteCartbyId:(req,res)=>{
        console.log('idMasuk: ',req.params);
        const script = `delete from cart where id = ${myDB.escape(req.params.id)}`
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal delete cart',err})
            res.status(200).send(results)
        })
    },
    cartCheckOut:(req,res)=>{
        console.log('reqMasuk: ',req.body);
        const script = `UPDATE cart SET id_murid = ${myDB.escape(req.body.id_murid)} WHERE id_ortu = ${myDB.escape(req.body.id_ortu)} and product_id = ${myDB.escape(req.body.product_id)} and checkout = 0`
        myDB.query(script,req.body,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal checkout cart',err})
            res.status(200).send(results)
        })
    },
    makeOrderCheckout:(req,res)=>{
        console.log('reqMskOrder: ',req.body);
        var d = new Date()
        
        var trx_date = d.getDate().toString() + '-' + d.getMonth().toString() + '-' + d.getFullYear().toString() + ' / ' + d.getHours().toString() + ':' + d.getMinutes().toString()
        console.log(trx_date);
            
        const script = `UPDATE cart SET 
                transaction_id = ${myDB.escape(req.body.trx_id)}, 
                virtualaccount = ${myDB.escape(req.body.va)}, 
                method=${myDB.escape(req.body.method)} ,
                transaction_time = "${trx_date}" ,
                checkout = 1
                WHERE id_ortu = ${myDB.escape(req.body.id_ortu)} and checkout = 0 
                `
        myDB.query(script, req.body, (err,results)=>{
            if(err) return res.status(500).send({message:'checkout Failed',err})

            // res.status(200).send(results)
            res.status(200).send({message:'Checkout success',results})
        })
    },
    getTransaction:(req,res)=>{
        console.log('idMasuk: ',req.params);
        const script = `select * from cart where id_ortu = ${myDB.escape(req.params.id)} AND checkout = 1`
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal ambil cart',err})
            res.status(200).send(results)
        })
    },
}