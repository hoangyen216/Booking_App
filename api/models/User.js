const mongoose = require('mongoose');
const {Schema} = mongoose;
const UserSchema = new Schema({
    name: String,
    email: {type:String, unique:true },
    password: String,
});

//Tao model có tên UserModel dựa trên UserSchema.
const UserModel =mongoose.model('User', UserSchema);
//Sử dụng module.exports để xuất model UserModel ra bên ngoài, 
//cho phép các file JavaScript khác import và sử dụng model này.
module.exports = UserModel;