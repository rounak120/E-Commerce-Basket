const express=require('express')
const cors=require('cors')
const path=require('path')
const app=express();
app.use(cors())
const redis=require('redis');
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(bodyParser())
const client=redis.createClient();

client.connect();
app.use(express.static(__dirname));
app.use( '/home', express.static(  __dirname ) );
app.use( '/profile/:email', express.static(  __dirname ) );
app.use( '/cart/:email', express.static(  __dirname ) );


// app.set('views', path.join(__dirname, 'views'));

client.on('connect',()=>{
    console.log("Connected")
})
// client .config("SET", "appendonly", "yes"); 
// client .config("SET", "appendfsync", "everysec");
app.listen(3000,()=>{
    console.log('Listening')
})

app.get('/home',(req,res)=>{
    // client.HDEL('product',"").then(()=>{
    //     console.log("Done");
    // })
    // client.flushAll()
    // client.setEx('name',)
    // const k1='name',k2='age';
    // client.HSET('person',[k1,'rishak',k2,'19']).then(()=>{
    //     console.log("Done")
    // })
    // client.HGET('person',k1).then((res,err)=>{
    //     console.log(res)
    // })
    // client.HGETALL('person').then((res)=>{
    //     console.log(res.age)
    // })
    // console.log()
    // console.log("Hello")
    // res.send("Hello")
    // console.log(__dirname)
    // res.sendFile(__dirname + '/index.html');
    res.render('index',{login:"no",name:""})
})

app.get('/register',async(req,res)=>{
    // res.sendFile(__dirname+'/register.html')
    
    console.log("hi");
    console.log(req.body);
    const username = req.body.name;
    const email = req.body.email;
    let password = req.body.password;
    

    let success = false;
    console.log(req.body);

    res.render('register',{})
})

app.post('/create',(req,res)=>{

    // console.log(req.body);
    client.HEXISTS('user',`${req.body.email}`).then((res1,err)=>{
        if(res1)
        res.json("User exist")
        else{
            client.HSET('user',`${req.body.email}`,[req.body.name,req.body.password]).then(()=>{
                console.log("User created");
                res.render('login')
            })
        }
    })

    
    

})

app.get('/login',(req,res)=>{
    // res.sendFile(__dirname+'/login.html')
    res.render('login',{})
})

app.get('/logout',(req,res)=>{
    console.log('Logout');
    res.render('index',{login:"no",name:""})
    console.log("render");
})

//authentication 
app.post('/auth',(req,res)=>{
    console.log(req.body);
    const data=req.body
    client.HGET('user',`${data.email}`).then(res1=>{
        if(res1){
            console.log(res1);
            var arr=res1.split(',')
            if(data.password!=arr[1]){
                res.json({done:"worng"})
            }else{
                // res.render('index',{login:"yes",name:`${arr[0]}`})
                res.json({done:"done"})

            }
        }else{
           res.json({done:"no"})
        }
    })
})
// after login
app.get("/profile/:email",(req,res)=>{

    const email=req.params.email
    console.log("email ",email);
    client.HGET('user',`${email}`).then(res1=>{
        if(res1){
            console.log("res1 ",res1);
            var arr=res1.split(',')
            // res.json({done:"done"})        
            res.render('index',{login:"yes",name:arr[0]})
        }
    })


})

app.get('/cart/:email',async (req,res)=>{
    // client.setEx('name',)
    // const k1='name',k2='age';
    // client.HSET('person',[k1,'rounak',k2,'19']).then(()=>{
    //     console.log("Done")
    // })
    // client.HGET('person',k1).then((res,err)=>{
    //     console.log(res)
    // })
    const email=req.params.email
    if(!email)res.send("No")
    await client.HGETALL(`${email}`).then((resp)=>{
        // console.log("Hello");
        const obj=Object.keys(resp)
        // console.log(Object.keys(resp));
        var com=[];
        var t=0
        for(var i in Object.keys(resp)){
            var arr=resp[obj[i]].split(',')
            console.log(arr[0],arr[1]);
            arr.push(obj[i]);                    
            t=t+parseInt(arr[1])*parseInt(arr[2])   //arr[1]=price of element  arr[2]=quantity of element
            com.push(arr)
        }
        console.log(com);
        res.render('cart',{obj:com,tot:t})
    })
})

//removing item form cart
app.get('/remove/:email/:id',(req,res)=>{

    const email=req.params.email
    // client.HDEL(`${email}`,`${req.params.id}`).then((r)=>{
    //     console.log(r);
        
    //     res.json(`${req.params.id} removed`)
    // })

    client.HGET(`${email}`,`${req.params.id}`).then(res1=>{
        console.log(res1);
        var arr=res1.split(',')
        var qty=parseInt(arr[2])-1
        console.log(arr[2]);
        console.log(qty);
        if(qty!=0)
        client.HSET(`${email}`,`${req.params.id}`,[arr[0],arr[1],qty]).then(()=>{  //arr[0]=id,,, arr[1]=img url,,,
            console.log("Done")
            res.json(`${req.params.id} decresed`)
        })
        else client.HDEL(`${email}`,`${req.params.id}`).then((r)=>{
            console.log(r);
            
            res.json(`${req.params.id} removed`)
        })
    })
    
})

//adding element into cart
app.post('/add/:email',(req,res)=>{

    console.log(req.body)
    const email=req.params.email
    // const k1='src',k2='price';
    // client.HSET('product',)

    client.HEXISTS(`${email}`,`${req.body.id}`).then(res1=>{
        if(res1){
            client.HGET(`${email}`,`${req.body.id}`).then(res1=>{
                console.log(res1);
                var arr=res1.split(',')
                client.HSET(`${email}`,`${req.body.id}`,[req.body.src,req.body.pri,parseInt(arr[2])+1]).then(()=>{
                    console.log("Done")
                })
            })
        }else{
            client.HSET(`${email}`,`${req.body.id}`,[req.body.src,req.body.pri,1]).then(()=>{
                console.log("Done")
            })
        }
    })
    // client.HGETALL('product').then((res)=>{
    //     console.log(res.src)
    // })
    res.json("done")
})
