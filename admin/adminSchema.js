const mongoose=require('mongoose')

const schema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
},
{
  timestamps:true
})

const admin=mongoose.model('admin',schema)

module.exports=admin