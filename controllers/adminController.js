const { default: mongoose } = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;
const path = require("path");
const { v4: uuid } = require("uuid");

const Category = require("../models/categorySchema");
const Product = require("../models/productSchema");
const User = require("../models/userSchema");

module.exports = {
  AdminLogin: (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store')
      res.render("admin/login", { admin: true, adminLogin: true });
    } catch (error) {
      console.error(error);
    }
  },
  adminLoginWithData: (req, res) => {
    try {
      const { username, password } = req.body;
      if (
        username == process.env.USERNAME &&
        password == process.env.PASSWORD
      ) {
        res.setHeader('Cache-Control', 'no-store')
        res.status(200).json({ok:true})
      }
    } catch (error) {
      console.error(error);
    }
  },
  adminPanel: (req, res) => {
    User.aggregate([
      {
        $group: {
          _id: "$status",
          user: { $push: "$$ROOT" }
        },
      },
      {

        $project: {
          "count_user": { $size: "$user" }
        }
      }
    ]).then(users => {
      console.log(users);
      Product.count({}, (err, productCount) => {
        User.count({}, (err, allUsers) => {
          Category.count({}, (err, allCategories) => {
            Product.aggregate([
              {
                $lookup:
                {
                  from: "categories",
                  localField: "category",
                  foreignField: "name",
                  as: "category"
                }
              },
              {
                $unwind: "$category"
              },
              {
                $match: {
                  quantity: { $lt: 10 }
                }
              }
            ]).then(result => {
              res.setHeader('Cache-Control', 'no-store')
              res.render('admin/admin_pannel', { admin: true, users, allUsers, productCount, allCategories, limitedProduct: result.length, adminPannel: true })
            })
          })
        })
      })
    })
  },
  getAllUsers: (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store')
      User.find().then((users) => {
        res.setHeader('Cache-Control', 'no-store')
        res.render("admin/listUser", { admin: true, users });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  getSingleUSer: (req, res) => {
    const { id } = req.params;
    console.log(id);
    User.findById(id).then((user) => {
      res.setHeader('Cache-Control', 'no-store')
      res.render("admin/singleUser", { admin: true, user });
    });
  },
  addProduct: (req, res) => {
    const { mainImage, subImages } = req.files;
    const { product, price, discount, description, quantity, category, size } = req.body;

    const productName = uuid();
    let mainImageSavingPath = `__${product}_${productName}.jpg`
    const imageBasePath = path.join(__dirname, `../public/image/productImages/`);
    const subImageArr = []

    if (!mainImage) {
      console.log('main image not found')
      res.status(406).join({ ok: false, msg: "you must renderadd main image", err: "main image" });
    } else {
      if (!product || !price || !discount || !description || !quantity || !category) {
        console.log('some fields not found')
        res.status(406).json({
          ok: false,
          msg: "you must add main image",
          err: "field required",
        });
      } else {


        mainImage.mv(imageBasePath + mainImageSavingPath, err => {
          if (err) {
            console.log(err);
          } else {
            if (subImages?.length >= 0) {
              for (let img of subImages) {
                let productName = uuid();
                let subImageSavingPath = `__${product}_${productName}.jpg`
                subImageArr.push(subImageSavingPath)
                img.mv(imageBasePath + subImageSavingPath, (err) => {
                  if (err) {
                    console.log(err);
                  } else {

                  }

                })
              }
            }

            new Product({
              name: product,
              price,
              discount,
              discountedPrice: price - (price * discount / 100),
              discription: description,
              quantity,
              category,
              mainImage: mainImageSavingPath,
              itemSubImages: subImageArr,
            }).save().then(data => {
              res.status(200).json({ ok: true, msg: 'product added' })
            }).catch(err => {
              console.log(err.code);
              if (err.code == 11000) {
                res.status(409).json({ ok: false, err: 'duplicate', msg: Object.keys(err.keyValue)[0] })
              }
            });


          }
        })
      }
    }
  },
  deleteProduct: (req, res) => {
    const { id } = req.body;
    Product.deleteOne({ _id: id }).then(result => {
      res.status(200).json({ ok: true })
    })
  },
  getAddProductPage: (req, res) => {
    Category.find({}).then((result) => {
      res.setHeader('Cache-Control', 'no-store')
      res.render("admin/addProduct", { admin: true, categories: result,addProduct:true });
    });
  },
  getCategoryPage: (req, res) => {
    Category.aggregate([
      {
        $lookup: {
          from: 'products',
          foreignField: 'category',
          localField: 'name',
          as: 'products'
        }
      },
      {
        $project: {
          productSize: { $size: '$products' },
          name: 1,
          time: null
        }
      }
    ]).then(result => {
      result.reverse()
      Category.count((err, count) => {
        let lesthan = 0
        let NA = 0
        for (const obj of result) {
          if (obj.productSize == 0) {
            NA++
          }
          if (obj.productSize > 0 && obj.productSize < 10) {
            lesthan++
          }
          obj.time = new Date(mongoose.Types.ObjectId(obj._id).getTimestamp().getTime() + 60 * 1000).toLocaleTimeString();
        }
        res.render('admin/category', { result, count, limitedCategoryCount: lesthan, NA, admin: true })
      })
    })
  },
  addCategory: (req, res) => {
    try {
      const { category } = req.body;
      if (category) {
        new Category({
          name: category,
        })
          .save()
          .then((data) => {
            res.status(200).json({ ok: true, data });
          })
          .catch((err) => {
            console.log(err.message);
            res.status(200).json({ ok: false, msg: "category already exists" });
          });
      } else {
        res.status(406).json({ ok: false, smg: "category name is invalid" });
      }
    } catch (error) {
      console.log(error.message);
    }
  },
  deleteCategory: (req, res) => {

  },
  deleteMultipleCategory: (req, res) => {
    const { categoryArr } = req.body
    console.log(categoryArr);
    categoryArr.forEach(element => {
      Category.deleteOne({ name: element }).then(response => {
        // console.log(response);
      })
    });
    res.status(200).json({ ok: true })
  },
  userBlockAndUnblock: (req, res) => {
    const { id } = req.body
    User.updateOne({ _id: ObjectId(id) }, [{ $set: { "status": { $not: "$status" } } }]).then((data) => {
      res.status(200).json({ ok: true, msg: 'updated successfully' })
    }).catch(err => {
      console.log(err);
    })
  },
  getCategoryProduct: (req, res) => {
    Product.find({ category: req.params.id }).then(products => {
      console.log(products);
    })
  },
  getAllProducts: (req, res) => {
    Product.find({}).then(products => {
      res.setHeader('Cache-Control', 'no-store')
      res.render('admin/product', { admin: true, products })
    })
  },
  viewSingleProduct: (req, res) => {
    Product.findById(req.params.id).then(product => {
      Category.find({ name: { $ne: product.category } }).then(category => {
        res.setHeader('Cache-Control', 'no-store')
        res.render('admin/editProduct', { admin: true, product, category })
      })
    })
  }
}