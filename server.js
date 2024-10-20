import { Server } from "socket.io";
import  express from "express" ;
import { createServer } from "http";
import {  fileURLToPath } from "url";
import { dirname ,join} from "path";
import  {Chess} from "chess.js"


let tempFen ;
const app = express();
const server = createServer(app);
let games = [];
const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url));
let roomId = 0;
let users =[];
let role
let UserN = -1;
let whitename



// access to all directory
app.use(express.static('pub'))


     
     io.on('connection',socket => {

        socket.on('chess', (uname)=>{
            UserN++
            if(UserN%2 !== 0 ){ role = "b"}
            else{
                role = "w"
                whitename = uname
        }
            roomId=Math.floor(UserN/2)
            let user ={
                name : uname ,
                role : role,
                id : socket.id,
                room : roomId
           }
           users.push(user)
           console.log(users)      
           socket.join(roomId)     
           socket.emit('wait', {role , roomId , uname })
           
            
        })
        socket.on('lastcheck', ({uname , roomId})=>{
                        
          
            let temproom ={
                white : whitename,
                black : uname
            }
            console.log(temproom)
            socket.emit('startchess',(temproom))
            socket.to(roomId).emit('startchess',(temproom))
        })
        socket.on("win",(data)=>{
            console.log("winner")
            socket.to(roomId).emit("loser")
            socket.emit("winner")
           
        })


        socket.on('move',(data )=>{
                    
                    socket.to(roomId).emit("servmove", (data.fen))
                    socket.emit("servmove",  (data.fen))
                    
            

            
            
        })


     })



server.listen(2000)



//// functions 
function setTurn ( chess , color ){
    var tokens = chess.fen().split(' ')
    tokens[1] = color
    chess.load(tokens.join(' '));
  }

function filterUsers (users, filter) {
    var result = [];
    for (var prop in filter) {
        if (filter.hasOwnProperty(prop)) {

            //at the first iteration prop will be address
            for (var i = 0; i < filter.length; i++) {
                if (users[i][prop] === filter[prop]) {
                    result.push(users[i]);
                }
            }
        }
    }
    return result;
}
