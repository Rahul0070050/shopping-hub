const { default: mongoose } = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;
const path = require("path");
const genaratecCoupon = require("otp-generator");
const { v4: uuid } = require("uuid");

const Category = require("../models/categorySchema");
const Product = require("../models/productSchema");
const User = require("../models/userSchema");
const Orders = require("../models/orderSchema");
const Coupon = require("../models/couponScheema");

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
        res.status(200).json({ ok: true })
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
      Product.count({}, (err, productCount) => {
        User.count({}, (err, allUsers) => {
          Category.count({}, (err, allCategories) => {
            Orders.count({}, (err, ordersCount) => {
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
                Orders.find({ order_status: "deliverd" }).countDocuments().then(transactions => {
                  res.setHeader('Cache-Control', 'no-store')
                  res.render('admin/admin_pannel', { admin: true, users, ordersCount, transactions, allUsers, productCount, allCategories, limitedProduct: result.length, adminPannel: true })
                })
              })
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
      res.status(406).json({ ok: false, msg: "you must renderadd main image", err: "main image" });
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
          try {

            if (err) {
              console.log(err);
            } else {
              if (Array.isArray(subImages)) {
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
                discountedPrice: Math.round(price - (price * discount / 100)),
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

          } catch (error) {

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
      res.render("admin/addProduct", { admin: true, categories: result, addProduct: true });
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
    // Category.deleteOne()
  },
  deleteMultipleCategory: (req, res) => {
    const { categoryArr } = req.body
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
  },
  getOrders: (req, res) => {
    Orders.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $project: {
          user: 1,
          product: 1,
          payment_methode: 1,
          product_count: 1,
          order_status: 1,
          product_price: 1,
          cancel_order: 1,
          createdAt: 1
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]).then((orders = []) => {
      if(Array.isArray(orders)) {
        try {
          
          for(let val of orders) {
            val.createdAt = new Date(val.createdAt).toLocaleDateString()
          }
          res.render('admin/orderes', { orders, admin: true })
        } catch (error) {
          res.render('admin/orderes', { admin: true })
        }
      } else {
        res.render('admin/orderes', { admin: true })
      }
    })
  },
  cancelOrder: (req, res) => {
    const { id } = req.body;
    Orders.updateOne({ _id: ObjectId(id) }, { $set: { cancel_order: true } }).then(result => {
      res.status(200).json({ ok: true })
    })
  },
  changeOrderStatus: (req, res) => {
    const { id, order_status } = req.body;
    let order_completed_percentage = 0;
    switch (order_status) {
      case "ordered":
        order_completed_percentage = 10
        break;
      case "confirmed":
        order_completed_percentage = 30
        break;
      case "shipped":
        order_completed_percentage = 60
        break;
      case "out for delivery":
        order_completed_percentage = 80
        break;
      case "deliverd":
        order_completed_percentage = 100
        break;
      default:
        order_completed_percentage
        break;
    }
    if (order_status == "deliverd") {
      Orders.updateOne({ _id: ObjectId(id) }, { $set: { order_status, cancel_order: true, order_completed_percentage } }).then(result => {
      })
    } else {
      Orders.updateOne({ _id: ObjectId(id) }, { $set: { order_status, order_completed_percentage } }).then(result => {
      })
    }

  },
  addCoupon: (req, res) => {
    Coupon.find({}).then(coupons => {
            
      for(let val of coupons) {
        coupon.StartsDate = new Date(coupon.StartsDate).toLocaleDateString()
        coupon.EndsDate = new Date(coupon.EndsDate).toLocaleDateString()
      }
      res.render('admin/add-coupon', { coupons, admin: true })
    })
  },
  addCouponCode: (req, res) => {
    const { startsDate, endsDate, cashBack, couponValidUpto, valid_from } = req.body
    let code = genaratecCoupon.generate(8, { upperCaseAlphabets: true, lowerCaseAlphabets: false, specialChars: false, digits: false })
    Coupon.find({ code }).then(coupon => {
      if (coupon) {
        code += genaratecCoupon.generate(8, { upperCaseAlphabets: true, lowerCaseAlphabets: false, specialChars: false, digits: true })
        new Coupon({ user_arr: [], code, StartsDate: new Date(startsDate), EndsDate: new Date(endsDate), cashBack: Number(cashBack), valid_from }).save().then(result => {
          res.status(200).json({ ok: false, result })
        })
      } else {
        new Coupon({ user_arr: [], code, StartsDate: startsDate, EndsDate: endsDate, cashBack: Number(cashBack), valid_from }).save().then(result => {
          res.status(200).json({ ok: false, result })
        })
      }
    })
  },
  deleteCoupon: (req, res) => {
    const { id } = req.body;
    Coupon.deleteOne({ _id: ObjectId(id) }).then(result => {
      res.status(200).json({ ok: true })
    })
  },



  // chart
  getchartData: (req, res) => {
    Orders.aggregate([
      { $match: { "order_status": "deliverd" } },
      {
        $project: {
          date: { $convert: { input: "$_id", to: "date" } }, total: "$product_price"
        }
      },
      {
        $match: {
          date: {
            $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 365))
          }
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$total" }
        }
      },
      {
        $project: {
          month: "$_id",
          total: "$total",
          _id: 0
        }
      }
    ]).then(result => {
      Orders.aggregate([
        { $match: { "order_status": "deliverd" } },
        {
          $project: {
            date: { $convert: { input: "$_id", to: "date" } }, total: "$product_price"
          }
        },
        {
          $match: {
            date: {
              $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 7))
            }
          }
        },
        {
          $group: {
            _id: { $dayOfWeek: "$date" },
            total: { $sum: "$total" }
          }
        },
        {
          $project: {
            date: "$_id",
            total: "$total",
            _id: 0
          }
        },
        {
          $sort: { date: 1 }
        }
      ]).then(weeklyReport => {
        console.log(weeklyReport)
        res.status(200).json({ data: result, weeklyReport })
        console.log(result)
      })
    })
  }
}