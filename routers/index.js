// 导入express

let express = require("express");

// 实例化路由类

let router = express.Router();

// 导入文件处理模块

const fs = require("fs");


const crypto = require('crypto');
// 导入数据库相关模块

const mysql = require("../config/db.js");



const multer = require("multer");
const upload = multer({dest:"tmp/"});

const uploads = require("../common/uploads.js");
// 导入moment模块

const moment = require("moment");
const page = require("../common/page.js");
// 前台首页

router.get('/',function(req,res,next){
	// 读取网站配置相关数据'
	let webConfigData = fs.readFileSync(__dirname+"/../config/webConfig.json");
	let webConfig = JSON.parse(webConfigData.toString());
	let p = req.query.p ? req.query.p :1;

	let size = 5; 

	// 读取分类信息

	mysql.query("select * from newstype order by sort desc",function(err,data){
		// 判断是否失败
		if (err) {
			return "";
		}else{
			// 读取轮播图信息

			mysql.query("select * from banner order by sort desc",function(err,data2){
				if (err) {
					return "";
				}else{
					
					// 查询最新发布的文章
					
								mysql.query("select news.*,newstype.name tname from news,newstype where news.cid = newstype.id order by news.id desc",function(err,data3){
									if (err) {
										return "";
									}else{
										data3.forEach(item=>{
											item.time = moment(item.time*1000).format("YYYY-MM-DD HH:mm:ss");
										})
										
											
										// 热门文章
										mysql.query("select * from news order by num desc limit 5",function(err,data4){
											if (err) {
												return "";
											}else{

												data4.forEach(item=>{
													item.time = moment(item.time*1000).format("YYYY-MM-DD");
												})
												// 加载首页
												res.render("home/index.html",{
													webConfig:webConfig,
													typeData:data,
													sliderData:data2,
													newsData:data3,
													hotData:data4,
													user:req.session.YzmMessageUsername
												});

											}
										});
										
										
										
									}
								});
							
					
					
				}
			});
			
		}
	});
	
});

// 前台分类页

router.get('/list',function(req,res,next){

	let id = req.query.id;
	// 读取网站配置相关数据'
	let webConfigData = fs.readFileSync(__dirname+"/../config/webConfig.json");
	let webConfig = JSON.parse(webConfigData.toString());
	// 读取分类数据

	mysql.query("select * from newstype order by sort desc",function(err,data){
		if (err) {
			return "";
		}else{
			// 获取当前分类信息
			let typeInfo = "";
			data.forEach(item=>{
				if (item.id == id) {
					typeInfo=item;
				};
			});

			// 查询分类对应的新闻信息

			mysql.query("select * from news where cid = ? order by id desc",[id],function(err,data2){
				if (err) {
					return "";
				}else{

					data2.forEach(item=>{
						item.time = moment(item.time*1000).format("YYYY-MM-DD");
					});
					// 分类下的热们新闻
					mysql.query("select * from news where cid = ? order by num desc",[id],function(err,data3){
						if (err) {
							return "";
						}else{
							data3.forEach(item=>{
								item.time = moment(item.time*1000).format("YYYY-MM-DD");
							});
							// 加载首页
							res.render("home/list.html",{
								webConfig:webConfig,
								typeData:data,
								typeInfo:typeInfo,
								newsData:data2,
								hotData:data3
							});
						}
					});
					
				}
			});
			
		}
	});
});


// 前台新闻详情页
router.get('/news',function(req,res,next){
	let id = req.query.id;
	// 读取网站配置相关数据'
	let webConfigData = fs.readFileSync(__dirname+"/../config/webConfig.json");
	let webConfig = JSON.parse(webConfigData.toString());
	// 加载分类数据
	
	mysql.query("select * from newstype order by sort desc",function(err,data){
		if (err) {
			return "";
		}else{
			
			//加载对应文章数据
			mysql.query("select news.*,newstype.name from news,newstype where news.cid = newstype.id and news.id = "+id,function(err,data2){
				if(err){
					return "";
				}
				else{
					
					data2.forEach(item=>{
								item.time = moment(item.time*1000).format("YYYY-MM-DD HH:mm:ss");
							});
					mysql.query("select * from comment where news_id= "+id,function(err,data3){
						if(err){
							return "";
						}
						else{
							data3.forEach(item=>{
								item.time = moment(item.time*1000).format("YYYY-MM-DD HH:mm:ss");
							});
							
							res.render("home/news.html",{
							webConfig:webConfig,
							typeData:data,
							newsData:data2[0],
							commentData:data3,
							user:req.session.YzmMessageUsername

						});
						}
					})
					
				}
			})
			
				
		}
	})
	
	
});

// 前台登录页面

router.get('/login',function(req,res,next){

	res.render("home/login.html");
});
//denglupanding
router.post('/login',function(req,res,next){

	//接受数据
	let {username,password} = req.body;
	if(username){
		if(password){
			// 密码加密
			let md5 = crypto.createHash('md5');
			password = md5.update(password).digest('hex');
			// 判断数据库中是否存在该用户
			mysql.query("select * from user where username = ? and password = ? and status = 0",[username,password],function(err,data){
				
				if (err) {
					return ""
				}else{

					if (data.length) {
						req.session.YzmMessageIsAdmin = true;
						req.session.YzmMessageUsername = data[0].username;
						res.send("<script>alert('登录成功');location.href='/'</script>");

					}else{
						res.send("<script>alert('登录失败');location.href='/'</script>");
					}
				}
			});
		}
		else{
			res.send("<script>alert('请输入密码');location.href='login'</script>");
		}

	}
	else{
		res.send("<script>alert('请输入用户名');location.href='login'</script>");
	}
});



