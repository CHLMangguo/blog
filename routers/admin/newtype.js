 // 导入express
const express = require("express");

// 实例化router
const router = express.Router();

// 导入数据库相关内容
const mysql = require("../../config/db.js");

// 分类查看页面
router.get("/",function(req,res,next){

	// 从数据库中查询相关数据

	mysql.query("select * from newstype order by sort desc",function(err,data){
		if (err) {
			return "";
		}else{
			// 加载页面
			res.render("admin/type/index.html",{data:data});
		}
	});
	
});

// 分类的添加页面
router.get("/add",function(req,res,next){
	// 加载添加页面
	res.render("admin/type/add.html");
});

// 分类的添加操作
router.post("/add",function(req,res,next){
	// 接收参数
	let {name,keywords,description,sort} = req.body;

	// 将数据插入到数据库中
	mysql.query("insert into newstype(name,keywords,description,sort) value(?,?,?,?)",[name,keywords,description,sort],function(err,data){
		// 判断是否错误
		if (err) {
			return "";
		}else{
			// 判断是否执行成功
			if (data.affectedRows==1) {
				res.send("<script>alert('添加成功');location.href='/admin/type'</script>");
			}else{
				res.send("<script>alert('添加失败');history.go(-1)</script>");
			}
		}

	})

});

// 分类的修改页面
// 修改页面

router.get("/edit",function(req,res,next){
	// 获取用户需要修改的数据
	let id = req.query.id;
	// 从数据库中查询相关数据
	mysql.query("select * from newstype order by sort desc",function(err,data){
		if (err) {
			return "";
		}else{
			// 查询修改文章对应数据
			mysql.query("select * from newstype where id = "+id,function(err,data2){
				if (err) {
					return "";
				}else{
					// 加载修改页面
					res.render("admin/type/edit.html",{data:data,newData:data2[0]});
				}
			});
		}
	});
	

});
router.post("/edit",function(req,res,next){
	//接受表单数据
	let{id,name,keywords,description,sort} = req.body;
	mysql.query("update newstype set name= ? , keywords=? , description=? , sort=?  where id = ?",[name,keywords,description,sort,id],function(err,data){
		if (err) {
			return "";
		}else{
			// 判断影响行数
			if (data.affectedRows==1) {
				
				res.send("<script>alert('修改成功');location.href='/admin/type';</script>");
			}else{
				res.send("<script>alert('修改失败');history.go(-1);</script>");

			}
		}

	});

});
// 无刷新删除数据

router.get("/ajax_del",function(req,res,next){
	// 接受到删除的数据

	let {id} = req.query;

	// 删除数据
	mysql.query("delete from newstype where id = "+id,function(err,data){
		if (err) {
			return "";
		}else{
			if (data.affectedRows==1) {

				res.send("1");

			}else{
				res.send("0");
			}
		}
	});
});

// 无刷新的修改排序

router.get("/ajax_sort",function(req,res,next){
	// 接受数据
	let {id,sort} = req.query;

	// 数据的修改
	mysql.query("update newstype set sort = ? where id = ?",[sort,id],function(err,data){
		// 判断是否执行成功
		if (err) {
			return "";
		}else{
			if (data.affectedRows==1) {
				res.send("1");
			}else{
				res.send("0");	
			}
		}
	});
});

module.exports = router;
