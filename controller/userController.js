const crypto = require('crypto')
const { myDB } = require('../database')
const { createJWTtoken } = require('../helper/jwt')
const { transporter } = require('../helper/mailer')

const kunci = 'secretrahasia';
module.exports = {
    keepLogin: (req, res) => {
        // console.log(req.user.id)
        res.status(200).send({ ...req.user, token: req.token })
    },
    getParentImgData: (req, res) => {
        console.log('img : ', req.params);

        const script = `select profil_img from orangtua where id = ${myDB.escape(req.params.id)}`

        myDB.query(script, (err, results) => {
            if (err) {
                return res.status(500).send(err)
            }
            res.status(202).send(results)
        })
    },
    getStudentData: (req, res) => {
        const script = `select * from murid`

        myDB.query(script, (err, results) => {
            if (err) return res.status(500).send(err)

            if (results && results.length > 0) {
                let { id, nim, password, firstname, lastname, alamat } = results[0]
                const token = createJWTtoken({ id, nim, password, firstname, lastname, alamat })
                return res.status(200).send({
                    id, nim, password, firstname, lastname, alamat
                })
            } else {
                res.status(202).send(results)
            }
        })
    },
    getParentData: (req, res) => {
        console.log('isi req.body',req.body);
        
        const script = `select username from orangtua where username = ${myDB.escape(req.body.username)}`

        myDB.query(script, (err, results) => {
            if (err) return res.status(500).send(err)

            // if (results && results.length > 0) {
            //     let { id, nim, password, firstname, lastname, alamat } = results[0]
            //     const token = createJWTtoken({ id, nim, password, firstname, lastname, alamat })
            //     return res.status(200).send({
            //         id, nim, password, firstname, lastname, alamat
            //     })
            // } 
            else {
                res.status(202).send(results)
            }
        })
    },
    studentLogin: (req, res) => {
        const { nim, password } = req.body
        let script = `select * from murid where nim = ${myDB.escape(nim)} and password = ${myDB.escape(password)}`

        myDB.query(script, (err, results) => {
            if (err) {
                return res.status(500).send(err)
            }
            res.status(202).send(results)
        })
    },
    parentLogin: (req, res) => {
        let { username, password, id } = req.body;
        password = crypto.createHmac('sha256', kunci)
            .update(password)
            .digest('hex')

        console.log((req.body));

        var script = `select * from orangtua 
                        where username = ${myDB.escape(username)} 
                        and password = ${myDB.escape(password)}`;

        myDB.query(script, (err, results) => {
            if (err) return res.status(500).send({ err, message: 'Database err' })
            if (results.length === 0) {
                return res.status(500).send({ err, message: 'Username or password incorrect' })
            }

            var script2 = `
                    select 
                    o.*,
                    json_arrayAGG(json_object("nim",m.nim, 'nama',concat(m.firstname,' ',m.lastname), 'alamat', m.alamat, 'saldo',m.saldo, 'id_ortu',m.id_ortu)) as anak
                    from orangtua o 
                    left join murid m 
                    on o.email = m.email_ortu  
                        where username = ${myDB.escape(username)} ;
                        `

            myDB.query(script2, (err, results2) => {
                if (err) return res.status(500).send({ err, message: 'Gagal koneksi ke database' })

                if (results2.length === 0) {
                    return res.status(500).send({ err, message: 'Username atau password salah' })
                }
                var anak = JSON.parse(results2[0].anak)
                var json_result = ({ ...results2[0], anak })

                var token = createJWTtoken({ ...json_result })
                res.status(202).send({ ...json_result, token })
                console.log(token);
                console.log({ ...results2[0], anak });

            })
            var d = new Date()
            var dataLogin = d.getDate().toString()+'-'+d.getMonth().toString()+'-'+d.getFullYear().toString()+' / '+d.getHours().toString()+':'+d.getMinutes().toString()
            console.log(dataLogin);
            var scriptEdit = `UPDATE orangtua SET lastlogin = ? WHERE username=${myDB.escape(username)}`
            console.log(scriptEdit);
            myDB.query(scriptEdit,dataLogin,(err,resultsedit)=>{
                if(err) return res.status(500).send({err})
                console.log((resultsedit));

        })
    })
},
    parentRegister : (req, res) => {
        // req.body.joineddate = new Date()

        req.body.password = crypto.createHmac('sha256', kunci)
            .update(req.body.password)
            .digest('hex');
        req.body.role_id = 3
        req.body.profil_img = '/image/profile/default/avatar.png'
        req.body.verified = 0
        let scriptcekemail = `select * from orangtua
                        where email = ${myDB.escape(req.body.email)}`
        myDB.query(scriptcekemail, (err2, results) => {
            if (err2) return res.status(500).send({ message: 'Database Error!', err2, error: true })
            if (results.length > 0) {
                return res.status(500).send({ err2, message: 'Email yang anda masukkan sudah terdaftar!' })
            }
        let scriptcek = `select * from orangtua
                        where username = ${myDB.escape(req.body.username)}`
        myDB.query(scriptcek, (err2, results) => {
            if (err2) return res.status(500).send({ message: 'Database Error!', err2, error: true })
            if (results.length > 0) {
                return res.status(500).send({ err2, message: 'Username yang anda masukkan sudah terdaftar!' })
            }
            let script = `INSERT INTO orangtua SET ? `
            myDB.query(script, req.body, (err, results) => {
                if (err) return res.status(500).send({ message: 'Database Error !', err, error: true })

                var {username,password}=req.body
                var token = createJWTtoken({ username,password })
                var verificationLink = `http://localhost:3000/verify?${token}`
                var mailOption = {
                    from: "Koprasiqu <uu.niar@gmail.com>",
                    to: req.body.email,
                    subject: "Email Confirmation",
                    html: `
                    <h2>Selamat bergabung di aplikasi KOPRASIQU</h2> \n
                    <p>Untuk menggunakan Koprasiqu secara maksimal, silakan klik link dibawah</p>\n
                    <a href='${verificationLink}'>
                        Klik untuk melakukan verifikasi
                    </a>\n\n
                    <p>Jika link diatas tidak dapat dibuka, silakan klik / copy link berikut di browser anda</p>\n
                    ${verificationLink}
                    <p>Anda dapat melihat detail setiap anak yg terdaftar sesuai email anda ketika anda sudah terverifikasi!</p>
                    `
                }
            
                transporter.sendMail(mailOption, (err,results) => {
                    if(err) return res.status(500).send({ message: 'Gagal mengirim email verivikasi!', err, error: false, email: req.body.email })
            
                    res.status(200).send({ status: 'Email verifikasi terkirim', result: results, email: req.body.email })
                })
                res.status(200).send({ result: results, username: req.body.email })
            })
        })
        })
    },
    emailVerification : (req,res) => {
        console.log(req.params);
        
        // res.status(200).send({ ...req.user, token: req.token })
        console.log('requser:',req.user.username);
        console.log('requser:',req.user.password);
        
        let { username, password } = req.user;
        let sqlget =  `select 
                    o.*,
                    json_arrayAGG(json_object("nim",m.nim, 'nama',concat(m.firstname,' ',m.lastname), 'alamat', m.alamat, 'saldo',m.saldo, 'id_ortu',m.id_ortu)) as anak
                    from orangtua o 
                    left join murid m 
                    on o.id = m.id_ortu  
                    where username = ${myDB.escape(username)} and o.password= ${myDB.escape(password)};`;
        myDB.query(sqlget, (err,results) => {
            if(err) return res.status(500).send(err)
            console.log('resultVerif : ',results);
            
            var anak = JSON.parse(results[0].anak)
            var json_result = ({ ...results[0], anak })

            var token = createJWTtoken({ ...json_result })
            // res.status(202).send({ ...results[0], token })
            
            let sqlverified = `update orangtua set verified = 1 where username = ${myDB.escape(username)};`
            myDB.query(sqlverified, (err, results2) => {
                console.log('masuk body: ', json_result, anak, token, results2);
                if(err) return res.status(500).send(err)
                res.status(200).send({ ...json_result, token, results2})
                
                // res.send({message: 'success'})
            })
        })
    },
    resendVerification: (req, res) => {
        var { username, password, email, verified } = req.body
        console.log('resendReq: ',username, email, password);
        var verified = 1
        var token = createJWTtoken({ username, password, verified })
        console.log('resendToken: ',token);
        var verificationLink = `http://localhost:3000/verify?${token}`
        var mailOption = {
            from: "Koprasiqu <uu.niar@gmail.com>",
            to: req.body.email,
            subject: "Email Confirmation",
            html: `
                    <h2>Selamat bergabung di aplikasi KOPRASIQU</h2> \n
                    <p>Untuk menggunakan Koprasiqu secara maksimal, silakan klik link dibawah</p>\n
                    <a href='${verificationLink}'>
                        Klik untuk melakukan verifikasi
                    </a>\n\n
                    <p>Jika link diatas tidak dapat dibuka, silakan klik / copy link berikut di browser anda</p>\n
                    ${verificationLink}
                    <p>Anda dapat melihat detail setiap anak yg terdaftar sesuai email anda ketika anda sudah terverifikasi!</p>
                    `
        }
        
        transporter.sendMail(mailOption, (err, results) => {
            if (err) return res.status(500).send({ message: 'Gagal mengirim email verivikasi!', err, error: false, email: req.body.email })
            console.log(results);
            
            res.status(200).send({ status: 'Email verifikasi terkirim', result: results, email: req.body.email, verified:req.body.verified })
        })
        // res.status(200).send({ result: results, username: req.body.email })
    }
}