// 前台注册页面

router.get('/reg',function(req,res,next){

	res.render("home/reg.html");
});

//注册提交页面
router.post('/check',function(req,res,next){
	let {username,password,repassword} = req.body;
	if(username){
		if(password){
			if(password == repassword){
				mysql.query("select * from user where username = ?",[username],function(err,data){
					if(err){
						return "";
					}
					else{
						// 判断该用户名是否注册
							if (data.length==0) {
								// 没有注册，我们需要插入数据
								// 当前时间戳
								let time = Math.round((new Date().getTime())/1000);
								// 密码加密
								let md5 = crypto.createHash('md5');
								password = md5.update(password).digest('hex');

								mysql.query("insert into user(username,password,status,time) value(?,?,?,?)",[username,password,0,time],function(err,data){
									// 判断
									if (err) {
										return "";
									}else{
										// 判断是否执行成
										if (data.affectedRows==1) {
											res.send("<script>alert('注册成功');location.href='login'</script>");

										}else{
											res.send("<script>alert('注册失败');history.go(-1)</script>");

										}
									}
								})
							}else{	
								res.send("<script>alert('该账户名已经注册，请直接登录');location.href='login'</script>");
							}
					}
				})
			}
			else{
				res.send("<script>alert('两次密码不一致');location.href='reg'</script>");
			}
			
			
		}
		else{
			res.send("<script>alert('请输入密码');location.href='reg'</script>");
		}

	}
	else{
		res.send("<script>alert('请输入用户名');location.href='reg'</script>");
	}
	
});
//发表文章

router.get('/article',function(req,res,next){
	// 读取网站配置相关数据'
	let webConfigData = fs.readFileSync(__dirname+"/../config/webConfig.json");
	let webConfig = JSON.parse(webConfigData.toString());
	//读取轮播图
	mysql.query("select * from newstype order by sort desc",function(err,data){
		// 判断是否失败
		if (err) {
			return "";
		}else{
			// 读取轮播图信息

			mysql.query("select * from banner order by sort desc",function(err,data2){

				if (err) {
					return "";
				}else{
					// 热门文章

					mysql.query("select * from news order by num desc limit 5",function(err,data4){
						if (err) {
							return "";
						}else{
							data4.forEach(item=>{
								item.time = moment(item.time*1000).format("YYYY-MM-DD");
							})
							// 加载首页
							res.render("home/article.html",{
								webConfig:webConfig,
								typeData:data,
								sliderData:data2,
								hotData:data4,
								user:req.session.YzmMessageUsername
							});
						}
					});
				}
			})
		}

	})
	
	
});

router.post('/article',upload.single("img"),function(req,res,next){
	
	// 接受文件上传资源
	let imgRes = req.file;
	// 接受表单上传内容
	let {title,keywords,description,info,author,cid,text} = req.body;
	let num = 0;
	let time = Math.round((new Date().getTime())/1000);
	// 进行图片上传
	let img = uploads(imgRes,"news");

	// 进行数据插入

	mysql.query("insert into news(cid,title,keywords,description,img,time,num,info,author,text) value(?,?,?,?,?,?,?,?,?,?)",[cid,title,keywords,description,img,time,num,info,author,text],function(err,data){
		if (err) {
			return "";
		}else{
			if (data.affectedRows==1) {
				res.send("<script>alert('添加成功');location.href='/'</script>");
			}else{
				res.send("<script>alert('添加失败');history.go(-1);</script>");

			}
		}
	});
})
router.get('/author',function(req,res,next){
	res.send('作者首页')
})

router.post('/news',function(req,res,next){
	if(req.session.YzmMessageUsername == null){
		res.send("<script>alert('请登录后评论');location.href='/login'</script>");
	}
	else{
		
		let{user_name,news_id,author_name,comment} = req.body;

		let time = Math.round((new Date().getTime())/1000);
		let status = 0;
		mysql.query("insert into comment(user_name,news_id,text,time,status,author_name) value(?,?,?,?,?,?)",[user_name,news_id,comment,time,status,author_name],function(err,data){
			if(err){
				return "";
			}
			else{
				if (data.affectedRows==1) {
					res.send("<script>alert('评论成功');history.go(-1);</script>");
				}else{
					res.send("<script>alert('评论失败');history.go(-1);</script>");

				}
			}
		})
	}
	
})
//退出系统
router.get('/logout',function(req,res,next){
	req.session.YzmMessageUsername = null;
	res.send("<script>alert('退出成功');location.href='/'</script>");
  
	
});
function checkLogin(req, res, next) {
	if (req.session.YzmMessageUsername == null) {
		res.send("<script>alert('1');location.href='/'</script>");
		res.redirect('/login');
	}
	else{
		res.send("<script>alert('2');</script>");
	}
	next();
}

// function checkNotLogin(req, res, next) {
// 	if (req.session.YzmMessageUsername) {
// 		res.send("<script>alert('已登录');location.href='/'</script>");
//   }
//   next();
// }


module.exports = router;
