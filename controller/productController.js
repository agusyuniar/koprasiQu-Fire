const {myDB} = require('../database')

module.exports = {
    getAllProduct: (req,res) => {
        const script = `select * from products`
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal memuat product'})
            res.status(200).send(results)
        })
    },

    addProduct: (req,res) => {
        const script = `select * from products where nama_product = ${myDB.escape(req.body.nama_product)}`
        myDB.query(script,(err,results)=>{
            if(err) return res.status(500).send({message:'gagal memuat product',err})
            if(results.length>0){
                return res.status(500).send({message:'Nama produk sudah ada!'})
            }

            const script = `insert into products set ?`
            myDB.query(script,req.body,(err,results)=>{
                if(err) return res.status(500).send({message:'gagal menambah product',err})
                res.status(200).send({message:'Tambah produk berhasil',results})
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