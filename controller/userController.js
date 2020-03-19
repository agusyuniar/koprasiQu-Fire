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



    getStudentData: (req, res) => {
        const script = `select * from murid`
        
        myDB.query(script, (err, results) => {
            if (err) return res.status(500).send(err)
        
            res.status(202).send(results)
            
        })
        //     myDB.query(script, (err, results) => {
        //     if (err) return res.status(500).send(err)

        //     if (results && results.length > 0) {
        //         let { id, nim, password, firstname, lastname, alamat } = results[0]
        //         const token = createJWTtoken({ id, nim, password, firstname, lastname, alamat })
        //         return res.status(200).send({
        //             id, nim, password, firstname, lastname, alamat, token
        //         })
        //     } else {
        //         res.status(202).send(results,token)
        //     }
        // })
    },
    getStudentByIdOrtu: (req, res) => {
        const script = `select * from murid where id_ortu = ${myDB.escape(req.body.id)}`
        
        myDB.query(script, (err, results) => {
            if (err) return res.status(500).send(err)
        
            res.status(202).send(results)
            
        })
    },
    studentLogin: (req, res) => {
        const { nim, password } = req.body
        let script = `select * from murid where nim = ${myDB.escape(nim)} and password = ${myDB.escape(password)}`

        myDB.query(script, (err, results) => {
            if (err) {
                return res.status(500).send(err)
            }
            res.status(202).send({results})
        })
    },



    getParentData: (req, res) => {
        const script = `select 
                        o.*, 
                        m.nim, concat(m.firstname,' ',m.lastname) as nama_murid, m.alamat , 
                        json_arrayagg(json_object('email_ortu',m.email_ortu,"nim",m.nim, 'nama',concat(m.firstname,' ',m.lastname),'profil_img',m.profil_img, 'alamat', m.alamat,'saldo',m.saldo, 'id_ortu',m.id_ortu)) as anak
                        from orangtua o 
                        left join murid m 
                        on o.email = m.email_ortu 
                        group by o.id;
                        `

        myDB.query(script, (err, results) => {
            if (err) return res.status(500).send(err)
            console.log(results);

            res.status(202).send(results)
        })
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
                    json_arrayagg(json_object('email_ortu',m.email_ortu,"nim",m.nim, 'nama',concat(m.firstname,' ',m.lastname),'profil_img',m.profil_img, 'alamat', m.alamat,'saldo',m.saldo, 'id_ortu',m.id_ortu)) as anak
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
            var dataLogin = d.getDate().toString() + '-' + d.getMonth().toString() + '-' + d.getFullYear().toString() + ' / ' + d.getHours().toString() + ':' + d.getMinutes().toString()
            console.log(dataLogin);
            var scriptEdit = `UPDATE orangtua SET lastlogin = ? WHERE username=${myDB.escape(username)}`
            console.log(scriptEdit);
            myDB.query(scriptEdit, dataLogin, (err, resultsedit) => {
                if (err) return res.status(500).send({ err })
                console.log((resultsedit));

            })
        })
    },
    parentRegister: (req, res) => {
        // req.body.joineddate = new Date()

        req.body.password = crypto.createHmac('sha256', kunci)
            .update(req.body.password)
            .digest('hex');
        req.body.role_id = 3
        req.body.profil_img = '/image/profile/default/avatar.png'
        req.body.verified = 0
        let scriptcekemail = `select * from orangtua
                        where email = ${myDB.escape(req.body.email)}`
        myDB.query(scriptcekemail, (err2, resultsemail) => {
            console.log('cekemail: ', resultsemail);
            if (err2) return res.status(500).send({ message: 'Database Error! (email)', err2, error: true })
            if (resultsemail.length > 0) {
                return res.status(500).send({ err2, message: 'Email yang anda masukkan sudah terdaftar!' })
            }

            let scriptcek = `select * from orangtua
            where username = ${myDB.escape(req.body.username)}`
            myDB.query(scriptcek, (err2, resultsuser) => {
                console.log('cekusername ', resultsuser);
                if (err2) return res.status(500).send({ message: 'Database Error! (username)', err2, error: true })
                if (resultsuser.length > 0) {
                    return res.status(500).send({ err2, message: 'Username yang anda masukkan sudah terdaftar!' })
                }
                let scriptregis = `INSERT INTO orangtua SET ? `
                myDB.query(scriptregis, req.body, (err, results) => {
                    console.log('resultsReg :', results);
                    console.log('script :', req.body);

                    if (err) return res.status(500).send({ message: 'Database Error ! (insert)', err, error: true })

                    var { username, password } = req.body
                    var token = createJWTtoken({ username, password })
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

                        res.status(200).send({ status: 'Email verifikasi terkirim', result: results, email: req.body.email })
                    })
                    res.status(200).send({ result: results, username: req.body.email })
                })
            })
        })
    },
    emailVerification: (req, res) => {
        console.log(req.params);

        console.log('requser:', req.user.username);
        console.log('requser:', req.user.password);

        let { username, password } = req.user;
        var script = `select * from orangtua 
        where username = ${myDB.escape(username)} 
        and password = ${myDB.escape(password)}`;

        myDB.query(script, (err, results) => {
            if (err) return res.status(500).send({ err, message: 'Database err' })
            if (results.length === 0) {
                return res.status(500).send({ err, message: 'Username or password incorrect' })
            }

            var script2 = `select 
                        o.*,
                        json_arrayagg(json_object('email_ortu',m.email_ortu,"nim",m.nim, 'nama',concat(m.firstname,' ',m.lastname),'profil_img',m.profil_img, 'alamat', m.alamat,'saldo',m.saldo, 'id_ortu',m.id_ortu)) as anak
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
                let sqlverified = `update orangtua set verified = 1 where username = ${myDB.escape(username)};`
                myDB.query(sqlverified, (err, results2) => {
                    console.log('masuk body: ', json_result, json_result.verified = 1, anak, token, results2);
                    if (err) return res.status(500).send(err)
                    res.status(200).send(json_result, json_result.verified = 1, token, results2)

                    // res.send({message: 'success'})
                })
                var d = new Date()
                var dataLogin = d.getDate().toString() + '-' + d.getMonth().toString() + '-' + d.getFullYear().toString() + ' / ' + d.getHours().toString() + ':' + d.getMinutes().toString()
                console.log(dataLogin);
                var scriptEdit = `UPDATE orangtua SET lastlogin = ? WHERE username=${myDB.escape(username)}`
                console.log(scriptEdit);
                myDB.query(scriptEdit, dataLogin, (err, resultsedit) => {
                    if (err) return res.status(500).send({ err })
                    console.log((resultsedit));
                })
            })
        })
    },
    resendVerification: (req, res) => {
        var { username, password, email } = req.body
        req.body.verified = 1
        console.log('resendReq: ', username, email, password, req.body.verified);
        var token = createJWTtoken({ username, password, ...req.body.verified })
        // console.log('resendToken: ',token);
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

            res.status(200).send({ status: 'Email verifikasi terkirim', result: results, email: req.body.email, verified: req.body.verified })
        })
        // res.status(200).send({ result: results, username: req.body.email })
    },
    parentEdit: (req, res) => {
        console.log('reqEdit: ', req.body);

        let scriptcekemail = `select * from orangtua
                        where email = ${myDB.escape(req.body.email)}`
        myDB.query(scriptcekemail, (err2, resultsemail) => {
            console.log('cekemail: ', resultsemail);
            if (err2) return res.status(500).send({ message: 'Database Error! (email)', err2, error: true })
            if (resultsemail.length > 0) {
                return res.status(500).send({ err2, message: 'Email yang anda masukkan sudah terdaftar!' })
            }

            let scriptcek = `select * from orangtua
                            where username = ${myDB.escape(req.body.username)}`
            myDB.query(scriptcek, (err2, resultsuser) => {
                console.log('cekusername ', resultsuser);
                if (err2) return res.status(500).send({ message: 'Database Error! (username)', err2, error: true })
                if (resultsuser.length > 0) {
                    return res.status(500).send({ err2, message: 'Username yang anda masukkan sudah terdaftar!' })
                }

                const script = `UPDATE orangtua SET ? WHERE id = ${myDB.escape(req.body.id)}`
                console.log('reqBody kirim: ',req.body);
                
                myDB.query(script, req.body, (err, results) => {
                    console.log('err?: ',err);
                    console.log('results?: ',results);
                    
                    if (err) return res.status(500).send({ message: 'Gagal Update', err })

                    res.status(200).send({ message: 'Berhasil Edit', results })
                })
            })
        })
    }
}