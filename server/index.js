import 'dotenv/config';
import express from 'express';
import cors  from 'cors';
import multer from 'multer';
import {Queue} from 'bullmq';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI  from 'openai';
import {rateLimit} from 'express-rate-limit';

const openai_api_key=process.env.OPENAI_API_KEY;
const port=process.env.PORT

const client = new OpenAI({
  apiKey : openai_api_key ,
});

const queue= new Queue('file-upload-queue', {
  connection : {
    host: 'localhost',
    port: '6379',
  },
});

const app = express();
app.use(cors());

const limiter = rateLimit({
  windowMs: 1000*60*1,
  max: 2,
  message: 'Too many requests from this IP, please try again after 1 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix} - ${file.originalname}` )
  }
});

// api key
const upload = multer({ storage: storage  })

app.get('/', (req, res)=> {
    return (
        res.json({status:"hello from server"})
    );
});

app.get('/chat', async (req, res)=> {
  console.log(`req: ${req.query.message}`);
  const userQuery= req.query.message;
  const embeddings = new OpenAIEmbeddings({
            model: 'text-embedding-3-small',
            apiKey: openai_api_key,
          });
  const vectorStore = await QdrantVectorStore.fromExistingCollection( 
            embeddings, 
            {
                url: 'http://localhost:6333',
                collectionName: "pdf-docs",
            });
  
  const retriever = vectorStore.asRetriever({
  k: 2,});
  
  const result = await retriever.invoke(userQuery);
  console.log(result);

  const SYSTEM_PROMPT=`
  you are helpful AI assitant who answer the user query based on the available context from PDF file.  
  context:
  ${JSON.stringify(result)}
  `;

  const chatResult = await client.chat.completions.create({
    model : 'gpt-4.1',
    messages : [
      {role : 'system', content : SYSTEM_PROMPT},
      {role : 'user', content : userQuery}
    ],
  }); 
  const chatResultMessage= chatResult.choices[0].message.content;
  return (
    res.json({ message: chatResultMessage, docs : result})
  )
});

app.post('/upload/pdf', upload.single('pdf'), async (req, res)=>{
  // console.log("server file", req.file.originalname);
  // console.log('destination', req.file.destination);
  // console.log('server path', req.file.path);
  // add to queue
  await queue.add(
    'file-ready', 
    JSON.stringify({
    filename: req.file.originalname,
    destination: req.file.destination,
    path: req.file.path,
    })
  );
 return res.json({message:'file uploaded to server and EnQueued successfully'});
});

app.listen(port, ()=> console.log(`server is running on port ${port}`));
