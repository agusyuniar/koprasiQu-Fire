const { myDB } = require('../database')

module.exports={
    getAllCategory: (req,res) => {
        const query = `select c.id, c.category as categorychild, c.parentId, ca.category as categoryparent
        from categories c
        left join categories ca
        on c.parentId = ca.id;`
        
        myDB.query(query, (err, results) => {
            if (err) {
                return res.status(500).send(err)
            }
            res.status(200).send(results)
        });
    },
    getAllLeafCategory: (req,res) => {
        const query = `SELECT
            c1.id, c1.category
        FROM
            categories c1
                LEFT JOIN
            categories c2 ON c2.parentId = c1.id
        WHERE
            c2.id IS NULL;`
        
        myDB.query(query, (err, results) => {
            if (err) {
                return res.status(500).send(err)
            }

            res.status(200).send(results)
        });
    },
    addCategory: (req,res) => {
        let query = `SELECT id 
                FROM categories 
                WHERE category = ${myDB.escape(req.body.category)};`;
        myDB.query(query, (err,results) => {
            if(err) {
                return res.status(500).send(err)
            }
            
            if(results.length > 0) {
                return res.status(500).send({ message: 'Category name already exist!'})
            }
            
            query = `INSERT INTO categories SET ? ;`

            myDB.query(query, req.body, (err,results) => {
                if(err) {
                    return res.status(500).send(err)
                }

                res.status(200).send(results)
            })
        })    
    },
    editCategory: (req,res) => {
        const query = `UPDATE categories SET ? WHERE id = ${myDB.escape(req.params.id)}`

        myDB.query(query, req.body, (err,results) => {
            if(err) {
                return res.status(500).send(err)
            }

            res.status(200).send(results)
        })
    },
    deleteCategory: (req,res) => {
        const query = `DELETE FROM categories WHERE id = ${myDB.escape(req.params.id)}`;
        
        myDB.query(query,(err,results) => {
            if(err) {
                return res.status(500).send(err)
            }

            res.status(200).send(results)
        })
    },


    getAllProductCat: (req,res) => {
        const query = `select pc.id, pc.categoryId, pc.productId,
            p.nama_product, c.category
            from productcat pc 
            join products p
            on pc.productId = p.id
            join categories c
            on pc.categoryId = c.id;`

        myDB.query(query, (err, results) => {
            if (err) {
                return res.status(500).send(err)
            }

            res.status(200).send(results)
        });
    },
    getAllProductLeafCat: (req,res) => {
        const query = `select pc.id, pc.categoryId, pc.productId,
        p.nama_product, p.deskripsi, p.harga, pi.img_path, c.category
        from productcat pc 
        join products p
        on pc.productId = p.id
        left join product_img pi
        on p.id = pi.product_id
        join categories c
        on pc.categoryId = c.id
        left join categories c2
        on c.id = c2.parentId
        where c2.id is null`

        myDB.query(query, (err, results) => {
            console.log('PrdLeafCat: ',res);
            console.log(err);
            if (err) return res.status(500).send(err)
            
            res.status(200).send(results)
        });
    },
    addProductCat: (req,res) => {
        let query = `WITH RECURSIVE category_path (id, category, parentId) AS
        (
          SELECT id, category, parentId
            FROM categories
            WHERE id = ${req.body.categoryId}
          UNION ALL
          SELECT c.id, c.category, c.parentId
            FROM category_path AS cp JOIN categories AS c
              ON cp.parentId = c.id
        )
        SELECT id FROM category_path;`
        myDB.query(query, (err,results) => {
            console.log('reqnya: ',req.body);
            console.log('errornya: ',err);
            console.log('result: ',results);
            
            if(err) {
                return res.status(500).send(err)
            }
            var data = results.map((item) => {
                return [item.id, req.body.productId]
            })

            query = `INSERT INTO productcat (categoryId,productId) VALUES ? ;`

            myDB.query(query, [data], (err,results) => {
                if(err) {
                    console.log(err);
                    
                    return res.status(500).send(err)
                }

                res.status(200).send(results)
            })
        })
    },
    editProductCat: (req,res) => {
        const query = `UPDATE productcat SET ? WHERE id = ${myDB.escape(req.params.id)}`

        myDB.query(query, req.body, (err,results) => {
            if(err) {
                return res.status(500).send(err)
            }
            res.status(200).send(results)
        })
    },
    deleteProductCat: (req,res) => {
        const query = `DELETE FROM productcat WHERE productId = ${myDB.escape(req.params.id)}`;
        
        myDB.query(query,(err,results) => {
            if(err) {
                return res.status(500).send(err)
            }

            res.status(200).send(results)
        })
    },

    getProductCatByCategory: (req,res) => {
        console.log('masukIDproduct: ',req.params);
        
        const query = `select pc.id, pc.categoryId, pc.productId,
            p.nama_product, c.category
            from productcat pc 
            join products p
            on pc.productId = p.id
            join categories c
            on pc.categoryId = c.id
            where c.id = ${req.params.id}
            ;`

        myDB.query(query, (err, results) => {
            if (err) {
                console.log(err);
                
                return res.status(500).send(err)
            }

            res.status(200).send(results)
        });
    },
}