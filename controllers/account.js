const User = require("../models/user");
const Login = require("../models/login");
const bcrypt = require("bcrypt");
const sgMail = require('@sendgrid/mail');
const crypto = require("crypto");

//----------------------------------------------------------------------------
sgMail.setApiKey("-----------");
//----------------------------------------------------------------------------
exports.getLogin = (req,res,next) => {
    const errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render("account/login" , {
        path: "/login",
        title: "Login",
        errorMessage: errorMessage
    });
};
//----------------------------------------------------------------------------
exports.postLogin = (req,res,next) => {

    const email = req.body.email;
    const password = req.body.password;

    const loginModel = new Login({
        email: email,
        password: password
    });

    loginModel.validate()
        .then(() => {

            User.findOne({email:email})
                .then(user => {
                    if (!user) {
                        req.session.errorMessage = "Bu mail adresi ile bir kayıt bulunamamıştır!";
                        req.session.save(function (err) {
                            console.log(err);
                            return res.redirect("/login");
                        });
                    }

                    bcrypt.compare(password, user.password)
                        .then(isSuccess => {
                            if (isSuccess) {
                                req.session.user = user;
                                req.session.isAuthenticated = true;
                                return req.session.save(function (err) {
                                    var url = req.session.redirectTo || "/";
                                    delete req.session.redirectTo;
                                    //console.log(err);
                                    res.redirect(url);
                                });
                            }
                            req.session.errorMessage = "False email or password!";
                            req.session.save(function (err) {
                                console.log(err);
                                return res.redirect("/login");
                            });

                        })
                        .catch(err => {
                            console.log(err);
                        })
                })
                .catch(err => console.log(err));
        })
        .catch(err => {

            if (err.name === "ValidationError") {
                let message = "";
                for (field in err.errors) {
                    message += err.errors[field].message + "<br>";
                }

                res.render("account/login" , {
                    path: "/login",
                    title: "Login",
                    errorMessage: message
                });
            }
        });
};
//----------------------------------------------------------------------------
exports.getRegister = (req,res,next) => {
    const errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render("account/register" , {
        path: "/register",
        title: "Register",
        errorMessage: errorMessage
    });
};
//----------------------------------------------------------------------------
exports.postRegister = (req,res,next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email:email})
        .then(user => {
            if (user){
                req.session.errorMessage = "Bu mail adresi ile daha önce kayıt olunmuş!";
                req.session.save(function (err) {
                    console.log(err);
                    return res.redirect("/register");
                });
            }

            return bcrypt.hash(password, 10)
        })
        .then(hashedPassword => {
            console.log(hashedPassword);

            const newUser = new User({
                name: name,
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return newUser.save();
        })
        .then(() => {

            res.redirect("/login");

            const msg = {
                to: email,
                from: 'info@ekinsogut.com',
                subject: 'Hesap oluşturuldu',
                html: '<h1>Hesabınız başarılı bir şekilde oluşturuldu!</h1>',
            };

            sgMail.send(msg);

        }).catch(err => {
            console.log(err.message);
    });
};
//----------------------------------------------------------------------------
exports.getReset = (req,res,next) => {
    const errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;

    res.render("account/reset" , {
        path: "/reset-password",
        title: "Reset Password",
        errorMessage: errorMessage
    });
};
//----------------------------------------------------------------------------
exports.postReset = (req,res,next) => {

    const email = req.body.email;

    crypto.randomBytes(32,(err,buffer) => {
        if (err) {
            console.log(err);
            return res.redirect("/reset-password");
        }

        const token = buffer.toString("hex");

        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    req.session.errorMessage = "Mail adresi bulunamadı!";
                    req.session.save(function (err) {
                        console.log(err);
                        return res.redirect("/reset-password");

                    });
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now()+3600000;

                return user.save();
            }).then(result => {
                res.redirect("/");

                const msg = {
                    to: email,
                    from: 'info@ekinsogut.com',
                    subject: 'Parola Reset',
                    html: `<p>Parolanızı güncellemek için aşağıda ki linke tıklayınız!</p>
                           <p><a href="http://localhost:3000/reset-password/${token}">Reset Password!</a></p>`,
                };
                sgMail.send(msg);

        }).catch(err => {console.log(err) });
    })
};
//----------------------------------------------------------------------------
exports.getNewPassword = (req,res,next) => {

    const errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;

    const token = req.params.token;

    User.findOne({ resetToken: token, resetTokenExpiration: {
        $gt: Date.now() //şimdi ki tarihten daha büyük bi tarih varsa süresi geçmemiş bi tokena sahibiz.
        }
    }).then(user => {
        res.render("account/new-password" , {
            path: "/new-password",
            title: "New Password",
            errorMessage: errorMessage,
            userId: user._id.toString(),
            passwordToken: token

        });

    }).catch(err => {
        console.log(err);
    })
};
//----------------------------------------------------------------------------
exports.postNewPassword = (req,res,next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let _user;

    User.findOne({
        resetToken: token, resetTokenExpiration: {
            $gt: Date.now()
        },
        _id: userId
    }).then(user => {
        _user = user;
        return bcrypt.hash(newPassword,10);
    }).then(hashedPassword => {
        _user.password = hashedPassword;
        _user.resetToken = undefined;
        _user.resetTokenExpiration = undefined;
        return _user.save();
    }).then(() => {
        res.redirect("/login");
    }).catch(err => {
        console.log(err);
    });
};
//----------------------------------------------------------------------------
exports.getLogout = (req,res,next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");

    });
};
//----------------------------------------------------------------------------
exports.getHelp = (req,res,next) => {
    const errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;

    res.render("account/help" , {
        path: "/help",
        title: "Help",
        errorMessage: errorMessage
    });
};
//----------------------------------------------------------------------------
exports.postHelp = (req,res,next) => {
    const io = require('socket.io-client');
    const socket = io.connect("http://localhost:3000", {
        reconnection: true
    });

    socket.on('connect', function () {
        console.log('connected to help page');
    });
};
//----------------------------------------------------------------------------
