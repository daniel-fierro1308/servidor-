var express = require('express'); 
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var cloudinary = require('cloudinary');
var method_override = require('method-override');
var app_password = 12345678;
var Schema = mongoose.Schema;


cloudinary.config({
cloud_name: "dux7okyak",
api_key: "322479874994774",
api_secret:"bHUezJeM3YRGlkz5--GgKFvbW74"
});

var app = express();

mongoose.connect("mongodb://localhost/servidor");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: './uploads'}));
app.use(method_override("_method"));
// definir el schema de nuestros productos
var productSchemaJSON = {
	title:String,
	description:String,
	imageUrl: String,
	pricing: Number
};

var productSchema = new Schema(productSchemaJSON);

productSchema.virtual("image.url").get(function(){
	if (this.imageUrl === "" || this.imageUrl==="data.png") {
		return "default.jpg";
	}	
	return this.imageUrl;

});

var Product = mongoose.model("Product", productSchema);

app.set("view engine","jade");

app.disabled('view cache');

app.use(express.static("public"));

app.get('/',function(req,res){

res.render("index");

});

app.get('/index.jade',function(req,res){
res.render("index");

});


app.get('/contacto.jade',function(req,res){
res.render("contacto");
});

app.get('/menu',function(req,res){	
Product.find(function(err,document){
if (err) {console.log(err);}

res.render("menu/index", { products: document })
	});
});

app.put("/menu/:id", function(req,res){

	if(req.body.password == app_password){		
		var data = {
	title: req.body.title,
	description: req.body.description,
	imageUrl: 'data.png',
	pricing: req.body.pricing
};

if (req.files.hasOwnProperty("image_avatar")){
cloudinary.uploader.upload(req.files.image_avatar.path,
 function(result){
 data.imageUrl = result.url;

Product.update({"_id": req.params.id},data, function(product){
res.redirect("/menu");

});

 });	

}else{
	Product.update({"_id": req.params.id},data, function(product){
res.redirect("/menu");
});
}

}else{
res.redirect("/");
}
});

app.get("/menu/edit/:id", function(req,res){
	var id_producto = req.params.id;
	console.log(id_producto);
	Product.findOne({"_id": id_producto},function(err,producto){
console.log(producto);
res.render("menu/edit",{product:producto});
	});

});


app.post("/admin",function(req,res){
if(req.body.password == app_password) {
Product.find(function(err,document){
if (err) {console.log(err);}

res.render("admin/index", { products: document })
	});	

}else{
res.redirect("/");
}

});

app.get("/admin",function(req,res){
	res.render("admin/form");

});


app.post("/menu",function(req,res){
if (req.body.password == app_password) {

var data = {
	title: req.body.title,
	description: req.body.description,
	pricing: req.body.pricing
}

var product = new Product(data);

if (req.files.hasOwnProperty("image_avatar")) {
cloudinary.uploader.upload(req.files.image_avatar.path,
 function(result){
 	product.imageUrl = result.url;
	 product.save(function(err){
	 console.log(result);	
	res.redirect("/menu");
	});
 
 }
 );

}
else{
	product.save(function(err){
	 console.log(product);	
	res.redirect("/menu");
	});
}

}else {
	res.render("menu/error");
}


});


app.get("/menu/new",function(req,res){
res.render("menu/new");
});

app.get("/menu/delete/:id", function(req,res){
	var id = req.params.id;

	Product.findOne({"_id": id  },function(err,producto){
	res.render("menu/delete",{producto: producto});	
	});
});

app.delete("/menu/:id", function(req,res){
var id = req.params.id;

if (req.body.password == app_password) {
Product.remove({"_id":id},function(err){
if (err) {console.log(err);}
res.redirect("/menu")
});
}else{
	res.redirect("/menu")
}
});

app.listen(8080,function(){
	console.log("Esperando respuesta en el puerto 8080");
});