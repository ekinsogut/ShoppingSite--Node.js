const express = require('express');
const router = express.Router();

const isAdmin = require("../middleware/isAdmin");
const csrf = require("../middleware/csrf");

const adminController = require('../controllers/admin');

//----------------------------------------------------------------------------
router.get('/products', csrf ,isAdmin ,adminController.getProducts);
//----------------------------------------------------------------------------
router.get('/add-product', csrf ,isAdmin ,adminController.getAddProduct);
//----------------------------------------------------------------------------
router.post('/add-product', csrf ,isAdmin ,adminController.postAddProduct);
//----------------------------------------------------------------------------
router.get('/products/:productid', csrf ,isAdmin , adminController.getEditProduct);
//----------------------------------------------------------------------------
router.post('/products', csrf ,isAdmin ,adminController.postEditProduct);
//----------------------------------------------------------------------------
router.post('/delete-product', csrf ,isAdmin ,adminController.postDeleteProduct);
//----------------------------------------------------------------------------
router.get('/add-category', csrf ,isAdmin ,adminController.getAddCategory);
//----------------------------------------------------------------------------
router.post('/add-category', csrf ,isAdmin ,adminController.postAddCategory);
//----------------------------------------------------------------------------
router.get('/categories', csrf ,isAdmin ,adminController.getCategories);
//----------------------------------------------------------------------------
router.get('/categories/:categoryid', csrf ,isAdmin ,adminController.getEditCategory);
//----------------------------------------------------------------------------
router.post('/categories', csrf ,isAdmin ,adminController.postEditCategory);
//----------------------------------------------------------------------------
router.post('/delete-category', csrf ,isAdmin ,adminController.postDeleteCategory);
//----------------------------------------------------------------------------

module.exports = router;   