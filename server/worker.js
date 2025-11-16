import 'dotenv/config' ;
import { Worker } from 'bullmq';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

const openai_api_key = process.env.OPENAI_API_KEY

const worker = new Worker('file-upload-queue', 
    async (job) => {

        /*
        path data.path
        read the pdf from path
        chunk the pdf
        call the openai embedding model for every chunk
        store the chunk in qdarnt db
        */
        console.log('worker started...');
        const data=JSON.parse(job.data);
        // console.log('job', job.data)  ;
        // console.log('path', data.path);
        const loader = new PDFLoader(data.path);
        // console.log('loader',loader);
        const docs = await loader.load();
        // console.log("docs:",docs);
        // const client = new QdrantClient({ url: `http://localhost:6333` });
        const embeddings = new OpenAIEmbeddings({
            model:'text-embedding-3-small',
            apiKey: openai_api_key
        });
        const vectorStore = await QdrantVectorStore.fromExistingCollection( 
            embeddings, 
            {
                url: 'http://localhost:6333',
                collectionName: "pdf-docs",
            });
        await vectorStore.addDocuments(docs);
        console.log('all docs added to vector  store');
    },
    { concurrency : 100,
        connection: {
            host:'localhost',
            port:'6379'
        }
    },
);